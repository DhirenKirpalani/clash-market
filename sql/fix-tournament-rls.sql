-- First, drop the existing restrictive policy
DROP POLICY IF EXISTS "Only admins can modify tournaments" ON tournaments;

-- Create a new policy that allows anyone to insert tournaments (we'll control this at the application level)
CREATE POLICY "Allow tournament creation" ON tournaments FOR INSERT USING (true);

-- Create a policy that allows only admins to update/delete tournaments
CREATE POLICY "Only admins can update tournaments" ON tournaments FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid() AND users.is_admin = true
  )
);

-- Create a policy that allows only admins to delete tournaments
CREATE POLICY "Only admins can delete tournaments" ON tournaments FOR DELETE USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid() AND users.is_admin = true
  )
);

-- Explain the changes
COMMENT ON POLICY "Allow tournament creation" ON tournaments IS 'Allows tournament creation with admin checks at application level';
COMMENT ON POLICY "Only admins can update tournaments" ON tournaments IS 'Only admin users can update tournaments';
COMMENT ON POLICY "Only admins can delete tournaments" ON tournaments IS 'Only admin users can delete tournaments';
