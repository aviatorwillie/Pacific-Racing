-- ═══════════════════════════════════════════════════════════════════════════
--  MIGRATION — Add new profile fields
--  Run this ONLY if you already ran the original schema.sql
--  If you are starting fresh, run schema.sql instead — this is not needed.
-- ═══════════════════════════════════════════════════════════════════════════

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS given_names   TEXT,
  ADD COLUMN IF NOT EXISTS surname       TEXT,
  ADD COLUMN IF NOT EXISTS date_of_birth DATE,
  ADD COLUMN IF NOT EXISTS kyc_verified  BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS kyc_submitted BOOLEAN NOT NULL DEFAULT FALSE;

-- Verify
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'profiles'
ORDER BY ordinal_position;
