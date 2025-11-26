-- Add token system to users table
-- This migration adds token-based system to replace premium_status

-- Add token columns to users table
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS token integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS total_tokens_used integer DEFAULT 0;

-- Update all existing users to have 3 free tokens
UPDATE users 
SET token = 3 
WHERE token = 0 AND active = true;

-- Create token_transactions table for tracking all token operations
CREATE TABLE IF NOT EXISTS token_transactions (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid REFERENCES users(id) ON DELETE CASCADE,
    transaction_type varchar(50) NOT NULL, -- 'credit', 'debit', 'purchase', 'refund', 'gift'
    amount integer NOT NULL, -- positive for credit, negative for debit
    description text,
    try_on_id uuid REFERENCES try_ons(id) ON DELETE SET NULL, -- optional reference to try-on if applicable
    created_at timestamp with time zone DEFAULT timezone('utc', now()) NOT NULL,
    updated_at timestamp with time zone DEFAULT timezone('utc', now()) NOT NULL
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_token_transactions_user_id ON token_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_token_transactions_created_at ON token_transactions(created_at);

-- Create updated_at trigger for token_transactions
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc', now());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Drop trigger if exists and recreate
DROP TRIGGER IF EXISTS update_token_transactions_updated_at ON token_transactions;
CREATE TRIGGER update_token_transactions_updated_at 
BEFORE UPDATE ON token_transactions 
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS on token_transactions
ALTER TABLE token_transactions ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for token_transactions
CREATE POLICY "Users can view their own token transactions" ON token_transactions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own token transactions" ON token_transactions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Add some initial transaction records for existing users who got free tokens
INSERT INTO token_transactions (user_id, transaction_type, amount, description)
SELECT 
    id,
    'gift',
    3,
    'Welcome gift - 3 free tokens'
FROM users 
WHERE active = true AND token = 3
ON CONFLICT DO NOTHING;

-- Add comment to track this migration
COMMENT ON TABLE token_transactions IS 'Tracks all token transactions for auditing and balance calculation';
COMMENT ON COLUMN users.token IS 'Current token balance for the user';
COMMENT ON COLUMN users.total_tokens_used IS 'Total tokens used by user throughout their history';