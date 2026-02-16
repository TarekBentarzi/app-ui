global.__DEV__ = true;
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  roots: ['<rootDir>'],
  testMatch: ['**/__tests__/**/*.ts?(x)', '**/?(*.)+(spec|test).ts?(x)'],
  testPathIgnorePatterns: ['<rootDir>/e2e/'],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node', 'mjs'],
  collectCoverageFrom: [
    '**/*.{ts,tsx}',
    '!**/*.d.ts',
    '!**/node_modules/**',
    '!**/.expo/**',
    '!**/playwright.config.ts',
    '!**/dist/**',
    '!**/e2e/**',
    '!**/ARCHITECTURE.ts',
    '!**/entities/**',
    '!**/dto/**',
    '!**/repositories/I*.ts',
    '!**/src/shared/i18n/index.ts',
  ],
  coverageReporters: ['text', 'text-summary', 'json'],
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  moduleNameMapper: {
    // Mock des fichiers styles
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',

    // Mock de React Native et Expo
    '^react-native$': '<rootDir>/__mocks__/react-native.js',
    '^expo-status-bar$': '<rootDir>/__mocks__/expo-status-bar.js',

    // Alias @/ → src/
    '^@/(.*)$': '<rootDir>/src/$1',

    // Forcer Jest à utiliser les bons modules React/React DOM
    '^react$': '<rootDir>/node_modules/react',
    '^react-dom$': '<rootDir>/node_modules/react-dom',
    '^react-dom/client$': '<rootDir>/node_modules/react-dom/cjs/react-dom-client.development.js',
  },
  transform: {
    '^.+\\.tsx?$': ['ts-jest', {
      tsconfig: {
        jsx: 'react-jsx',
        esModuleInterop: true,
        allowSyntheticDefaultImports: true,
      },
      useESM: true, // ⚡ Important pour supporter les import/export
    }],
    '^.+\\.(js|jsx|mjs)$': 'babel-jest', // ⚡ Transpile aussi les fichiers JS/MJS
  },
  transformIgnorePatterns: [
    'node_modules/(?!(expo-constants|expo-modules-core|lucide-react-native)/)', // ⚡ Transpile ces modules ES
  ],
};