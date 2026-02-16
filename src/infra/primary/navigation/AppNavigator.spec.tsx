import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { AppNavigator } from './AppNavigator';
import { AuthProvider } from '@/shared/contexts/AuthContext';
import { UserProgressProvider } from '@/shared/contexts/UserProgressContext';

let capturedOnContinue: (() => void) | undefined;
let mockNavigate: jest.Mock;

jest.mock('@react-navigation/native', () => ({
    NavigationContainer: ({ children }: any) => children,
}));

jest.mock('@react-navigation/native-stack', () => ({
    createNativeStackNavigator: () => ({
        Navigator: ({ children }: any) => children,
        Screen: ({ children, name }: any) => {
            const View = require('react-native').View;
            const Text = require('react-native').Text;
            
            const navigation = { navigate: mockNavigate };
            
            // Call the render function for screens
            const renderedChildren = typeof children === 'function' 
                ? children({ navigation }) 
                : children;
                
            return (
                <View testID={`screen-${name}`}>
                    <Text>{name}</Text>
                    {renderedChildren}
                </View>
            );
        },
    }),
}));

jest.mock('../screens/WelcomeScreen', () => ({
    WelcomeScreen: ({ onContinue }: any) => {
        capturedOnContinue = onContinue;
        const { View, TouchableOpacity, Text } = require('react-native');
        return (
            <View testID="welcome-screen">
                <TouchableOpacity testID="continue-button" onPress={onContinue}>
                    <Text>Continue</Text>
                </TouchableOpacity>
            </View>
        );
    },
}));

describe('AppNavigator', () => {
    beforeEach(() => {
        capturedOnContinue = undefined;
        mockNavigate = jest.fn();
    });

    it('should render without crashing', () => {
        const { getByTestId } = render(
            <AuthProvider>
                <UserProgressProvider>
                    <AppNavigator />
                </UserProgressProvider>
            </AuthProvider>
        );
        
        expect(getByTestId('screen-Welcome')).toBeDefined();
    });

    it('should include MainMenu screen', () => {
        const { getByTestId } = render(
            <AuthProvider>
                <UserProgressProvider>
                    <AppNavigator />
                </UserProgressProvider>
            </AuthProvider>
        );
        
        expect(getByTestId('screen-MainMenu')).toBeDefined();
    });

    it('should navigate to MainMenu when WelcomeScreen onContinue is called', () => {
        const { getByTestId } = render(
            <AuthProvider>
                <UserProgressProvider>
                    <AppNavigator />
                </UserProgressProvider>
            </AuthProvider>
        );
        
        const button = getByTestId('continue-button');
        fireEvent.press(button);
        
        expect(mockNavigate).toHaveBeenCalledWith('MainMenu');
    });

    it('should include all required screens', () => {
        const { getByTestId } = render(
            <AuthProvider>
                <UserProgressProvider>
                    <AppNavigator />
                </UserProgressProvider>
            </AuthProvider>
        );
        
        expect(getByTestId('screen-Welcome')).toBeDefined();
        expect(getByTestId('screen-MainMenu')).toBeDefined();
        expect(getByTestId('screen-Reading')).toBeDefined();
        expect(getByTestId('screen-Memorizing')).toBeDefined();
        expect(getByTestId('screen-Pronunciation')).toBeDefined();
        expect(getByTestId('screen-SignIn')).toBeDefined();
        expect(getByTestId('screen-Profile')).toBeDefined();
    });
});
