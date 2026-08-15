-- Add password_hash to profiles for admin authentication
ALTER TABLE IF EXISTS profiles
ADD COLUMN IF NOT EXISTS password_hash TEXT;

-- Optional: Index on email
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles (email);
