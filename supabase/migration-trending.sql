-- ═══════════════════════════════════════════════════════════════════════════
--  MIGRATION — Add is_trending column to events
--  Run in: Supabase Dashboard → SQL Editor → New Query
-- ═══════════════════════════════════════════════════════════════════════════

-- Add is_trending column (defaults to false)
ALTER TABLE public.events
  ADD COLUMN IF NOT EXISTS is_trending BOOLEAN NOT NULL DEFAULT FALSE;

-- Index for fast filtering
CREATE INDEX IF NOT EXISTS idx_events_trending ON public.events(is_trending) WHERE is_trending = TRUE;

-- Mark the NRL seed events as trending for demo purposes
UPDATE public.events
  SET is_trending = TRUE
  WHERE sport IN ('NRL', 'Rugby League', 'Soccer')
    AND status IN ('live', 'upcoming');

-- Verify
SELECT sport, league_or_type, name, is_trending, status, date
FROM public.events
ORDER BY is_trending DESC, sport, date;
