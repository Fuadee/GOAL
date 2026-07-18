-- The legacy /smv mission tracker used these tables exclusively.
-- No other SMV scoring, evidence, stage, appearance, or social tables depend on them.

drop table if exists public.smv_mission_rewards;
drop table if exists public.smv_real_date_history;

drop function if exists public.set_smv_mission_rewards_updated_at();
drop function if exists public.set_smv_real_date_history_updated_at();
