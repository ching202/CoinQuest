import { act, render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import App from './App.jsx'
import { supabase } from './supabase'
import { createSupabaseMock, fixtures } from './test/supabaseMock.js'

vi.mock('./supabase', () => ({ supabase: { from: vi.fn(), rpc: vi.fn() } }))

// The consistency requirement is unchanged; the service boundary is now one RPC.
// Original red tests/source/results are preserved in evidence/before-fixes.
// These component tests do not establish SQL rollback; see database tests.
function mount(service) {
  supabase.from.mockImplementation(service.from)
  supabase.rpc.mockImplementation(service.rpc)
  render(<App />)
}

describe('Defect regression checks', () => {
  it('CQ-D001 / WB-D01 failed completion must not retain an XP reward', async () => {
    const error = vi.spyOn(console, 'error').mockImplementation(() => {})
    const service = createSupabaseMock(fixtures(), {
      failures: { 'complete_quest:rpc': 'Completion rejected' },
    })
    mount(service)
    const user = userEvent.setup()
    await user.click(await screen.findByRole('button', { name: 'Complete Quest' }))
    await waitFor(() => expect(error).toHaveBeenCalledWith('Quest completion error:', { message: 'Completion rejected' }))
    expect(error).toHaveBeenCalledTimes(1)
    expect(service.calls.filter((call) => call.operation !== 'read').map((call) => call.operation)).toEqual(['rpc'])
    expect(service.database.user_quests).toHaveLength(0)
    expect(screen.getByText('Level 1 • 90 XP')).toBeInTheDocument()
    expect(window.alert).not.toHaveBeenCalled()
    expect(screen.getByRole('alert')).toHaveTextContent('Please try again')
    // SQL-D01 separately proves the rollback using the actual SQL function.
    expect(service.database.profiles[0].xp).toBe(90)
  })

  it('CQ-D002 / WB-D02 an incomplete record remains available and can be completed', async () => {
    // The real table definition supports false and null; see SCHEMA_REVIEW.md.
    const service = createSupabaseMock(fixtures({
      user_quests: [{ id: 'uq1', user_id: 'p1', quest_id: 'q1', completed: false }],
    }))
    mount(service)
    const available = (await screen.findByRole('heading', { name: 'Available Quests', level: 2 })).closest('section')
    const completed = screen.getByRole('heading', { name: 'Completed Quests', level: 2 }).closest('section')
    expect.soft(within(available).queryByRole('button', { name: 'Complete Quest' })).toBeInTheDocument()
    expect.soft(within(completed).queryByText('✓ Plan a budget')).not.toBeInTheDocument()
    await userEvent.setup().click(within(available).getByRole('button', { name: 'Complete Quest' }))
    expect(await within(completed).findByText('✓ Plan a budget')).toBeInTheDocument()
    expect(service.database.user_quests).toHaveLength(1)
    expect(service.database.user_quests[0]).toMatchObject({ id: 'uq1', completed: true })
    expect(screen.getByText('Level 2 • 100 XP')).toBeInTheDocument()
  })

  it('WB-15 blocks further clicks while completion is pending', async () => {
    let release
    const rpcGate = new Promise((resolve) => { release = resolve })
    const service = createSupabaseMock(fixtures(), { rpcGate })
    mount(service)
    const button = await screen.findByRole('button', { name: 'Complete Quest' })
    const user = userEvent.setup()
    await user.dblClick(button)
    expect(button).toBeDisabled()
    expect(service.rpc).toHaveBeenCalledTimes(1)
    await act(async () => { release(); await rpcGate })
    expect(await screen.findByText('Level 2 • 100 XP')).toBeInTheDocument()
  })

  it('WB-16 retries after an error and uses the server values, even if local XP is stale', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {})
    const service = createSupabaseMock()
    service.rpc.mockResolvedValueOnce({ data: null, error: { message: 'Temporary failure' } })
    mount(service)
    const user = userEvent.setup()
    const button = await screen.findByRole('button', { name: 'Complete Quest' })
    await user.click(button)
    expect(await screen.findByRole('alert')).toBeInTheDocument()
    // Another session changed persisted XP/reward after this screen loaded.
    service.database.profiles[0].xp = 195
    service.database.quests[0].xp_reward = 20
    await user.click(button)
    expect(await screen.findByText('Level 3 • 215 XP')).toBeInTheDocument()
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
    expect(window.alert).toHaveBeenCalledExactlyOnceWith('Quest completed! +20 XP')
  })

  it('WB-17 reconciles a completion already saved by another session without another reward', async () => {
    const service = createSupabaseMock()
    mount(service)
    const button = await screen.findByRole('button', { name: 'Complete Quest' })
    service.database.profiles[0].xp = 100
    service.database.profiles[0].level = 2
    service.database.user_quests.push({ id: 'other-session', user_id: 'p1', quest_id: 'q1', completed: true })
    await userEvent.setup().click(button)
    expect(await screen.findByText('Level 2 • 100 XP')).toBeInTheDocument()
    expect(service.database.profiles[0].xp).toBe(100)
    expect(service.database.user_quests).toHaveLength(1)
    expect(window.alert).toHaveBeenCalledExactlyOnceWith('This quest has already been completed.')
  })

  it.each([null, { profile: { xp: 100, level: 2 } }])('WB-18 handles an incomplete RPC response: %j', async (data) => {
    vi.spyOn(console, 'error').mockImplementation(() => {})
    const service = createSupabaseMock()
    service.rpc.mockResolvedValueOnce({ data, error: null })
    mount(service)
    await userEvent.setup().click(await screen.findByRole('button', { name: 'Complete Quest' }))
    expect(await screen.findByRole('alert')).toBeInTheDocument()
    expect(screen.getByText('Level 1 • 90 XP')).toBeInTheDocument()
    expect(window.alert).not.toHaveBeenCalled()
    expect(screen.getByRole('button', { name: 'Complete Quest' })).toBeEnabled()
  })

  it('WB-19 keeps null completion flags available and preserves unrelated completion cards', async () => {
    const data = fixtures()
    data.quests.push({ id: 'q2', title: 'Track spending', xp_reward: 5 })
    data.user_quests.push(
      { id: 'uq1', user_id: 'p1', quest_id: 'q1', completed: null },
      { id: 'uq2', user_id: 'p1', quest_id: 'q2', completed: true },
      { id: 'uq3', user_id: 'p2', quest_id: 'q1', completed: true },
    )
    const service = createSupabaseMock(data)
    mount(service)
    await userEvent.setup().click(await screen.findByRole('button', { name: 'Complete Quest' }))
    expect(await screen.findByText('✓ Plan a budget')).toBeInTheDocument()
    expect(screen.getByText('✓ Track spending')).toBeInTheDocument()
    expect(service.database.user_quests).toHaveLength(3)
  })

  it('WB-20 shows no completed quests when no current profile exists', async () => {
    mount(createSupabaseMock(fixtures({ profiles: [], user_quests: [
      { id: 'uq1', user_id: 'p1', quest_id: 'q1', completed: true },
    ] })))
    expect(await screen.findByRole('button', { name: 'Complete Quest' })).toBeInTheDocument()
    expect(screen.queryByText('✓ Plan a budget')).not.toBeInTheDocument()
  })
})
