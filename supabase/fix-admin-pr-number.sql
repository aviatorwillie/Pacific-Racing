-- ═══════════════════════════════════════════════════════════════════════════
--  FIX — Remove PR account numbers from admin users
--  Run this in: Supabase Dashboard → SQL Editor → New Query
-- ═══════════════════════════════════════════════════════════════════════════

-- Step 1: Give admins an admin_number if they don't have one
UPDATE public.profiles
  SET admin_number = public.generate_admin_number()
  WHERE role = 'admin' AND admin_number IS NULL;

-- Step 2: Remove PR account numbers from admin users
UPDATE public.profiles
  SET pr_account_number = NULL
  WHERE role = 'admin' AND pr_account_number IS NOT NULL;

-- Step 3: Verify the fix
SELECT email, role, pr_account_number, admin_number
FROM public.profiles
ORDER BY created_at;
