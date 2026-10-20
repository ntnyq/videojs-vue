import { defineConfig } from 'vitest/config'
import { registrationEntries } from './tests/package/entries.js'

export default defineConfig({
  test: {
    projects: [
      {
        test: {
          environment: 'jsdom',
          include: [
            'tests/package/behavior.test.ts',
            'tests/package/exports.test.ts',
            'tests/package/ssr.test.ts',
            'tests/package/legacy.test.ts',
          ],
          name: 'package-behavior',
          setupFiles: ['./tests/setup.ts'],
        },
      },
      ...Object.entries(registrationEntries).map(([entry, tags]) => ({
        test: {
          environment: 'jsdom',
          include: ['tests/package/registration.test.ts'],
          name: `entry:${entry}`,
          provide: {
            packageEntry: `videojs-vue/${entry}`,
            registeredTags: tags,
          },
          setupFiles: ['./tests/setup.ts'],
        },
      })),
    ],
    watch: false,
  },
})
