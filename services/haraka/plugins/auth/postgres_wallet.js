// Haraka plugin for wallet-based authentication with PostgreSQL
'use strict';

const { Pool } = require('pg');

let pool;

exports.register = function () {
    const plugin = this;

    // Initialize PostgreSQL connection pool
    pool = new Pool({
        connectionString: process.env.DATABASE_URL,
        ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
    });

    plugin.loginfo('PostgreSQL Wallet Auth plugin initialized');
};

exports.hook_capabilities = function (next, connection) {
    const plugin = this;
    // Advertise AUTH capability
    connection.capabilities.push('AUTH LOGIN PLAIN');
    next();
};

exports.hook_auth = async function (next, connection, params) {
    const plugin = this;
    const [method, user, pass] = params;

    try {
        // Implement wallet-based authentication logic here
        // Example: verify wallet signature

        plugin.loginfo(`Auth attempt for user: ${user}`);

        // TODO: Implement actual wallet verification
        // const result = await pool.query(
        //     'SELECT * FROM users WHERE wallet_address = $1',
        //     [user]
        // );

        return next(OK);
    } catch (err) {
        plugin.logerror(`Auth error: ${err.message}`);
        return next(DENY, 'Authentication failed');
    }
};