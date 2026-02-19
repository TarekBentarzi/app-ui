import '@testing-library/jest-dom';
import { registerRootComponent } from 'expo';

jest.mock('expo', () => ({
  registerRootComponent: jest.fn(),
}));

jest.mock('./App', () => ({
  default: () => null,
}));

describe('index.ts', () => {
  it('should register the root component', () => {
    // Import after mocking to ensure mocks are in place
    require('./index.ts');
    
    expect(registerRootComponent).toHaveBeenCalled();
  });
});
