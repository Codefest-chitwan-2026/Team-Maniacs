-- Volunteers table for applications
CREATE TABLE IF NOT EXISTS volunteers (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  name TEXT,
  phone TEXT,
  area TEXT,
  skills TEXT[],
  verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);
