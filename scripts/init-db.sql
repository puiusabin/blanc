-- Database initialization script for mail service

-- Users table with wallet addresses
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    wallet_address VARCHAR(42) UNIQUE,
    public_key TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Email metadata table
CREATE TABLE IF NOT EXISTS email_metadata (
    id SERIAL PRIMARY KEY,
    message_id VARCHAR(255) UNIQUE NOT NULL,
    from_address VARCHAR(255) NOT NULL,
    to_addresses TEXT[] NOT NULL,
    subject TEXT,
    size BIGINT,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(50) DEFAULT 'received'
);

-- Email queue table
CREATE TABLE IF NOT EXISTS email_queue (
    id SERIAL PRIMARY KEY,
    message_id VARCHAR(255) UNIQUE NOT NULL,
    from_address VARCHAR(255) NOT NULL,
    to_addresses TEXT[] NOT NULL,
    headers JSONB,
    body TEXT,
    encrypted_body TEXT,
    status VARCHAR(50) DEFAULT 'queued',
    retry_count INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    processed_at TIMESTAMP,
    error_message TEXT
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_users_wallet ON users(wallet_address);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_email_metadata_message_id ON email_metadata(message_id);
CREATE INDEX IF NOT EXISTS idx_email_metadata_timestamp ON email_metadata(timestamp);
CREATE INDEX IF NOT EXISTS idx_email_queue_status ON email_queue(status);
CREATE INDEX IF NOT EXISTS idx_email_queue_created_at ON email_queue(created_at);

-- Insert sample user for testing
INSERT INTO users (email, wallet_address, public_key)
VALUES (
    'test@example.com',
    '0x0000000000000000000000000000000000000000',
    NULL
) ON CONFLICT DO NOTHING;

COMMENT ON TABLE users IS 'User accounts with wallet authentication';
COMMENT ON TABLE email_metadata IS 'Metadata for received emails';
COMMENT ON TABLE email_queue IS 'Queue for email processing and delivery';