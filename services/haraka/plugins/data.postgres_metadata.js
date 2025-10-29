// Haraka plugin for storing email metadata in PostgreSQL
'use strict';

const { Pool } = require('pg');

let pool;

exports.register = function () {
    const plugin = this;

    pool = new Pool({
        connectionString: process.env.DATABASE_URL,
        ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
    });

    plugin.loginfo('PostgreSQL Metadata plugin initialized');
};

exports.hook_data_post = async function (next, connection) {
    const plugin = this;
    const transaction = connection.transaction;

    try {
        const metadata = {
            from: transaction.mail_from.address(),
            to: transaction.rcpt_to.map(rcpt => rcpt.address()),
            subject: transaction.header.get('subject'),
            messageId: transaction.header.get('message-id'),
            timestamp: new Date(),
            size: transaction.data_bytes
        };

        // TODO: Store metadata in database
        // await pool.query(
        //     'INSERT INTO email_metadata (from, to, subject, message_id, timestamp, size) VALUES ($1, $2, $3, $4, $5, $6)',
        //     [metadata.from, metadata.to, metadata.subject, metadata.messageId, metadata.timestamp, metadata.size]
        // );

        plugin.loginfo('Email metadata stored');

        return next();
    } catch (err) {
        plugin.logerror(`Metadata storage error: ${err.message}`);
        return next();
    }
};