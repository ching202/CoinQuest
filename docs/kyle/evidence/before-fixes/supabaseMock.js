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
export function createSupabaseMock(data = fixtures(), { failures = {}, readGate } = {}) {
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

  return { from, database, calls }
}
