import type { Config } from 'jest';
import nextJest from 'next/jest';

const createJestConfig = nextJest({
  // Fourni le chemin vers le fichier de configuration de Next.js
  dir: './',
});

const config: Config = {
  coverageProvider: 'v8',
  testEnvironment: 'jsdom',
  preset: 'ts-jest',
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
    '^@/components/(.*)$': '<rootDir>/components/$1',
    '^@/lib/(.*)$': '<rootDir>/lib/$1',
    '^@/models/(.*)$': '<rootDir>/models/$1',
  },
  testMatch: [
    '<rootDir>/**/*.test.ts',
    '<rootDir>/**/*.test.tsx',
    '<rootDir>/**/__tests__/**/*.ts',
    '<rootDir>/**/__tests__/**/*.tsx',
  ],
  collectCoverageFrom: [
    'app/**/*.{js,jsx,ts,tsx}',
    'components/**/*.{js,jsx,ts,tsx}',
    'lib/**/*.{js,jsx,ts,tsx}',
    '!**/*.d.ts',
    '!**/node_modules/**',
    '!**/.next/**',
  ],
  setupFilesAfterEnv: ['<rootDir>/jest.setup.tsx'],
};

export default createJestConfig(config);
