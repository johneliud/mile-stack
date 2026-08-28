-- Enable RLS on tables that had policies defined but were missing
-- ENABLE ROW LEVEL SECURITY. Without this, the policies defined in
-- earlier migrations are inert — the anon key has full unrestricted
-- CRUD on these tables via default privileges.
--
-- The existing policies (anon_select, anon_insert, anon_update) are
-- intentionally permissive for a public marketplace: all listings are
-- browsable, anyone can apply, and project metadata is public. Enabling
-- RLS activates these policies so PostgREST enforces them. Without RLS,
-- the policies are just dead SQL.
--
-- Also add DELETE policies matching the permissive posture: the anon key
-- should be able to delete its own records (withdraw an application,
-- remove a listing, delete project metadata). Ownership is checked via
-- the wallet address columns.

ALTER TABLE listings         ENABLE ROW LEVEL SECURITY;
ALTER TABLE applications     ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_metadata ENABLE ROW LEVEL SECURITY;

-- DELETE policies — matching the existing permissive posture but scoped
-- to record ownership via the wallet address columns.
CREATE POLICY "anon_delete" ON listings
  FOR DELETE TO anon
  USING (client_address = current_setting('request.jwt.claims', true)::jsonb ->> 'sub');

CREATE POLICY "anon_delete" ON applications
  FOR DELETE TO anon
  USING (freelancer_address = current_setting('request.jwt.claims', true)::jsonb ->> 'sub');

CREATE POLICY "anon_delete" ON project_metadata
  FOR DELETE TO anon
  USING (client_address = current_setting('request.jwt.claims', true)::jsonb ->> 'sub');
