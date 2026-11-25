import { defineConfig, mergeConfig } from 'vitest/config'
import viteConfig from './vite.config.js'

export default mergeConfig(viteConfig, defineConfig({
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.js'],
    include: ['src/**/*.test.{js,jsx}'],
    reporters: ['default', 'json'],
    outputFile: { json: '../docs/kyle/evidence/test-results.json' },
    coverage: {
      provider: 'v8',
      include: ['src/**/*.{js,jsx}'],
      exclude: ['src/**/*.test.{js,jsx}', 'src/test/**'],
      reporter: ['text', 'html', 'json-summary', 'lcov'],
      reportsDirectory: '../docs/kyle/evidence/coverage',
      // Keep the report even when a real application defect fails a test.
      reportOnFailure: true,
    },
  },
}))
