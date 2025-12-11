-- Create save_email table for beta signup emails
CREATE TABLE IF NOT EXISTS save_email (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    status VARCHAR(50) DEFAULT 'active'
);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_save_email_email ON save_email(email);
CREATE INDEX IF NOT EXISTS idx_save_email_created_at ON save_email(created_at);

-- Enable Row Level Security (RLS) if needed
ALTER TABLE save_email ENABLE ROW LEVEL SECURITY;

-- Add comments for documentation
COMMENT ON TABLE save_email IS 'Stores email addresses from beta signup forms';
COMMENT ON COLUMN save_email.id IS 'Primary key, auto-incrementing';
COMMENT ON COLUMN save_email.email IS 'Email address, must be unique';
COMMENT ON COLUMN save_email.created_at IS 'When the email was first saved';
COMMENT ON COLUMN save_email.updated_at IS 'When the record was last updated';
COMMENT ON COLUMN save_email.status IS 'Status of the email (active, unsubscribed, etc.)';

-- Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language plpgsql;

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_save_email_updated_at 
    BEFORE UPDATE ON save_email 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();