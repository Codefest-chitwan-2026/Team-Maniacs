-- Add a verified flag to relief_requests so admins can approve organizations/requests
ALTER TABLE IF EXISTS relief_requests
ADD COLUMN IF NOT EXISTS verified BOOLEAN DEFAULT FALSE;
