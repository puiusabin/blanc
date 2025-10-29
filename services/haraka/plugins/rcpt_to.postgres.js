// Haraka plugin for recipient validation with PostgreSQL
'use strict';

const { Pool } = require('pg');

let pool;

exports.register = function () {
    const plugin = this;

    pool = new Pool({
        connectionString: process.env.DATABASE_URL,
        ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
    });

    plugin.loginfo('PostgreSQL RCPT TO plugin initialized');
};

exports.hook_rcpt = async function (next, connection, params) {
    const plugin = this;
    const rcpt = params[0];
    const address = rcpt.address();

    try {
        // TODO: Validate recipient exists in database
        // const result = await pool.query(
        //     'SELECT 1 FROM users WHERE email = $1 OR wallet_address = $1',
        //     [address]
        // );

        // if (result.rows.length === 0) {
        //     return next(DENY, 'User not found');
        // }

        plugin.loginfo(`Recipient validated: ${address}`);
        return next(OK);
    } catch (err) {
        plugin.logerror(`RCPT validation error: ${err.message}`);
        return next(DENYSOFT, 'Temporary error validating recipient');
    }
};
