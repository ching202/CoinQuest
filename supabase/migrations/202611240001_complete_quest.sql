-- Local proposal: inspect existing functions, triggers, indexes and caller access
-- before applying to the shared project. This does not repair historical XP.
begin;

-- Fail on existing duplicate pairs rather than delete or merge records silently.
create unique index user_quests_user_quest_unique
  on public.user_quests (user_id, quest_id);

-- CREATE (not REPLACE) deliberately refuses to overwrite an existing function.
create function public.complete_quest(p_user_id uuid, p_quest_id uuid)
returns jsonb
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_profile public.profiles%rowtype;
  v_quest public.quests%rowtype;
  v_completion public.user_quests%rowtype;
  v_new_xp integer;
begin
  if p_user_id is null or p_quest_id is null then
    raise exception 'Profile and quest IDs are required';
  end if;

  -- Serialize completions for this profile, including different quests.
  select * into v_profile from public.profiles
    where id = p_user_id for update;
  if not found then raise exception 'Profile unavailable'; end if;

  select * into v_quest from public.quests
    where id = p_quest_id for share;
  if not found then raise exception 'Quest unavailable'; end if;

  select * into v_completion from public.user_quests
    where user_id = p_user_id and quest_id = p_quest_id for update;
  if found and v_completion.completed is true then
    return pg_catalog.jsonb_build_object(
      'profile', pg_catalog.jsonb_build_object('xp', v_profile.xp, 'level', v_profile.level),
      'completion', pg_catalog.to_jsonb(v_completion),
      'already_completed', true, 'awarded_xp', 0
    );
  end if;

  if v_profile.xp is null or v_profile.xp < 0
     or v_quest.xp_reward is null or v_quest.xp_reward < 0 then
    raise exception 'XP and reward must be nonnegative integers';
  end if;

  v_new_xp := v_profile.xp + v_quest.xp_reward;
  update public.profiles set xp = v_new_xp, level = (v_new_xp / 100) + 1
    where id = p_user_id returning * into v_profile;
  if not found then raise exception 'Profile update unavailable'; end if;

  insert into public.user_quests (user_id, quest_id, completed, completed_at)
    values (p_user_id, p_quest_id, true, pg_catalog.timezone('UTC', pg_catalog.now()))
    on conflict (user_id, quest_id) do update
      set completed = true, completed_at = excluded.completed_at
    returning * into v_completion;
  if not found then raise exception 'Completion update unavailable'; end if;

  -- Any uncaught error rolls back BOTH writes; do not swallow it here.
  return pg_catalog.jsonb_build_object(
    'profile', pg_catalog.jsonb_build_object('xp', v_profile.xp, 'level', v_profile.level),
    'completion', pg_catalog.to_jsonb(v_completion),
    'already_completed', false, 'awarded_xp', v_quest.xp_reward
  );
end;
$$;

-- No role grants, RLS changes or SECURITY DEFINER elevation. The caller must
-- already have the required table access. Verify actual privileges before deploy.
commit;
