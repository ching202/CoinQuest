import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { after, before, beforeEach, test } from 'node:test'
import { PGlite } from '@electric-sql/pglite'

// In-memory PostgreSQL execution, not the JavaScript service mock. This is not
// a Supabase/PostgREST integration or multi-connection concurrency test.
const migration = await readFile(new URL('../../supabase/migrations/202611240001_complete_quest.sql', import.meta.url), 'utf8')
const capturedSchema = await readFile(new URL('../../docs/kyle/evidence/schema-definitions.sql', import.meta.url), 'utf8')
// Profiles/quests columns/types came from the schema visualizer. Their full
// definitions/privileges were not captured. user_quests uses the captured DDL.
const fixtureSchema = `
  create table public.profiles (
    id uuid primary key, username text, email text, xp integer, level integer,
    created_at timestamp default now()
  );
  create table public.quests (
    id uuid primary key, title text, description text, xp_reward integer,
    created_at timestamp default now()
  );
  ${capturedSchema}
`
const p1 = '00000000-0000-4000-8000-000000000001'
const p2 = '00000000-0000-4000-8000-000000000002'
const q1 = '10000000-0000-4000-8000-000000000001'
const q2 = '10000000-0000-4000-8000-000000000002'
const missing = '90000000-0000-4000-8000-000000000001'
let db

before(async () => {
  db = await PGlite.create()
  await db.exec(fixtureSchema)
  await db.exec(migration)
  await db.exec(`
    create function public.test_reject_completion() returns trigger language plpgsql as $$
    begin
      if current_setting('test.fail_completion', true) = 'on' then
        if (select xp from public.profiles where id = new.user_id) <> 100 then
          raise exception 'Test did not reach the expected XP update';
        end if;
        raise exception 'Injected failure after XP update';
      end if;
      return new;
    end;
    $$;
    create trigger test_reject_completion before insert or update on public.user_quests
      for each row execute function public.test_reject_completion();
  `)
})

after(async () => { await db?.close() })

beforeEach(async () => {
  await db.exec(`
    set test.fail_completion = 'off';
    truncate public.profiles, public.quests cascade;
  `)
  await db.query('insert into public.profiles(id, xp, level) values ($1, 90, 1), ($2, 500, 6)', [p1, p2])
  await db.query('insert into public.quests(id, xp_reward) values ($1, 10), ($2, 5)', [q1, q2])
})

async function complete(user = p1, quest = q1) {
  const result = await db.query('select public.complete_quest($1, $2) as result', [user, quest])
  return result.rows[0].result
}

async function storedProfile() {
  return (await db.query('select xp, level from public.profiles where id = $1', [p1])).rows[0]
}

async function completions() {
  return (await db.query('select * from public.user_quests order by id')).rows
}

test('SQL-01 saves XP and completion together, leaving another profile unchanged', async () => {
  const result = await complete()
  assert.deepEqual(result.profile, { xp: 100, level: 2 })
  assert.equal(result.awarded_xp, 10)
  assert.equal(result.already_completed, false)
  assert.equal(result.completion.completed, true)
  assert.ok(result.completion.completed_at)
  assert.deepEqual(await storedProfile(), { xp: 100, level: 2 })
  assert.equal((await completions()).length, 1)
  assert.equal((await db.query('select xp from public.profiles where id = $1', [p2])).rows[0].xp, 500)
})

test('SQL-D01 rolls back XP when completion insert fails after the profile update', async () => {
  await db.exec("set test.fail_completion = 'on'")
  await assert.rejects(complete(), /Injected failure after XP update/)
  assert.deepEqual(await storedProfile(), { xp: 90, level: 1 })
  assert.equal((await completions()).length, 0)
})

for (const completed of [false, null]) {
  test(`SQL-D02 completes an existing ${completed} row without inserting a duplicate`, async () => {
    const row = await db.query('insert into public.user_quests(user_id, quest_id, completed) values ($1, $2, $3) returning id', [p1, q1, completed])
    const result = await complete()
    assert.equal(result.completion.id, row.rows[0].id)
    assert.equal(result.completion.completed, true)
    assert.equal((await completions()).length, 1)
    assert.deepEqual(await storedProfile(), { xp: 100, level: 2 })
  })
}

test('SQL-02 rolls back the attempted reward and preserves an incomplete row on failure', async () => {
  await db.query('insert into public.user_quests(user_id, quest_id, completed) values ($1, $2, false)', [p1, q1])
  await db.exec("set test.fail_completion = 'on'")
  await assert.rejects(complete(), /Injected failure after XP update/)
  assert.deepEqual(await storedProfile(), { xp: 90, level: 1 })
  assert.equal((await completions())[0].completed, false)
})

test('SQL-03 retry awards XP once and retains one completion', async () => {
  const first = await complete()
  const second = await complete()
  assert.equal(second.already_completed, true)
  assert.equal(second.awarded_xp, 0)
  assert.equal(second.completion.id, first.completion.id)
  assert.deepEqual(await storedProfile(), { xp: 100, level: 2 })
  assert.equal((await completions()).length, 1)
})

test('SQL-04 different quests accumulate rewards using the latest stored XP', async () => {
  await complete()
  await complete(p1, q2)
  assert.deepEqual(await storedProfile(), { xp: 105, level: 2 })
  assert.equal((await completions()).length, 2)
})

for (const [xp, expectedXp, level] of [[98, 99, 1], [99, 100, 2], [100, 101, 2]]) {
  test(`SQL-05 XP ${xp} plus one produces ${expectedXp} at level ${level}`, async () => {
    await db.query('update public.profiles set xp = $1 where id = $2', [xp, p1])
    await db.query('update public.quests set xp_reward = 1 where id = $1', [q1])
    await complete()
    assert.deepEqual(await storedProfile(), { xp: expectedXp, level })
  })
}

for (const [user, quest, message] of [
  [missing, q1, /Profile unavailable/], [p1, missing, /Quest unavailable/],
  [null, q1, /IDs are required/], [p1, null, /IDs are required/],
]) {
  test(`SQL-06 rejects unavailable input ${user}/${quest} without writes`, async () => {
    await assert.rejects(complete(user, quest), message)
    assert.deepEqual(await storedProfile(), { xp: 90, level: 1 })
    assert.equal((await completions()).length, 0)
  })
}

test('SQL-07 rejects a negative reward without writes', async () => {
  await db.query('update public.quests set xp_reward = -10 where id = $1', [q1])
  await assert.rejects(complete(), /nonnegative integers/)
  assert.deepEqual(await storedProfile(), { xp: 90, level: 1 })
  assert.equal((await completions()).length, 0)
})

test('SQL-08 unique index rejects duplicate profile/quest pairs', async () => {
  await complete()
  await assert.rejects(db.query('insert into public.user_quests(user_id, quest_id) values ($1, $2)', [p1, q1]), /duplicate key/)
  assert.equal((await completions()).length, 1)
})

test('SQL-09 function uses invoker rights and a fixed empty search path', async () => {
  const result = await db.query("select prosecdef, proconfig from pg_proc where oid = 'public.complete_quest(uuid,uuid)'::regprocedure")
  assert.equal(result.rows[0].prosecdef, false)
  assert.deepEqual(result.rows[0].proconfig, ['search_path=""'])
})

test('SQL-10 migration refuses pre-existing duplicates and preserves those rows', async () => {
  const duplicateDb = await PGlite.create()
  try {
    await duplicateDb.exec(fixtureSchema)
    await duplicateDb.query('insert into public.profiles(id, xp, level) values ($1, 90, 1)', [p1])
    await duplicateDb.query('insert into public.quests(id, xp_reward) values ($1, 10)', [q1])
    await duplicateDb.query('insert into public.user_quests(user_id, quest_id) values ($1, $2), ($1, $2)', [p1, q1])
    await assert.rejects(duplicateDb.exec(migration), /could not create unique index/)
    await duplicateDb.exec('rollback')
    assert.equal((await duplicateDb.query('select * from public.user_quests')).rows.length, 2)
    assert.equal((await duplicateDb.query("select to_regprocedure('public.complete_quest(uuid,uuid)') as fn")).rows[0].fn, null)
  } finally {
    await duplicateDb.close()
  }
})
