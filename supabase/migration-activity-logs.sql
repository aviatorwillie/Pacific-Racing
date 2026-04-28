-- ═══════════════════════════════════════════════════════════════════════════
--  MIGRATION — Activity Logging System
--  Run in: Supabase Dashboard → SQL Editor → New Query
-- ═══════════════════════════════════════════════════════════════════════════

-- ── Create the activity_logs table ────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.activity_logs (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id    UUID,       -- references auth.users(id) but NOT enforced FK (for resilience)
  actor_role  TEXT        CHECK (actor_role IN ('user', 'admin', 'system')),
  action      TEXT        NOT NULL,
  entity_type TEXT,       -- 'event', 'bet', 'user', 'wallet', etc.
  entity_id   UUID,       -- the ID of the affected entity
  details     JSONB,      -- structured context about the action
  ip_address  TEXT,       -- optional: for future audit
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE public.activity_logs IS 'Immutable audit trail. INSERT only — no updates or deletes allowed.';

-- ── Indexes for fast querying ─────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_activity_logs_actor     ON public.activity_logs(actor_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_action    ON public.activity_logs(action);
CREATE INDEX IF NOT EXISTS idx_activity_logs_entity    ON public.activity_logs(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_created   ON public.activity_logs(created_at DESC);

-- ── RLS: INSERT only — no update, no delete ──────────────────────────────
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;

-- Service role can INSERT (from API routes)
CREATE POLICY "activity_logs_service_insert"
  ON public.activity_logs FOR INSERT
  USING (auth.role() = 'service_role');

-- Service role can SELECT (for admin viewing)
CREATE POLICY "activity_logs_service_select"
  ON public.activity_logs FOR SELECT
  USING (auth.role() = 'service_role');

-- EXPLICITLY DENY update and delete — even for service role
-- (We do this by NOT creating any UPDATE or DELETE policies.
--  With RLS enabled and no policy, these operations are blocked.)

-- Also add a trigger that prevents any UPDATE or DELETE at the DB level
CREATE OR REPLACE FUNCTION public.prevent_activity_log_modification()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  RAISE EXCEPTION 'Activity logs are immutable. Updates and deletes are not allowed.';
  RETURN NULL;
END;
$$;

DROP TRIGGER IF EXISTS trg_prevent_activity_log_update ON public.activity_logs;
CREATE TRIGGER trg_prevent_activity_log_update
  BEFORE UPDATE ON public.activity_logs
  FOR EACH ROW EXECUTE FUNCTION public.prevent_activity_log_modification();

DROP TRIGGER IF EXISTS trg_prevent_activity_log_delete ON public.activity_logs;
CREATE TRIGGER trg_prevent_activity_log_delete
  BEFORE DELETE ON public.activity_logs
  FOR EACH ROW EXECUTE FUNCTION public.prevent_activity_log_modification();

-- ── Enable realtime for live activity feed ────────────────────────────────
DO $$ BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.activity_logs;
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'Realtime already enabled for activity_logs';
END $$;

-- ── Add league_or_type column to events if not exists ─────────────────────
ALTER TABLE public.events
  ADD COLUMN IF NOT EXISTS league_or_type TEXT DEFAULT '';

-- ── Verify ────────────────────────────────────────────────────────────────
SELECT 'activity_logs created' AS status,
  (SELECT COUNT(*) FROM information_schema.tables WHERE table_name = 'activity_logs') AS table_exists;
