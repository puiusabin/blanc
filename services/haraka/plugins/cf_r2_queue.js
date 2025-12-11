// Cloudflare R2 Queue Plugin for Haraka
// Email service with quota management, alias support, and optional PGP encryption

var AWS = require("aws-sdk"),
    zlib = require("zlib"),
    util = require('util'),
    async = require("async"),
    stream = require('stream'),
    Transform = require('stream').Transform,
    { v4: uuidv4 } = require('uuid'),
    { PrismaClient } = require("@blanc/database/generated/prisma"),
    { withAccelerate } = require("@prisma/extension-accelerate"),
    { MailParser } = require('mailparser'),
    pgpHandler = require("./pgp_handler"),
    threading = require("./threading");

// Initialize Prisma client with Accelerate extension
var prisma = new PrismaClient().$extends(withAccelerate());

exports.register = function () {
    var plugin = this;

    plugin.logdebug("Initializing Cloudflare R2 Queue");

    var config = plugin.config.get("cf_r2_queue.json");
    plugin.logdebug("Config loaded : " + util.inspect(config));

    // Configure AWS SDK for Cloudflare R2
    AWS.config.update({
        accessKeyId: config.accessKeyId,
        secretAccessKey: config.secretAccessKey,
        region: config.region || 'auto',
        signatureVersion: 'v4'
    });

    plugin.r2Endpoint = config.endpoint;
    plugin.r2Bucket = config.bucket;
    plugin.zipBeforeUpload = config.zipBeforeUpload !== false; // Default true
    plugin.encryptionEnabled = config.encryptionEnabled || false; // Default false
    plugin.requirePGPKeys = config.requirePGPKeys || false; // Default false
    plugin.fileExtension = config.fileExtension || '.eml.gz';
    plugin.copyAllAddresses = config.copyAllAddresses !== false; // Default true

    plugin.loginfo("Cloudflare R2 Queue initialized");
    plugin.loginfo("Bucket: " + plugin.r2Bucket);
    plugin.loginfo("Encryption enabled: " + plugin.encryptionEnabled);
};

/**
 * Hook: rcpt_ok
 * Called after recipient is accepted by rcpt_to plugins
 * Validates user exists, resolves aliases, checks quota
 */
exports.hook_rcpt_ok = function (next, connection, rcpt) {
    var plugin = this;
    var recipientEmail = rcpt.address().toLowerCase();

    plugin.logdebug("Validating recipient: " + recipientEmail);

    // Use async/await pattern wrapped in promise
    (async function() {
        try {
            // First check if this is an alias
            var alias = await prisma.alias.findUnique({
                where: {
                    aliasAddress: recipientEmail,
                    active: true
                },
                include: {
                    targetUser: true
                }
            });

            var user;
            if (alias) {
                user = alias.targetUser;
                plugin.loginfo("Alias resolved: " + recipientEmail + " -> " + user.email);
            } else {
                // Not an alias, check direct user
                user = await prisma.user.findUnique({
                    where: {
                        email: recipientEmail,
                        active: true
                    }
                });
            }

            if (!user) {
                plugin.loginfo("User not found: " + recipientEmail);
                return next(DENY, "User not found");
            }

            if (!user.active) {
                plugin.loginfo("User inactive: " + user.email);
                return next(DENY, "User account inactive");
            }

            // Check quota
            if (user.usedBytes >= user.quotaBytes) {
                plugin.logwarn("Quota exceeded for user: " + user.email +
                    " (used: " + user.usedBytes + ", quota: " + user.quotaBytes + ")");
                return next(DENY, "Mailbox quota exceeded");
            }

            // Store user info in transaction notes for later use in hook_queue
            if (!connection.transaction.notes) {
                connection.transaction.notes = {};
            }
            if (!connection.transaction.notes.recipients) {
                connection.transaction.notes.recipients = {};
            }

            connection.transaction.notes.recipients[recipientEmail] = {
                userId: user.id,
                userEmail: user.email,
                originalRecipient: recipientEmail,
                isAlias: !!alias
            };

            plugin.logdebug("Recipient validated: " + recipientEmail + " -> User: " + user.email);
            return next(OK);

        } catch (error) {
            plugin.logerror("Error validating recipient: " + util.inspect(error));
            return next(DENYSOFT, "Temporary error processing recipient");
        }
    })();
};

/**
 * Hook: queue
 * Called after email DATA is received
 * Parses email, uploads attachments and JSON datagram to R2, stores metadata in database
 */
exports.hook_queue = function (next, connection) {
    var plugin = this;
    var transaction = connection.transaction;

    plugin.logdebug("Processing email for queue with MailParser");

    // Get all validated recipients from rcpt_ok hook
    var recipients = transaction.notes.recipients || {};
    var recipientList = Object.keys(recipients);

    if (recipientList.length === 0) {
        plugin.logerror("No validated recipients found in transaction notes");
        return next(DENYSOFT, "No valid recipients");
    }

    var emailSize = transaction.data_bytes || 0;

    // Process each recipient
    var addresses = plugin.copyAllAddresses ? recipientList : [recipientList[0]];

    async.each(addresses, function (recipientEmail, eachCallback) {
        var recipientInfo = recipients[recipientEmail];

        (async function() {
            try {
                var userId = recipientInfo.userId;
                var userEmail = recipientInfo.userEmail;

                // Generate unique email ID and paths
                var emailId = uuidv4();
                var now = new Date();
                var year = now.getFullYear();
                var month = String(now.getMonth() + 1).padStart(2, '0');

                var datagramPath = userId + "/" + year + "/" + month + "/" + emailId + ".json.gz";

                plugin.logdebug("Parsing email " + emailId + " for user " + userEmail);

                // State accumulation
                var parsedHeaders = null;
                var textBody = '';
                var htmlBody = '';
                var attachmentPromises = [];
                var attachmentMetadata = [];

                // Create MailParser instance
                var parser = new MailParser({
                    streamAttachments: true
                });

                // Event: Headers parsed
                parser.on('headers', function(headers) {
                    parsedHeaders = extractHeaders(headers);
                    plugin.logdebug("Headers parsed for email " + emailId);
                });

                // Event: Body data (text or HTML)
                parser.on('data', function(data) {
                    if (data.type === 'text') {
                        if (data.html) {
                            htmlBody += data.html;
                        }
                        if (data.text) {
                            textBody += data.text;
                        }
                    }
                });

                // Event: Attachment (streaming)
                parser.on('data', function(data) {
                    if (data.type === 'attachment') {
                        var attachmentId = uuidv4();
                        var sanitizedFilename = sanitizeFilename(data.filename);
                        var r2Path = userId + "/" + year + "/" + month + "/" + emailId + "/attachments/" + attachmentId + "_" + sanitizedFilename;

                        plugin.logdebug("Processing attachment: " + data.filename + " -> " + r2Path);

                        // Prepare attachment metadata
                        var metadata = {
                            id: attachmentId,
                            filename: data.filename,
                            mimeType: data.contentType,
                            sizeBytes: data.size || 0,
                            contentId: data.contentId || null,
                            isInline: data.contentDisposition === 'inline',
                            r2Path: r2Path,
                            emailId: emailId
                        };
                        attachmentMetadata.push(metadata);

                        // Stream attachment to R2
                        var uploadPromise = uploadAttachmentToR2(
                            data.content,
                            r2Path,
                            metadata,
                            plugin,
                            userId
                        );
                        attachmentPromises.push(uploadPromise);

                        // Release stream to prevent backpressure
                        data.release();
                    }
                });

                // Event: Parsing complete
                parser.on('end', async function() {
                    try {
                        plugin.logdebug("Parsing complete for email " + emailId);

                        // Wait for all attachments to upload
                        await Promise.all(attachmentPromises);
                        plugin.logdebug("All attachments uploaded for email " + emailId);

                        // Build JSON datagram
                        var datagram = {
                            version: '1.0',
                            emailId: emailId,
                            messageId: parsedHeaders.messageId,
                            userId: userId,
                            headers: parsedHeaders,
                            body: {
                                html: htmlBody || null,
                                text: textBody || null,
                                textAsHtml: null
                            },
                            attachments: attachmentMetadata,
                            sizeBytes: emailSize,
                            receivedAt: now.toISOString(),
                            encrypted: plugin.encryptionEnabled,
                            parsed: {
                                parserVersion: 'mailparser@4.0.0',
                                parsedAt: new Date().toISOString(),
                                warnings: []
                            }
                        };

                        // Encrypt datagram if needed
                        var datagramContent = JSON.stringify(datagram);
                        if (plugin.encryptionEnabled) {
                            var publicKey = await pgpHandler.getUserPublicKey(userId);
                            if (publicKey) {
                                datagramContent = await pgpHandler.encryptData(datagramContent, publicKey);
                                plugin.logdebug("Datagram encrypted for email " + emailId);
                            }
                        }

                        // Compress and upload datagram
                        await uploadDatagramToR2(datagramContent, datagramPath, plugin);
                        plugin.logdebug("Datagram uploaded for email " + emailId);

                        // Compute thread ID using threading algorithm
                        var threadId = await threading.computeThreadId(parsedHeaders, userId, prisma);
                        var isNewThread = false;
                        var threadSubject = parsedHeaders.subject || '(no subject)';

                        if (!threadId) {
                            // No existing thread found - create new one
                            isNewThread = true;
                            threadId = uuidv4();
                            plugin.logdebug("Creating new thread " + threadId + " for email " + emailId);
                        } else {
                            plugin.logdebug("Email " + emailId + " belongs to existing thread " + threadId);
                        }

                        // Build participants list
                        var participants = [];
                        if (!isNewThread) {
                            var existingThread = await prisma.thread.findUnique({
                                where: { id: threadId },
                                select: { participants: true }
                            });
                            participants = threading.mergeParticipants(
                                parsedHeaders,
                                existingThread ? existingThread.participants : []
                            );
                        } else {
                            participants = threading.mergeParticipants(parsedHeaders, []);
                        }

                        // Store in database (atomic transaction)
                        await prisma.$transaction(async function(tx) {
                            // Create or update thread
                            if (isNewThread) {
                                await tx.thread.create({
                                    data: {
                                        id: threadId,
                                        userId: userId,
                                        subject: threadSubject,
                                        rootMessageId: parsedHeaders.messageId,
                                        messageCount: 1,
                                        unreadCount: 1,
                                        hasAttachments: attachmentMetadata.length > 0,
                                        participants: participants,
                                        folder: 'INBOX',
                                        lastMessageAt: now,
                                        firstMessageAt: now
                                    }
                                });
                                plugin.logdebug("Created new thread " + threadId);
                            } else {
                                await tx.thread.update({
                                    where: { id: threadId },
                                    data: {
                                        messageCount: { increment: 1 },
                                        unreadCount: { increment: 1 },
                                        hasAttachments: attachmentMetadata.length > 0 || undefined,
                                        participants: participants,
                                        lastMessageAt: now
                                    }
                                });
                                plugin.logdebug("Updated existing thread " + threadId);
                            }

                            // Create email record
                            await tx.email.create({
                                data: {
                                    id: emailId,
                                    messageId: parsedHeaders.messageId,
                                    userId: userId,
                                    threadId: threadId,
                                    dateReceived: now,
                                    dateSent: parsedHeaders.date ? new Date(parsedHeaders.date) : null,
                                    sizeBytes: BigInt(emailSize),
                                    r2DatagramPath: datagramPath,
                                    hasHtml: !!htmlBody,
                                    hasPlainText: !!textBody,
                                    hasAttachments: attachmentMetadata.length > 0,
                                    attachmentCount: attachmentMetadata.length,
                                    encrypted: plugin.encryptionEnabled,
                                    status: 'STORED',
                                    folder: 'INBOX',
                                    isRead: false
                                }
                            });

                            // Create attachment records
                            if (attachmentMetadata.length > 0) {
                                await tx.attachment.createMany({
                                    data: attachmentMetadata.map(function(att) {
                                        return {
                                            id: att.id,
                                            emailId: emailId,
                                            userId: userId,
                                            filename: att.filename,
                                            mimeType: att.mimeType,
                                            sizeBytes: BigInt(att.sizeBytes),
                                            contentId: att.contentId,
                                            isInline: att.isInline,
                                            r2Path: att.r2Path
                                        };
                                    })
                                });
                            }

                            // Update user quota
                            await tx.user.update({
                                where: { id: userId },
                                data: {
                                    usedBytes: { increment: BigInt(emailSize) }
                                }
                            });
                        });

                        plugin.loginfo("Email " + emailId + " stored successfully for " + userEmail +
                            " (size: " + emailSize + " bytes, " + attachmentMetadata.length + " attachments)");

                        eachCallback(null);

                    } catch (error) {
                        plugin.logerror("Error processing email " + emailId + ": " + util.inspect(error));
                        eachCallback(error);
                    }
                });

                // Event: Parser error
                parser.on('error', function(error) {
                    plugin.logerror("Parser error for email " + emailId + ": " + util.inspect(error));
                    eachCallback(error);
                });

                // Start parsing: pipe message stream into parser
                transaction.message_stream.pipe(parser);

            } catch (error) {
                plugin.logerror("Error processing recipient " + recipientEmail + ": " + util.inspect(error));
                eachCallback(error);
            }
        })();

    }, function (err) {
        if (err) {
            plugin.logerror("Queue failed: " + util.inspect(err));
            next(DENYSOFT, "Email queuing failed, please try again later.");
        } else {
            plugin.loginfo("Email queued successfully to R2");
            next(OK, "Email Accepted.");
        }
    });
};

// Transform Stream Helper Class
var TransformStream = function() {
    Transform.call(this);
};
util.inherits(TransformStream, Transform);

TransformStream.prototype._transform = function(chunk, encoding, callback) {
    this.push(chunk);
    callback();
};

/**
 * Extract headers from MailParser headers object
 * @param {Map} headers - MailParser headers Map
 * @returns {Object} Extracted headers in structured format
 */
function extractHeaders(headers) {
    return {
        from: parseAddress(headers.get('from')),
        to: parseAddressList(headers.get('to')),
        cc: parseAddressList(headers.get('cc')),
        bcc: parseAddressList(headers.get('bcc')),
        replyTo: parseAddress(headers.get('reply-to')),
        subject: headers.get('subject') || '(no subject)',
        date: headers.get('date'),
        messageId: headers.get('message-id'),
        inReplyTo: headers.get('in-reply-to'),
        references: headers.get('references') ? headers.get('references').split(/\s+/) : [],
        priority: headers.get('priority'),
        raw: extractRawHeaders(headers)
    };
}

/**
 * Parse single email address
 * @param {Object} value - MailParser address object
 * @returns {Object|null} {email, name} or null
 */
function parseAddress(value) {
    if (!value || !value.value || value.value.length === 0) return null;
    var parsed = value.value[0];
    return {
        email: parsed.address,
        name: parsed.name || null
    };
}

/**
 * Parse list of email addresses
 * @param {Object} value - MailParser address list object
 * @returns {Array} Array of {email, name} objects
 */
function parseAddressList(value) {
    if (!value || !value.value) return [];
    return value.value.map(function(addr) {
        return {
            email: addr.address,
            name: addr.name || null
        };
    });
}

/**
 * Extract raw headers for storage
 * @param {Map} headers - MailParser headers Map
 * @returns {Object} Raw headers object
 */
function extractRawHeaders(headers) {
    var raw = {};
    headers.forEach(function(value, key) {
        if (typeof value === 'string') {
            raw[key] = value;
        } else if (value && value.text) {
            raw[key] = value.text;
        }
    });
    return raw;
}

/**
 * Sanitize filename for safe storage
 * @param {String} filename - Original filename
 * @returns {String} Sanitized filename
 */
function sanitizeFilename(filename) {
    if (!filename) return 'attachment';
    return filename
        .replace(/[\/\\]/g, '_')
        .replace(/[^\w\s\-\.]/g, '_')
        .substring(0, 200);
}

/**
 * Upload attachment to R2
 * @param {Stream} attachmentStream - Readable stream of attachment data
 * @param {String} r2Path - R2 storage path
 * @param {Object} metadata - Attachment metadata
 * @param {Object} plugin - Haraka plugin instance
 * @param {String} userId - User ID for encryption lookup
 * @returns {Promise} Upload promise
 */
function uploadAttachmentToR2(attachmentStream, r2Path, metadata, plugin, userId) {
    return new Promise(async function(resolve, reject) {
        try {
            var uploadStream = attachmentStream;

            // Encrypt attachment if enabled
            if (plugin.encryptionEnabled) {
                var publicKey = await pgpHandler.getUserPublicKey(userId);
                if (publicKey) {
                    var encryptStream = await pgpHandler.createEncryptionStream(publicKey);
                    uploadStream = attachmentStream.pipe(encryptStream);
                }
            }

            // Create S3 client
            var s3 = new AWS.S3({
                endpoint: plugin.r2Endpoint,
                s3ForcePathStyle: true,
                signatureVersion: 'v4'
            });

            var uploadParams = {
                Bucket: plugin.r2Bucket,
                Key: r2Path,
                Body: uploadStream,
                ContentType: metadata.mimeType,
                Metadata: {
                    filename: metadata.filename,
                    emailId: metadata.emailId || ''
                }
            };

            s3.upload(uploadParams)
                .on('httpUploadProgress', function(evt) {
                    plugin.logdebug("Attachment upload progress: " + r2Path + " - " + evt.loaded + "/" + evt.total);
                })
                .send(function(err, data) {
                    if (err) reject(err);
                    else resolve(data);
                });

        } catch (error) {
            reject(error);
        }
    });
}

/**
 * Upload JSON datagram to R2
 * @param {String} jsonContent - JSON string to upload
 * @param {String} r2Path - R2 storage path
 * @param {Object} plugin - Haraka plugin instance
 * @returns {Promise} Upload promise
 */
function uploadDatagramToR2(jsonContent, r2Path, plugin) {
    return new Promise(function(resolve, reject) {
        try {
            var gzipStream = zlib.createGzip();

            // Convert string to stream
            var bufferStream = new stream.Readable();
            bufferStream.push(jsonContent);
            bufferStream.push(null);

            // Create S3 client
            var s3 = new AWS.S3({
                endpoint: plugin.r2Endpoint,
                s3ForcePathStyle: true,
                signatureVersion: 'v4'
            });

            var uploadParams = {
                Bucket: plugin.r2Bucket,
                Key: r2Path,
                Body: bufferStream.pipe(gzipStream),
                ContentType: 'application/json',
                ContentEncoding: 'gzip',
                Metadata: {
                    version: '1.0'
                }
            };

            s3.upload(uploadParams)
                .on('httpUploadProgress', function(evt) {
                    plugin.logdebug("Datagram upload progress: " + r2Path + " - " + evt.loaded + "/" + evt.total);
                })
                .send(function(err, data) {
                    if (err) reject(err);
                    else resolve(data);
                });

        } catch (error) {
            reject(error);
        }
    });
}

exports.shutdown = function () {
    this.loginfo("Shutting down Cloudflare R2 queue plugin.");
};
