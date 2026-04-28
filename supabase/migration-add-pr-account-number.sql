-- ═══════════════════════════════════════════════════════════════════════════
--  MIGRATION — Add PR Account Number to existing users
--  Run this ONLY if you already ran schema.sql before the PR account feature.
--  If starting fresh, run schema.sql instead — this is not needed.
-- ═══════════════════════════════════════════════════════════════════════════

-- Create the sequence
CREATE SEQUENCE IF NOT EXISTS public.pr_account_seq START WITH 1000001;

-- Create the generator function
CREATE OR REPLACE FUNCTION public.generate_pr_account_number()
RETURNS TEXT LANGUAGE plpgsql AS $$
BEGIN
  RETURN 'PR-' || LPAD(nextval('public.pr_account_seq')::TEXT, 7, '0');
END;
$$;

-- Add the column with default
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS pr_account_number TEXT UNIQUE;

-- Backfill existing users who don't have a PR account number
UPDATE public.profiles
  SET pr_account_number = public.generate_pr_account_number()
  WHERE pr_account_number IS NULL;

-- Now set the default for all future inserts and make it NOT NULL
ALTER TABLE public.profiles
  ALTER COLUMN pr_account_number SET DEFAULT public.generate_pr_account_number();

ALTER TABLE public.profiles
  ALTER COLUMN pr_account_number SET NOT NULL;

-- Index for fast lookups
CREATE INDEX IF NOT EXISTS idx_profiles_pr_account ON public.profiles(pr_account_number);

-- Verify
SELECT id, email, pr_account_number FROM public.profiles ORDER BY created_at DESC LIMIT 10;
