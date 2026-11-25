import '@testing-library/jest-dom/vitest'
import { cleanup } from '@testing-library/react'
import { afterEach, beforeEach, vi } from 'vitest'

beforeEach(() => {
  vi.stubGlobal('alert', vi.fn())
  // A missed service mock must fail instead of accessing a real backend.
  vi.stubGlobal('fetch', vi.fn(() => {
    throw new Error('Network access is disabled in component tests. Mock the service.')
  }))
})

afterEach(() => {
  cleanup()
  vi.restoreAllMocks()
  vi.unstubAllGlobals()
})
