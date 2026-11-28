import { vi } from 'vitest'

export const profile = {
  id: 'p1', username: 'Test Student', email: 'student@example.test', xp: 90, level: 1,
}
export const quest = {
  id: 'q1', title: 'Plan a budget', description: 'Synthetic quest', xp_reward: 10,
}

export function fixtures(overrides = {}) {
  return structuredClone({
    profiles: [profile],
    quests: [quest],
    transactions: [],
    savings_goals: [],
    achievements: [],
    user_quests: [],
    ...overrides,
  })
}

// This models only the query operations used by App.jsx. It is not PostgreSQL:
// no RLS, foreign keys, uniqueness constraints, transactions, or network behavior.
// Updates honor eq filters; insert().select() returns only the inserted rows.
export function createSupabaseMock(data = fixtures(), { failures = {}, readGate, rpcGate } = {}) {
  const database = structuredClone(data)
  const calls = []

  const from = vi.fn((table) => {
    if (!(table in database)) throw new Error(`Unexpected table: ${table}`)
    let operation = 'read'
    let values
    let sort
    let result
    const filters = []

    async function execute() {
      if (operation === 'read' && readGate) await readGate
      calls.push({ table, operation, values: structuredClone(values), filters: [...filters] })
      const message = failures[`${table}:${operation}`]
      if (message) return { data: null, error: { message } }

      const matches = (row) => filters.every(([column, value]) => row[column] === value)
      let rows
      if (operation === 'update') {
        rows = database[table].filter(matches)
        rows.forEach((row) => Object.assign(row, structuredClone(values)))
      } else if (operation === 'insert') {
        rows = values.map((row, index) => ({
          id: `${table}-${database[table].length + index + 1}`, ...structuredClone(row),
        }))
        database[table].push(...rows)
      } else {
        rows = database[table].filter(matches)
      }

      const returned = structuredClone(rows)
      if (sort) {
        const [column, ascending] = sort
        returned.sort((a, b) => {
          const order = a[column] < b[column] ? -1 : a[column] > b[column] ? 1 : 0
          return ascending ? order : -order
        })
      }
      return { data: returned, error: null }
    }

    const query = {
      select() { return query },
      order(column, { ascending }) { sort = [column, ascending]; return query },
      eq(column, value) { filters.push([column, value]); return query },
      update(value) { operation = 'update'; values = value; return query },
      insert(value) { operation = 'insert'; values = value; return query },
      then(resolve, reject) {
        result ??= execute()
        return result.then(resolve, reject)
      },
    }
    return query
  })

  // A contract stub, NOT evidence of PostgreSQL rollback. SQL tests execute the
  // actual migration separately in PGlite, with failures raised by a DB trigger.
  const rpc = vi.fn(async (name, args) => {
    calls.push({ operation: 'rpc', name, args: structuredClone(args) })
    if (rpcGate) await rpcGate
    if (name !== 'complete_quest') throw new Error(`Unexpected RPC: ${name}`)
    const message = failures['complete_quest:rpc']
    if (message) return { data: null, error: { message } }

    const savedProfile = database.profiles.find((row) => row.id === args.p_user_id)
    const savedQuest = database.quests.find((row) => row.id === args.p_quest_id)
    let completion = database.user_quests.find((row) =>
      row.user_id === args.p_user_id && row.quest_id === args.p_quest_id)
    const alreadyCompleted = completion?.completed === true
    if (!alreadyCompleted) {
      savedProfile.xp = Number(savedProfile.xp) + Number(savedQuest.xp_reward)
      savedProfile.level = Math.floor(savedProfile.xp / 100) + 1
      if (!completion) {
        completion = { id: 'new-completion', user_id: args.p_user_id, quest_id: args.p_quest_id }
        database.user_quests.push(completion)
      }
      Object.assign(completion, { completed: true, completed_at: '2026-11-24T12:00:00' })
    }
    return { data: structuredClone({
      profile: { xp: savedProfile.xp, level: savedProfile.level },
      completion,
      already_completed: alreadyCompleted,
      awarded_xp: alreadyCompleted ? 0 : savedQuest.xp_reward,
    }), error: null }
  })

  return { from, rpc, database, calls }
}
