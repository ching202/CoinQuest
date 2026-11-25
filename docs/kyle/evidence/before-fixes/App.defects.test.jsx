import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import App from './App.jsx'
import { supabase } from './supabase'
import { createSupabaseMock, fixtures } from './test/supabaseMock.js'

vi.mock('./supabase', () => ({ supabase: { from: vi.fn() } }))

// Real assertions against proposed requirements. They intentionally remain red
// while the original application defects exist: no skip, todo, or inverted assertion.
// These are component reproductions with a simulated service, not database integration tests.
describe('Open defect reproductions', () => {
  it('CQ-D001 / WB-D01 failed completion must not retain an XP reward', async () => {
    const error = vi.spyOn(console, 'error').mockImplementation(() => {})
    const service = createSupabaseMock(fixtures(), {
      failures: { 'user_quests:insert': 'Completion insert rejected' },
    })
    supabase.from.mockImplementation(service.from)
    render(<App />)
    const user = userEvent.setup()
    await user.click(await screen.findByRole('button', { name: 'Complete Quest' }))
    await waitFor(() => expect(error).toHaveBeenCalledWith('User quest insert error:', { message: 'Completion insert rejected' }))
    expect(error).toHaveBeenCalledTimes(1)
    expect(service.calls.filter((call) => call.operation !== 'read').map((call) => call.operation)).toEqual(['update', 'insert'])
    expect(service.database.user_quests).toHaveLength(0)
    expect(screen.getByText('Level 1 • 90 XP')).toBeInTheDocument()
    expect(window.alert).not.toHaveBeenCalled()
    // Current App saves 100 in the service while the screen still shows 90.
    expect(service.database.profiles[0].xp).toBe(90)
  })

  it('CQ-D002 / WB-D02 an incomplete record must remain available (schema assumption)', async () => {
    // Confirm completed=false is allowed before calling this a normal-use integration defect.
    const service = createSupabaseMock(fixtures({
      user_quests: [{ id: 'uq1', user_id: 'p1', quest_id: 'q1', completed: false }],
    }))
    supabase.from.mockImplementation(service.from)
    render(<App />)
    const available = (await screen.findByRole('heading', { name: 'Available Quests', level: 2 })).closest('section')
    const completed = screen.getByRole('heading', { name: 'Completed Quests', level: 2 }).closest('section')
    expect.soft(within(available).queryByRole('button', { name: 'Complete Quest' })).toBeInTheDocument()
    expect.soft(within(completed).queryByText('✓ Plan a budget')).not.toBeInTheDocument()
  })
})
