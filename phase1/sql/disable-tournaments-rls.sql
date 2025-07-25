-- Temporarily disable RLS on tournaments table to allow admin operations
-- This is a quick fix while we implement proper application-level security

ALTER TABLE tournaments DISABLE ROW LEVEL SECURITY;

-- Note: You can re-enable it later with:
-- ALTER TABLE tournaments ENABLE ROW LEVEL SECURITY;
