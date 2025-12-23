// PGP Encryption Handler for Haraka
// This module provides email encryption functionality using OpenPGP
// Encryption is DISABLED by default for development - controlled by config flag

const openpgp = require('openpgp');
const { Transform } = require('stream');
const { db, pgpKeys, eq, and, desc } = require('@blanc/database');

/**
 * Get active PGP public key for a user
 * @param {string} userId - User ID from database
 * @returns {Promise<string|null>} Armored public key or null if not found
 */
async function getUserPublicKey(userId) {
    try {
        const pgpKey = await db.query.pgpKeys.findFirst({
            where: and(eq(pgpKeys.userId, userId), eq(pgpKeys.active, true)),
            orderBy: [desc(pgpKeys.createdAt)],
            columns: { publicKey: true }
        });

        if (!pgpKey) {
            return null;
        }

        return pgpKey.publicKey;
    } catch (error) {
        console.error('Error fetching PGP key:', error);
        return null;
    }
}

/**
 * Create an encryption transform stream
 * This encrypts data as it flows through the stream
 * @param {string} publicKeyArmored - Armored PGP public key
 * @returns {Promise<Transform>} Transform stream that encrypts data
 */
async function createEncryptionStream(publicKeyArmored) {
    try {
        // Read the public key
        const publicKey = await openpgp.readKey({ armoredKey: publicKeyArmored });

        // Create a transform stream for encryption
        const encryptStream = new Transform({
            async transform(chunk, encoding, callback) {
                try {
                    const encrypted = await openpgp.encrypt({
                        message: await openpgp.createMessage({ binary: chunk }),
                        encryptionKeys: publicKey,
                        format: 'binary'
                    });

                    callback(null, Buffer.from(encrypted));
                } catch (error) {
                    callback(error);
                }
            }
        });

        return encryptStream;
    } catch (error) {
        console.error('Error creating encryption stream:', error);
        throw error;
    }
}

/**
 * Simple pass-through stream (no encryption)
 * Used when encryption is disabled
 * @returns {Transform} Transform stream that passes data through unchanged
 */
function createPassThroughStream() {
    return new Transform({
        transform(chunk, encoding, callback) {
            callback(null, chunk);
        }
    });
}

/**
 * Encrypt string data (for JSON datagrams, not streams)
 * @param {string} data - Plain text data to encrypt
 * @param {string} publicKeyArmored - Armored PGP public key
 * @returns {Promise<string>} Armored encrypted message
 */
async function encryptData(data, publicKeyArmored) {
    try {
        const publicKey = await openpgp.readKey({ armoredKey: publicKeyArmored });
        const message = await openpgp.createMessage({ text: data });

        const encrypted = await openpgp.encrypt({
            message: message,
            encryptionKeys: publicKey,
            format: 'armored'
        });

        return encrypted;
    } catch (error) {
        console.error('Error encrypting data:', error);
        throw error;
    }
}

module.exports = {
    getUserPublicKey,
    createEncryptionStream,
    createPassThroughStream,
    encryptData
};
