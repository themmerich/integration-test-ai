import { defineConfig } from 'vitest/config';

// Loaded by the Angular unit-test builder via `runnerConfig` in angular.json. Only the coverage
// thresholds live here; scope and reporters are set in angular.json. The thresholds apply only to
// coverage runs (`pnpm test:coverage`, CI) and fail the run when the total drops below them.
export default defineConfig({
  test: {
    coverage: {
      thresholds: {
        lines: 80,
        branches: 80,
      },
    },
  },
});
