-- Problems table for citizen-submitted problems
CREATE TABLE IF NOT EXISTS problems (
  id TEXT PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  title TEXT,
  description TEXT NOT NULL,
  category TEXT,
  location TEXT,
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  verified BOOLEAN DEFAULT FALSE,
  status TEXT DEFAULT 'PENDING',
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);
