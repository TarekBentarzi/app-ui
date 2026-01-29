require('@testing-library/jest-dom');

// Provide a global fetch mock for tests that rely on fetch
if (!globalThis.fetch) {
  globalThis.fetch = jest.fn();
} 
