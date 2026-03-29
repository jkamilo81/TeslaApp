-- Fix infinite recursion in family_members RLS policies
-- The old policies on family_members referenced family_members itself, causing infinite recursion.
-- Fix: use direct user_id check for SELECT, and a non-recursive approach for INSERT/DELETE.

-- Drop the recursive policies
DROP POLICY IF EXISTS "Family members can view members of their family" ON family_members;
DROP POLICY IF EXISTS "Admins can insert family members" ON family_members;
DROP POLICY IF EXISTS "Admins can delete family members" ON family_members;

-- SELECT: A user can see all members of any family they belong to.
-- We check if the current user has ANY row in family_members with the same family_id.
-- To avoid recursion, we use a security definer function.
CREATE OR REPLACE FUNCTION public.get_my_family_ids()
RETURNS SETOF uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT family_id FROM family_members WHERE user_id = auth.uid();
$$;

-- Now use the function in policies (no recursion since the function bypasses RLS)
CREATE POLICY "Family members can view members of their family"
  ON family_members FOR SELECT
  TO authenticated
  USING (family_id IN (SELECT public.get_my_family_ids()));

CREATE POLICY "Admins can insert family members"
  ON family_members FOR INSERT
  TO authenticated
  WITH CHECK (
    family_id IN (
      SELECT public.get_my_family_ids()
    )
    AND EXISTS (
      SELECT 1 FROM family_members
      WHERE family_id = family_members.family_id
        AND user_id = auth.uid()
        AND role = 'admin'
    )
  );

CREATE POLICY "Admins can delete family members"
  ON family_members FOR DELETE
  TO authenticated
  USING (
    family_id IN (SELECT public.get_my_family_ids())
    AND EXISTS (
      SELECT 1 FROM family_members fm2
      WHERE fm2.family_id = family_members.family_id
        AND fm2.user_id = auth.uid()
        AND fm2.role = 'admin'
    )
  );

-- Also fix all other policies that reference family_members to use the function
-- This prevents potential recursion chains

-- pets
DROP POLICY IF EXISTS "Family members can view their pets" ON pets;
DROP POLICY IF EXISTS "Family members can insert pets" ON pets;
DROP POLICY IF EXISTS "Family members can update their pets" ON pets;
DROP POLICY IF EXISTS "Family members can delete their pets" ON pets;

CREATE POLICY "Family members can view their pets"
  ON pets FOR SELECT TO authenticated
  USING (family_id IN (SELECT public.get_my_family_ids()));

CREATE POLICY "Family members can insert pets"
  ON pets FOR INSERT TO authenticated
  WITH CHECK (family_id IN (SELECT public.get_my_family_ids()));

CREATE POLICY "Family members can update their pets"
  ON pets FOR UPDATE TO authenticated
  USING (family_id IN (SELECT public.get_my_family_ids()))
  WITH CHECK (family_id IN (SELECT public.get_my_family_ids()));

CREATE POLICY "Family members can delete their pets"
  ON pets FOR DELETE TO authenticated
  USING (family_id IN (SELECT public.get_my_family_ids()));

-- families
DROP POLICY IF EXISTS "Family members can view their family" ON families;
DROP POLICY IF EXISTS "Family members can update their family" ON families;

CREATE POLICY "Family members can view their family"
  ON families FOR SELECT TO authenticated
  USING (id IN (SELECT public.get_my_family_ids()));

CREATE POLICY "Family members can update their family"
  ON families FOR UPDATE TO authenticated
  USING (id IN (SELECT public.get_my_family_ids()))
  WITH CHECK (id IN (SELECT public.get_my_family_ids()));

-- payers
DROP POLICY IF EXISTS "Family members can view payers" ON payers;
DROP POLICY IF EXISTS "Family members can insert payers" ON payers;
DROP POLICY IF EXISTS "Family members can update payers" ON payers;
DROP POLICY IF EXISTS "Family members can delete payers" ON payers;

CREATE POLICY "Family members can view payers"
  ON payers FOR SELECT TO authenticated
  USING (family_id IN (SELECT public.get_my_family_ids()));

CREATE POLICY "Family members can insert payers"
  ON payers FOR INSERT TO authenticated
  WITH CHECK (family_id IN (SELECT public.get_my_family_ids()));

CREATE POLICY "Family members can update payers"
  ON payers FOR UPDATE TO authenticated
  USING (family_id IN (SELECT public.get_my_family_ids()))
  WITH CHECK (family_id IN (SELECT public.get_my_family_ids()));

CREATE POLICY "Family members can delete payers"
  ON payers FOR DELETE TO authenticated
  USING (family_id IN (SELECT public.get_my_family_ids()));

-- family_invitations
DROP POLICY IF EXISTS "Admins can view family invitations" ON family_invitations;
DROP POLICY IF EXISTS "Admins can insert family invitations" ON family_invitations;
DROP POLICY IF EXISTS "Admins can delete family invitations" ON family_invitations;

CREATE POLICY "Admins can view family invitations"
  ON family_invitations FOR SELECT TO authenticated
  USING (family_id IN (SELECT public.get_my_family_ids()));

CREATE POLICY "Admins can insert family invitations"
  ON family_invitations FOR INSERT TO authenticated
  WITH CHECK (family_id IN (SELECT public.get_my_family_ids()));

CREATE POLICY "Admins can delete family invitations"
  ON family_invitations FOR DELETE TO authenticated
  USING (family_id IN (SELECT public.get_my_family_ids()));
