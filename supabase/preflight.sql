-- READ-ONLY deployment review queries. Prepared locally; not run against Supabase.
-- Review results before applying migrations/202611240001_complete_quest.sql.

select table_name, column_name, data_type, is_nullable, column_default
from information_schema.columns
where table_schema = 'public' and table_name in ('profiles', 'quests', 'user_quests')
order by table_name, ordinal_position;

select c.conrelid::regclass as table_name, c.conname,
       pg_get_constraintdef(c.oid) as definition
from pg_constraint c
where c.conrelid in ('public.profiles'::regclass, 'public.quests'::regclass,
                    'public.user_quests'::regclass);

select tablename, indexname, indexdef from pg_indexes
where schemaname = 'public' and tablename in ('profiles', 'quests', 'user_quests');

select tgrelid::regclass as table_name, tgname, pg_get_triggerdef(oid) as definition
from pg_trigger where not tgisinternal
and tgrelid in ('public.profiles'::regclass, 'public.quests'::regclass,
               'public.user_quests'::regclass);

select p.proname, pg_get_function_identity_arguments(p.oid) as arguments,
       p.prosecdef as security_definer, p.proconfig, p.proacl
from pg_proc p join pg_namespace n on n.oid = p.pronamespace
where n.nspname = 'public' order by p.proname;

select user_id, quest_id, count(*) as duplicate_count
from public.user_quests where user_id is not null and quest_id is not null
group by user_id, quest_id having count(*) > 1;

select schemaname, tablename, policyname, roles, cmd, qual, with_check
from pg_policies where schemaname = 'public'
and tablename in ('profiles', 'quests', 'user_quests');

select c.relname, c.relrowsecurity, c.relforcerowsecurity
from pg_class c join pg_namespace n on n.oid = c.relnamespace
where n.nspname = 'public' and c.relname in ('profiles', 'quests', 'user_quests');

select grantee, table_name, privilege_type from information_schema.role_table_grants
where table_schema = 'public' and table_name in ('profiles', 'quests', 'user_quests')
order by grantee, table_name, privilege_type;
