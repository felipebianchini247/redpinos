import type { Config } from 'jest';

const config: Config = {
  testEnvironment: 'node',
  extensionsToTreatAsEsm: ['.ts'],
  transform: {
    '^.+\\.tsx?$': ['ts-jest', { useESM: true }],
  },
  testMatch: ['**/__tests__/**/*.test.ts'],
  moduleNameMapper: { '^@/(.*)$': '<rootDir>/$1' },
  transformIgnorePatterns: [
    '/node_modules/(?!(jose)/)',
  ],
};

export default config;
