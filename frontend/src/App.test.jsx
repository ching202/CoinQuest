import { act, render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import App from './App.jsx'
import { supabase } from './supabase'
import { createSupabaseMock, fixtures, profile, quest } from './test/supabaseMock.js'

// Import the real App, replacing only its database boundary.
vi.mock('./supabase', () => ({ supabase: { from: vi.fn(), rpc: vi.fn() } }))

function mount(data = fixtures(), options) {
  const service = createSupabaseMock(data, options)
  supabase.from.mockImplementation(service.from)
  supabase.rpc.mockImplementation(service.rpc)
  render(<App />)
  return service
}

async function loaded() {
  await screen.findByRole('heading', { name: 'Financial Analytics' })
}

function card(title) {
  return screen.getByRole('heading', { name: title, level: 3 }).closest('article')
}

function section(title) {
  return screen.getByRole('heading', { name: title, level: 2 }).closest('section')
}

describe('App: statements, branches, and collection processing', () => {
  it('WB-01 shows loading until the reads resolve', async () => {
    let release
    const readGate = new Promise((resolve) => { release = resolve })
    mount(fixtures(), { readGate })
    expect(screen.getByText('Loading CoinQuest data...')).toBeInTheDocument()
    expect(screen.queryByRole('heading', { name: 'Financial Analytics' })).not.toBeInTheDocument()
    await act(async () => { release(); await readGate })
    await loaded()
    expect(screen.queryByText('Loading CoinQuest data...')).not.toBeInTheDocument()
  })

  it('WB-02 handles zero transaction iterations and empty quest lists', async () => {
    // Arrange: a successful response containing no transactions or quests.
    mount(fixtures({ quests: [] }))
    // Act: render App and wait for its loading effect to finish.
    await loaded()
    // Assert: independently specified totals and empty-state messages.
    expect(card('Net Balance')).toHaveTextContent('$0.00')
    expect(card('Savings Rate')).toHaveTextContent('0%')
    expect(card('Transaction Summary')).toHaveTextContent('0 income transactions')
    expect(card('Transaction Summary')).toHaveTextContent('0 expense transactions')
    expect(screen.getByText('All quests completed.')).toBeInTheDocument()
    expect(screen.getByText('No completed quests yet.')).toBeInTheDocument()
  })

  it('WB-03 processes one income item, including a numeric string', async () => {
    mount(fixtures({ transactions: [
      { id: 't1', type: 'income', amount: '25.50', category: 'Allowance' },
    ] }))
    await loaded()
    expect(card('Net Balance')).toHaveTextContent('$25.50')
    expect(card('Savings Rate')).toHaveTextContent('100%')
    expect(card('Transaction Summary')).toHaveTextContent('1 income transactions')
    expect(within(section('Transactions')).getByText('+$25.50')).toBeInTheDocument()
  })

  it('WB-04 reduces multiple income/expense items without losing earlier amounts', async () => {
    mount(fixtures({ transactions: [
      { id: 't1', type: 'income', amount: '1000', category: 'Work' },
      { id: 't2', type: 'income', amount: 50, category: 'Gift' },
      { id: 't3', type: 'expense', amount: '200', category: 'Food' },
      { id: 't4', type: 'expense', amount: 50, category: 'Travel' },
    ] }))
    await loaded()
    expect(screen.getByText('Total Income').closest('article')).toHaveTextContent('$1050.00')
    expect(screen.getByText('Total Expenses').closest('article')).toHaveTextContent('$250.00')
    expect(card('Net Balance')).toHaveTextContent('$800.00')
    expect(card('Savings Rate')).toHaveTextContent('76%')
    expect(card('Transaction Summary')).toHaveTextContent('2 income transactions')
    expect(card('Transaction Summary')).toHaveTextContent('2 expense transactions')
    expect(within(section('Transactions')).getByText('-$200.00')).toBeInTheDocument()
  })

  it('WB-05 takes the zero-income branch with expenses present', async () => {
    mount(fixtures({ transactions: [
      { id: 't1', type: 'expense', amount: 50, category: 'Food' },
    ] }))
    await loaded()
    expect(card('Net Balance')).toHaveTextContent('$-50.00')
    expect(card('Savings Rate')).toHaveTextContent('0%')
    expect(card('Financial Health')).toHaveTextContent('50/100')
  })

  it.each([
    [100, 75], [101, 90], [250, 90], [251, 100],
  ])('WB-06 net %i produces financial health %i at the strict thresholds', async (net, score) => {
    mount(fixtures({ transactions: [
      { id: 't1', type: 'income', amount: net, category: 'Income' },
    ] }))
    await loaded()
    expect(card('Financial Health')).toHaveTextContent(`${score}/100`)
  })

  it.each([
    [98, 1, 99, 1], [99, 1, 100, 2], [100, 2, 101, 2],
  ])('WB-07 XP %i / level %i becomes XP %i / level %i after a one-XP quest', async (xp, level, expectedXp, expectedLevel) => {
    const user = userEvent.setup()
    const secondProfile = { ...profile, id: 'p2', username: 'Other Student', xp: 500, level: 6 }
    const service = mount(fixtures({
      profiles: [{ ...profile, xp, level }, secondProfile],
      quests: [{ ...quest, xp_reward: 1 }],
    }))
    await loaded()
    await user.click(screen.getByRole('button', { name: 'Complete Quest' }))
    await waitFor(() => expect(card('Test Student')).toHaveTextContent(`Level ${expectedLevel} • ${expectedXp} XP`))
    expect(service.database.profiles[0]).toMatchObject({ xp: expectedXp, level: expectedLevel })
    expect(service.database.profiles[1]).toEqual(secondProfile)
    expect(card('Other Student')).toHaveTextContent('Level 6 • 500 XP')
    expect(service.database.user_quests).toHaveLength(1)
    expect(service.database.user_quests[0]).toMatchObject({ user_id: 'p1', quest_id: 'q1', completed: true })
    expect(within(section('Completed Quests')).getByText('✓ Plan a budget')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Complete Quest' })).not.toBeInTheDocument()
    expect(window.alert).toHaveBeenCalledExactlyOnceWith('Quest completed! +1 XP')
    expect(service.calls.filter((call) => call.operation !== 'read')).toEqual([
      { operation: 'rpc', name: 'complete_quest', args: { p_user_id: 'p1', p_quest_id: 'q1' } },
    ])
  })

  it('WB-08 reports a failed completion without showing success or changing XP', async () => {
    const error = vi.spyOn(console, 'error').mockImplementation(() => {})
    const user = userEvent.setup()
    const service = mount(fixtures(), { failures: { 'complete_quest:rpc': 'Completion rejected' } })
    await loaded()
    await user.click(screen.getByRole('button', { name: 'Complete Quest' }))
    await waitFor(() => expect(error).toHaveBeenCalledWith('Quest completion error:', { message: 'Completion rejected' }))
    expect(screen.getByRole('alert')).toHaveTextContent('Could not confirm quest completion')
    expect(error).toHaveBeenCalledTimes(1)
    expect(service.database.profiles[0].xp).toBe(90)
    expect(service.database.user_quests).toHaveLength(0)
    expect(service.calls.some((call) => call.operation === 'insert')).toBe(false)
    expect(card('Test Student')).toHaveTextContent('Level 1 • 90 XP')
    expect(window.alert).not.toHaveBeenCalled()
  })

  it('WB-09 returns without writes when there is no profile', async () => {
    const user = userEvent.setup()
    const service = mount(fixtures({ profiles: [] }))
    await loaded()
    await user.click(screen.getByRole('button', { name: 'Complete Quest' }))
    expect(service.calls.every((call) => call.operation === 'read')).toBe(true)
    expect(window.alert).not.toHaveBeenCalled()
    expect(screen.getByRole('button', { name: 'Complete Quest' })).toBeInTheDocument()
  })

  it('WB-10 classifies completed quests for the current profile only', async () => {
    mount(fixtures({
      quests: [quest, { ...quest, id: 'q2', title: 'Track spending' }],
      user_quests: [
        { id: 'uq1', user_id: 'p1', quest_id: 'q1', completed: true },
        { id: 'uq2', user_id: 'p2', quest_id: 'q2', completed: true },
      ],
    }))
    await loaded()
    expect(within(section('Completed Quests')).getByText('✓ Plan a budget')).toBeInTheDocument()
    expect(within(section('Available Quests')).getByText('Track spending')).toBeInTheDocument()
    expect(within(section('Completed Quests')).queryByText('✓ Track spending')).not.toBeInTheDocument()
  })

  it.each([[99, 'Locked'], [100, 'Unlocked'], [101, 'Unlocked']])(
    'WB-11 achievement at XP %i is %s', async (xp, status) => {
      mount(fixtures({
        profiles: [{ ...profile, xp }],
        achievements: [{ id: 'a1', name: 'First 100', xp_required: 100, badge_icon: '★' }],
      }))
      await loaded()
      expect(within(section('Achievements')).getByText(status, { exact: true })).toBeInTheDocument()
    },
  )

  it('WB-12 leaves achievements locked when no profile is loaded', async () => {
    mount(fixtures({
      profiles: [],
      achievements: [{ id: 'a1', name: 'First 100', xp_required: 100, badge_icon: '★' }],
    }))
    await loaded()
    expect(within(section('Achievements')).getByText('Locked', { exact: true })).toBeInTheDocument()
  })

  it.each([[99, '99%'], [100, '100%'], [101, '100%']])(
    'WB-13 savings amount %i displays capped progress %s', async (amount, progress) => {
      mount(fixtures({ savings_goals: [
        { id: 'g1', goal_name: 'Textbooks', current_amount: amount, target_amount: 100 },
      ] }))
      await loaded()
      expect(card('Textbooks')).toHaveTextContent(`$${amount.toFixed(2)} saved of $100.00`)
      expect(card('Textbooks')).toHaveTextContent(`${progress} complete`)
      expect(card('Textbooks').querySelector('.progressBar > div')).toHaveStyle({ width: progress })
    },
  )

  it.each([
    ['profiles', 'Profiles'], ['quests', 'Quests'], ['transactions', 'Transactions'],
    ['savings_goals', 'Savings goals'], ['achievements', 'Achievements'], ['user_quests', 'User quests'],
  ])('WB-14 characterizes the current error fallback for %s', async (table, label) => {
    // Characterization records current behavior; it does NOT approve silent error feedback (ST-03).
    const error = vi.spyOn(console, 'error').mockImplementation(() => {})
    mount(fixtures(), { failures: { [`${table}:read`]: 'Read rejected' } })
    await loaded()
    expect(error).toHaveBeenCalledExactlyOnceWith(`${label} error:`, { message: 'Read rejected' })
    expect(card('Net Balance')).toHaveTextContent('$0.00')
    expect(screen.queryByText('Loading CoinQuest data...')).not.toBeInTheDocument()
  })
})
