-- ═══════════════════════════════════════════════════════════════════════════
--  PACIFIC RACING & SPORTS BETTING LTD — Phase 1 Schema (Full)
--  Run in: Supabase Dashboard → SQL Editor → New Query
-- ═══════════════════════════════════════════════════════════════════════════

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ═══════════════════════════════════════════════════════════════════════════
--  SEQUENCES & ACCOUNT NUMBER GENERATORS
-- ═══════════════════════════════════════════════════════════════════════════

-- User PR account numbers: PR-1000001, PR-1000002, ...
CREATE SEQUENCE IF NOT EXISTS public.pr_account_seq START WITH 1000001;

-- Admin numbers: 5-digit, 10000–99999
CREATE SEQUENCE IF NOT EXISTS public.admin_number_seq START WITH 10001;

-- Generate a PR account number for regular users
CREATE OR REPLACE FUNCTION public.generate_pr_account_number()
RETURNS TEXT LANGUAGE plpgsql AS $$
BEGIN
  RETURN 'PR-' || LPAD(nextval('public.pr_account_seq')::TEXT, 7, '0');
END;
$$;

-- Generate a 5-digit admin number
CREATE OR REPLACE FUNCTION public.generate_admin_number()
RETURNS TEXT LANGUAGE plpgsql AS $$
BEGIN
  RETURN LPAD(nextval('public.admin_number_seq')::TEXT, 5, '0');
END;
$$;

-- Trigger function: auto-assign account numbers on INSERT to profiles
-- Regular users → pr_account_number
-- Admin users   → admin_number
CREATE OR REPLACE FUNCTION public.assign_account_numbers()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  IF NEW.role = 'admin' THEN
    IF NEW.admin_number IS NULL THEN
      NEW.admin_number := public.generate_admin_number();
    END IF;
    NEW.pr_account_number := NULL;  -- admins don't get PR numbers
  ELSE
    IF NEW.pr_account_number IS NULL THEN
      NEW.pr_account_number := public.generate_pr_account_number();
    END IF;
    NEW.admin_number := NULL;  -- regular users don't get admin numbers
  END IF;
  RETURN NEW;
END;
$$;


-- ═══════════════════════════════════════════════════════════════════════════
--  TABLES
-- ═══════════════════════════════════════════════════════════════════════════

-- ── 1. PROFILES ───────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.profiles (
  id                UUID    PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email             TEXT    NOT NULL,
  full_name         TEXT,
  given_names       TEXT,
  surname           TEXT,
  date_of_birth     DATE,
  pr_account_number TEXT    UNIQUE,   -- Regular users: PR-1000001. NULL for admins.
  admin_number      TEXT    UNIQUE,   -- Admins: 10001. NULL for regular users.
  role              TEXT    NOT NULL DEFAULT 'user'
                            CHECK (role IN ('user', 'admin')),
  kyc_verified      BOOLEAN NOT NULL DEFAULT FALSE,
  kyc_submitted     BOOLEAN NOT NULL DEFAULT FALSE,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Auto-assign account numbers on every INSERT to profiles
DROP TRIGGER IF EXISTS trg_assign_account_numbers ON public.profiles;
CREATE TRIGGER trg_assign_account_numbers
  BEFORE INSERT ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.assign_account_numbers();

-- ── 2. WALLETS ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.wallets (
  id             UUID    PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id        UUID    NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  balance        NUMERIC(12, 2) NOT NULL DEFAULT 0.00 CHECK (balance >= 0),
  locked_balance NUMERIC(12, 2) NOT NULL DEFAULT 0.00 CHECK (locked_balance >= 0),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── 3. EVENTS ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.events (
  id              UUID    PRIMARY KEY DEFAULT gen_random_uuid(),
  name            TEXT    NOT NULL,
  description     TEXT,
  date            TIMESTAMPTZ NOT NULL,
  status          TEXT    NOT NULL DEFAULT 'upcoming'
                  CHECK (status IN ('upcoming', 'live', 'closed', 'resulted')),
  sport           TEXT    NOT NULL DEFAULT 'Other',
  league_or_type  TEXT    NOT NULL DEFAULT '',
  is_trending     BOOLEAN NOT NULL DEFAULT FALSE,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── 4. PARTICIPANTS (Selections) ──────────────────────────────────────────
-- market_name groups selections into betting markets within an event
CREATE TABLE IF NOT EXISTS public.participants (
  id          UUID    PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id    UUID    NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  market_name TEXT    NOT NULL DEFAULT 'Head to Head',
  name        TEXT    NOT NULL,
  odds        NUMERIC(8, 2) NOT NULL CHECK (odds > 1.00),
  position    INTEGER,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── 5. BETS ───────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.bets (
  id               UUID    PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          UUID    NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  event_id         UUID    NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  participant_id   UUID    NOT NULL REFERENCES public.participants(id) ON DELETE CASCADE,
  stake            NUMERIC(12, 2) NOT NULL CHECK (stake >= 1.00),
  potential_payout NUMERIC(12, 2) NOT NULL CHECK (potential_payout > 0),
  status           TEXT    NOT NULL DEFAULT 'pending'
                   CHECK (status IN ('pending', 'won', 'lost', 'void')),
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── 6. TRANSACTIONS ───────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.transactions (
  id           UUID    PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID    NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type         TEXT    NOT NULL
               CHECK (type IN ('deposit','withdrawal','bet','payout','refund','admin_credit')),
  amount       NUMERIC(12, 2) NOT NULL,
  reference_id UUID,
  description  TEXT,
  status       TEXT    NOT NULL DEFAULT 'completed'
               CHECK (status IN ('completed', 'pending', 'failed')),
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);


-- ═══════════════════════════════════════════════════════════════════════════
--  INDEXES
-- ═══════════════════════════════════════════════════════════════════════════
CREATE INDEX IF NOT EXISTS idx_profiles_email        ON public.profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_pr_account   ON public.profiles(pr_account_number);
CREATE INDEX IF NOT EXISTS idx_profiles_admin_number ON public.profiles(admin_number);
CREATE INDEX IF NOT EXISTS idx_wallets_user          ON public.wallets(user_id);
CREATE INDEX IF NOT EXISTS idx_events_status         ON public.events(status);
CREATE INDEX IF NOT EXISTS idx_events_date           ON public.events(date);
CREATE INDEX IF NOT EXISTS idx_events_trending       ON public.events(is_trending) WHERE is_trending = TRUE;
CREATE INDEX IF NOT EXISTS idx_participants_event    ON public.participants(event_id);
CREATE INDEX IF NOT EXISTS idx_participants_market   ON public.participants(market_name);
CREATE INDEX IF NOT EXISTS idx_bets_user             ON public.bets(user_id);
CREATE INDEX IF NOT EXISTS idx_bets_event            ON public.bets(event_id);
CREATE INDEX IF NOT EXISTS idx_bets_status           ON public.bets(status);
CREATE INDEX IF NOT EXISTS idx_transactions_user     ON public.transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_created  ON public.transactions(created_at DESC);


-- ═══════════════════════════════════════════════════════════════════════════
--  RPC FUNCTIONS
-- ═══════════════════════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION public.deduct_wallet_balance(p_user_id UUID, p_amount NUMERIC)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE v_available NUMERIC;
BEGIN
  SELECT (balance - locked_balance) INTO v_available FROM public.wallets WHERE user_id = p_user_id FOR UPDATE;
  IF v_available IS NULL THEN RAISE EXCEPTION 'Wallet not found'; END IF;
  IF v_available < p_amount THEN RAISE EXCEPTION 'Insufficient funds. Available: K%, Requested: K%', v_available, p_amount; END IF;
  UPDATE public.wallets SET balance = balance - p_amount, updated_at = NOW() WHERE user_id = p_user_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.add_wallet_balance(p_user_id UUID, p_amount NUMERIC)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  IF p_amount <= 0 THEN RAISE EXCEPTION 'Amount must be positive'; END IF;
  UPDATE public.wallets SET balance = balance + p_amount, updated_at = NOW() WHERE user_id = p_user_id;
  IF NOT FOUND THEN RAISE EXCEPTION 'Wallet not found'; END IF;
END;
$$;

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$;

DROP TRIGGER IF EXISTS trg_wallets_updated_at ON public.wallets;
CREATE TRIGGER trg_wallets_updated_at BEFORE UPDATE ON public.wallets
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


-- ═══════════════════════════════════════════════════════════════════════════
--  ROW LEVEL SECURITY
-- ═══════════════════════════════════════════════════════════════════════════
ALTER TABLE public.profiles     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wallets      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bets         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  DROP POLICY IF EXISTS "profiles_own" ON public.profiles;
  DROP POLICY IF EXISTS "profiles_admin_all" ON public.profiles;
  DROP POLICY IF EXISTS "wallets_own_read" ON public.wallets;
  DROP POLICY IF EXISTS "wallets_service_all" ON public.wallets;
  DROP POLICY IF EXISTS "events_public_read" ON public.events;
  DROP POLICY IF EXISTS "events_service_write" ON public.events;
  DROP POLICY IF EXISTS "participants_public_read" ON public.participants;
  DROP POLICY IF EXISTS "participants_service_write" ON public.participants;
  DROP POLICY IF EXISTS "bets_own_read" ON public.bets;
  DROP POLICY IF EXISTS "bets_own_insert" ON public.bets;
  DROP POLICY IF EXISTS "bets_service_all" ON public.bets;
  DROP POLICY IF EXISTS "transactions_own_read" ON public.transactions;
  DROP POLICY IF EXISTS "transactions_service_all" ON public.transactions;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

CREATE POLICY "profiles_own"              ON public.profiles FOR ALL USING (auth.uid() = id) WITH CHECK (auth.uid() = id);
CREATE POLICY "profiles_admin_all"        ON public.profiles FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "wallets_own_read"          ON public.wallets FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "wallets_service_all"       ON public.wallets FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "events_public_read"        ON public.events FOR SELECT USING (true);
CREATE POLICY "events_service_write"      ON public.events FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "participants_public_read"  ON public.participants FOR SELECT USING (true);
CREATE POLICY "participants_service_write" ON public.participants FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "bets_own_read"             ON public.bets FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "bets_own_insert"           ON public.bets FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "bets_service_all"          ON public.bets FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "transactions_own_read"     ON public.transactions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "transactions_service_all"  ON public.transactions FOR ALL USING (auth.role() = 'service_role');


-- ═══════════════════════════════════════════════════════════════════════════
--  REALTIME
-- ═══════════════════════════════════════════════════════════════════════════
DO $$ BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.events;
  ALTER PUBLICATION supabase_realtime ADD TABLE public.participants;
  ALTER PUBLICATION supabase_realtime ADD TABLE public.bets;
  ALTER PUBLICATION supabase_realtime ADD TABLE public.wallets;
EXCEPTION WHEN OTHERS THEN RAISE NOTICE 'Realtime: %', SQLERRM; END $$;


-- ═══════════════════════════════════════════════════════════════════════════
--  SEED DATA
-- ═══════════════════════════════════════════════════════════════════════════
INSERT INTO public.events (name, description, date, status, sport) VALUES
  ('NRL Round 12 — Brisbane Broncos vs Sydney Roosters',
   'A blockbuster clash at Suncorp Stadium. State of Origin form guide on the line.',
   NOW() + INTERVAL '2 hours', 'live', 'NRL'),
  ('PNG Kapuls vs Solomon Islands',
   'OFC Nations Cup Qualifier. Papua New Guinea at home.',
   NOW() + INTERVAL '3 days', 'upcoming', 'Soccer'),
  ('Melbourne Cup 2024 — Race Day',
   'The race that stops a nation. 24 thoroughbreds at Flemington Racecourse.',
   NOW() + INTERVAL '5 days', 'upcoming', 'Horse Racing')
ON CONFLICT DO NOTHING;

DO $$
DECLARE v_nrl_id UUID; v_soccer_id UUID; v_racing_id UUID;
BEGIN
  SELECT id INTO v_nrl_id    FROM public.events WHERE name LIKE '%Broncos%'   LIMIT 1;
  SELECT id INTO v_soccer_id FROM public.events WHERE name LIKE '%Kapuls%'    LIMIT 1;
  SELECT id INTO v_racing_id FROM public.events WHERE name LIKE '%Melbourne%' LIMIT 1;
  IF v_nrl_id IS NOT NULL THEN
    INSERT INTO public.participants (event_id, market_name, name, odds) VALUES
      (v_nrl_id, 'Head to Head', 'Brisbane Broncos', 1.85),
      (v_nrl_id, 'Head to Head', 'Sydney Roosters',  1.95),
      (v_nrl_id, 'Line / Handicap', 'Brisbane Broncos (-4.5)', 1.90),
      (v_nrl_id, 'Line / Handicap', 'Sydney Roosters (+4.5)',  1.90)
    ON CONFLICT DO NOTHING;
  END IF;
  IF v_soccer_id IS NOT NULL THEN
    INSERT INTO public.participants (event_id, market_name, name, odds) VALUES
      (v_soccer_id, 'Head to Head', 'PNG Kapuls',       1.45),
      (v_soccer_id, 'Head to Head', 'Draw',             3.80),
      (v_soccer_id, 'Head to Head', 'Solomon Islands',  5.50)
    ON CONFLICT DO NOTHING;
  END IF;
  IF v_racing_id IS NOT NULL THEN
    INSERT INTO public.participants (event_id, market_name, name, odds) VALUES
      (v_racing_id, 'Head to Head', 'Vauban',          4.50),
      (v_racing_id, 'Head to Head', 'Without A Fight', 5.00),
      (v_racing_id, 'Head to Head', 'Gold Trip',       6.00),
      (v_racing_id, 'Head to Head', 'Absurde',         8.00),
      (v_racing_id, 'Head to Head', 'Duais',          10.00)
    ON CONFLICT DO NOTHING;
  END IF;
END $$;
