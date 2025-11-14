// Cloudflare R2 Queue Plugin for Haraka
// Email service with quota management, alias support, and optional PGP encryption

var AWS = require("aws-sdk"),
    zlib = require("zlib"),
    util = require('util'),
    async = require("async"),
    Transform = require('stream').Transform,
    { v4: uuidv4 } = require('uuid'),
    { prisma } = require("@blanc/database"),
    pgpHandler = require("./pgp_handler");

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
 * Encrypts (if enabled), uploads to R2, stores metadata in database
 */
exports.hook_queue = function (next, connection) {
    var plugin = this;
    var transaction = connection.transaction;

    plugin.logdebug("Processing email for queue");

    // Get all validated recipients from rcpt_ok hook
    var recipients = transaction.notes.recipients || {};
    var recipientList = Object.keys(recipients);

    if (recipientList.length === 0) {
        plugin.logerror("No validated recipients found in transaction notes");
        return next(DENYSOFT, "No valid recipients");
    }

    // Create S3 client with R2 endpoint
    var s3 = new AWS.S3({
        endpoint: plugin.r2Endpoint,
        s3ForcePathStyle: true,
        signatureVersion: 'v4'
    });

    // Get email metadata
    var fromAddress = transaction.mail_from ? transaction.mail_from.address() : 'unknown';
    var subject = transaction.header.get('subject') || '(no subject)';
    var messageId = transaction.header.get('message-id') || null;
    var emailSize = transaction.data_bytes || 0;

    // Process each recipient
    var addresses = plugin.copyAllAddresses ? recipientList : [recipientList[0]];

    async.each(addresses, function (recipientEmail, eachCallback) {
        var recipientInfo = recipients[recipientEmail];

        (async function() {
            try {
                var userId = recipientInfo.userId;
                var userEmail = recipientInfo.userEmail;

                // Generate unique email ID and R2 path
                var emailId = uuidv4();
                var now = new Date();
                var year = now.getFullYear();
                var month = String(now.getMonth() + 1).padStart(2, '0');

                var r2Path = userId + "/" + year + "/" + month + "/" + emailId + plugin.fileExtension;

                plugin.logdebug("Uploading email to R2: " + r2Path);

                // Create stream pipeline
                var messageStream = transaction.message_stream;
                var streams = [];

                // Add gzip compression
                if (plugin.zipBeforeUpload) {
                    streams.push(zlib.createGzip());
                }

                // Add encryption if enabled
                if (plugin.encryptionEnabled) {
                    var publicKey = await pgpHandler.getUserPublicKey(userId);

                    if (!publicKey) {
                        if (plugin.requirePGPKeys) {
                            throw new Error("No PGP key found for user");
                        } else {
                            plugin.logwarn("No PGP key found for user " + userEmail + ", storing unencrypted");
                        }
                    } else {
                        var encryptStream = await pgpHandler.createEncryptionStream(publicKey);
                        streams.push(encryptStream);
                    }
                }

                // Build pipeline
                var currentStream = messageStream;
                for (var i = 0; i < streams.length; i++) {
                    currentStream = currentStream.pipe(streams[i]);
                }

                // Upload to R2
                var uploadParams = {
                    Bucket: plugin.r2Bucket,
                    Key: r2Path,
                    Body: currentStream
                };

                s3.upload(uploadParams)
                    .on('httpUploadProgress', function (evt) {
                        plugin.logdebug("Upload progress for " + r2Path + ": " + util.inspect(evt));
                    })
                    .send(async function (err, data) {
                        if (err) {
                            plugin.logerror("R2 upload error for " + r2Path + ": " + util.inspect(err));
                            return eachCallback(err);
                        }

                        plugin.logdebug("R2 upload successful: " + r2Path);

                        try {
                            // Store email metadata in database
                            await prisma.email.create({
                                data: {
                                    id: emailId,
                                    userId: userId,
                                    fromAddress: fromAddress,
                                    toAddress: recipientInfo.originalRecipient,
                                    subject: subject,
                                    messageId: messageId,
                                    sizeBytes: BigInt(emailSize),
                                    r2Path: r2Path,
                                    encrypted: plugin.encryptionEnabled,
                                    status: 'STORED'
                                }
                            });

                            // Update user's storage usage
                            await prisma.user.update({
                                where: { id: userId },
                                data: {
                                    usedBytes: {
                                        increment: BigInt(emailSize)
                                    }
                                }
                            });

                            plugin.loginfo("Email stored successfully for " + userEmail +
                                " (size: " + emailSize + " bytes, path: " + r2Path + ")");

                            eachCallback(null);

                        } catch (dbError) {
                            plugin.logerror("Database error: " + util.inspect(dbError));
                            eachCallback(dbError);
                        }
                    });

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

exports.shutdown = function () {
    this.loginfo("Shutting down Cloudflare R2 queue plugin.");
};
