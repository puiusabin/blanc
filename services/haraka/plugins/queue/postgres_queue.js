// Haraka plugin for PostgreSQL-based queue
'use strict';

const { Pool } = require('pg');

let pool;

exports.register = function () {
    const plugin = this;

    pool = new Pool({
        connectionString: process.env.DATABASE_URL,
        ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
    });

    plugin.loginfo('PostgreSQL Queue plugin initialized');
};

exports.hook_queue = async function (next, connection) {
    const plugin = this;
    const transaction = connection.transaction;

    try {
        // Get email data
        const emailData = {
            from: transaction.mail_from.address(),
            to: transaction.rcpt_to.map(rcpt => rcpt.address()),
            headers: transaction.header.headers_decoded,
            body: transaction.body.toString(),
            messageId: transaction.header.get('message-id'),
            timestamp: new Date()
        };

        // TODO: Store in queue table
        // await pool.query(
        //     'INSERT INTO email_queue (from, to, headers, body, message_id, status) VALUES ($1, $2, $3, $4, $5, $6)',
        //     [emailData.from, emailData.to, emailData.headers, emailData.body, emailData.messageId, 'queued']
        // );

        plugin.loginfo('Email queued for delivery');

        return next(OK, 'Message queued');
    } catch (err) {
        plugin.logerror(`Queue error: ${err.message}`);
        return next(DENYSOFT, 'Temporary error queuing message');
    }
};