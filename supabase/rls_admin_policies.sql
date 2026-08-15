-- Row Level Security policies to restrict admin actions to admin role

-- Only users with profiles.role = 'admin' can update or delete disaster_reports
CREATE POLICY "Admins can modify disaster reports"
ON disaster_reports
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin'
  )
);

-- Only admins can modify relief requests
CREATE POLICY "Admins can modify relief requests"
ON relief_requests
FOR ALL
TO authenticated
USING (
  EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
)
WITH CHECK (
  EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
);

-- Only admins can update help_records
CREATE POLICY "Admins can modify help records"
ON help_records
FOR ALL
TO authenticated
USING (
  EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
)
WITH CHECK (
  EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
);

-- Only admins can view all SOS alerts; users can view their own
DROP POLICY IF EXISTS "Users can view own SOS alerts" ON sos_alerts;
CREATE POLICY "Users can view own SOS alerts or admins"
ON sos_alerts
FOR SELECT
TO authenticated
USING (
  auth.uid() = user_id OR EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
);
