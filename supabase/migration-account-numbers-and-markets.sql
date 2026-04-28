-- ═══════════════════════════════════════════════════════════════════════════
--  MIGRATION — Account Numbers + Markets
--  Run this ONLY if you already ran the previous schema.sql
--  If starting completely fresh, use schema.sql instead.
-- ═══════════════════════════════════════════════════════════════════════════

-- ── Step 1: Create sequences ──────────────────────────────────────────────
CREATE SEQUENCE IF NOT EXISTS public.pr_account_seq START WITH 1000001;
CREATE SEQUENCE IF NOT EXISTS public.admin_number_seq START WITH 10001;

-- ── Step 2: Create generator functions ───────────────────────────────────
CREATE OR REPLACE FUNCTION public.generate_pr_account_number()
RETURNS TEXT LANGUAGE plpgsql AS $$
BEGIN RETURN 'PR-' || LPAD(nextval('public.pr_account_seq')::TEXT, 7, '0'); END;
$$;

CREATE OR REPLACE FUNCTION public.generate_admin_number()
RETURNS TEXT LANGUAGE plpgsql AS $$
BEGIN RETURN LPAD(nextval('public.admin_number_seq')::TEXT, 5, '0'); END;
$$;

-- ── Step 3: Add new columns to profiles ──────────────────────────────────
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS given_names       TEXT,
  ADD COLUMN IF NOT EXISTS surname           TEXT,
  ADD COLUMN IF NOT EXISTS date_of_birth     DATE,
  ADD COLUMN IF NOT EXISTS pr_account_number TEXT UNIQUE,
  ADD COLUMN IF NOT EXISTS admin_number      TEXT UNIQUE,
  ADD COLUMN IF NOT EXISTS kyc_verified      BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS kyc_submitted     BOOLEAN NOT NULL DEFAULT FALSE;

-- ── Step 4: Backfill existing users who don't have numbers ───────────────
-- Regular users get PR numbers
UPDATE public.profiles
  SET pr_account_number = public.generate_pr_account_number()
  WHERE pr_account_number IS NULL AND role = 'user';

-- Admin users get admin numbers
UPDATE public.profiles
  SET admin_number = public.generate_admin_number()
  WHERE admin_number IS NULL AND role = 'admin';

-- ── Step 5: Create the auto-assign trigger ────────────────────────────────
CREATE OR REPLACE FUNCTION public.assign_account_numbers()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  IF NEW.role = 'admin' THEN
    IF NEW.admin_number IS NULL THEN NEW.admin_number := public.generate_admin_number(); END IF;
    NEW.pr_account_number := NULL;
  ELSE
    IF NEW.pr_account_number IS NULL THEN NEW.pr_account_number := public.generate_pr_account_number(); END IF;
    NEW.admin_number := NULL;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_assign_account_numbers ON public.profiles;
CREATE TRIGGER trg_assign_account_numbers
  BEFORE INSERT ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.assign_account_numbers();

-- ── Step 6: Add market_name column to participants ────────────────────────
ALTER TABLE public.participants
  ADD COLUMN IF NOT EXISTS market_name TEXT NOT NULL DEFAULT 'Head to Head';

-- Backfill existing participants without a market name
UPDATE public.participants SET market_name = 'Head to Head' WHERE market_name IS NULL OR market_name = '';

-- Index for market grouping
CREATE INDEX IF NOT EXISTS idx_participants_market ON public.participants(market_name);
CREATE INDEX IF NOT EXISTS idx_profiles_pr_account  ON public.profiles(pr_account_number);
CREATE INDEX IF NOT EXISTS idx_profiles_admin_number ON public.profiles(admin_number);

-- ── Step 7: Verify ────────────────────────────────────────────────────────
SELECT
  role,
  COUNT(*) AS total,
  COUNT(pr_account_number) AS has_pr_number,
  COUNT(admin_number) AS has_admin_number
FROM public.profiles
GROUP BY role;
