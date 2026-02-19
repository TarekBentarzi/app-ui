import React from 'react';
import { render } from '@testing-library/react-native';
import App from './App';

jest.mock('@react-navigation/native', () => ({
  NavigationContainer: ({ children }: any) => children,
  useNavigation: () => ({
    navigate: jest.fn(),
    goBack: jest.fn(),
  }),
}));

jest.mock('@react-navigation/native-stack', () => ({
  createNativeStackNavigator: () => ({
    Navigator: ({ children }: any) => children,
    Screen: ({ children }: any) => children,
  }),
}));

jest.mock('@/infra/primary/navigation/AppNavigator', () => ({
  AppNavigator: () => {
    const { View, Text } = require('react-native');
    return (
      <View testID="app-navigator">
        <Text>AppNavigator</Text>
      </View>
    );
  },
}));

describe('App Component', () => {
  it('should render without crashing', () => {
    const { getByTestId } = render(<App />);
    expect(getByTestId('app-navigator')).toBeTruthy();
  });
});
