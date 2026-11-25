-- READ-ONLY OBSERVATION: November 24, 2026, Supabase Table Editor > Definition.
-- These are reference snapshots, not a migration or an instruction to run SQL.
-- Project: CoinQuest (wkosszjasogusmogumcj), public schema.
-- Transcribed from the displayed read-only definitions. No data or DDL was changed.

create table public.user_quests (
  id uuid not null default gen_random_uuid (),
  user_id uuid null,
  quest_id uuid null,
  completed boolean null default false,
  completed_at timestamp without time zone null,
  constraint user_quests_pkey primary key (id),
  constraint user_quests_quest_id_fkey foreign KEY (quest_id) references quests (id) on delete CASCADE,
  constraint user_quests_user_id_fkey foreign KEY (user_id) references profiles (id) on delete CASCADE
) TABLESPACE pg_default;

create table public.savings_goals (
  id uuid not null default gen_random_uuid (),
  user_id uuid null,
  goal_name text not null,
  target_amount numeric(10, 2) not null,
  current_amount numeric(10, 2) null default 0,
  created_at timestamp without time zone null default now(),
  constraint savings_goals_pkey primary key (id),
  constraint savings_goals_user_id_fkey foreign KEY (user_id) references profiles (id) on delete CASCADE
) TABLESPACE pg_default;
