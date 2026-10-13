-- Structured drill for each swing: { name, focus, steps[], reps, equipment }.
-- drill_recommendation keeps a plain-text version; older swings only have that.
alter table public.swings add column drill jsonb;
