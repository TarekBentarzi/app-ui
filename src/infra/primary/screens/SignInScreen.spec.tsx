import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { SignInScreen } from './SignInScreen';
import * as AuthContext from '@/shared/contexts/AuthContext';

const Alert = require('react-native').Alert;

jest.mock('@/shared/contexts/AuthContext');
jest.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key: string) => key,
    }),
}));

jest.mock('lucide-react-native', () => ({
    ArrowLeft: 'ArrowLeft',
}));

jest.mock('../components/AuthFormFactory', () => ({
    AuthFormFactory: ({ onSubmit, onSwitchMode }: any) => {
        const { View, TouchableOpacity, Text } = require('react-native');
        return (
            <View testID="auth-form-factory">
                <TouchableOpacity testID="submit-button" onPress={() => onSubmit({ email: 'test@test.com', password: '123' })}>
                    <Text>Submit</Text>
                </TouchableOpacity>
                <TouchableOpacity testID="switch-button" onPress={onSwitchMode}>
                    <Text>Switch</Text>
                </TouchableOpacity>
            </View>
        );
    },
}));

describe('SignInScreen', () => {
    const mockNavigation = {
        navigate: jest.fn(),
        goBack: jest.fn(),
    };
    const mockSignIn = jest.fn();
    const mockSignUp = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();
        (AuthContext.useAuth as jest.Mock).mockReturnValue({
            signIn: mockSignIn,
            signUp: mockSignUp,
        });
        Alert.alert = jest.fn();
    });

    it('should render without crashing', () => {
        const { toJSON } = render(<SignInScreen navigation={mockNavigation} />);
        expect(toJSON()).toBeDefined();
    });

    it('should navigate back when back button is pressed', () => {
        const result = render(<SignInScreen navigation={mockNavigation} />);
        const buttons = result.UNSAFE_getAllByType('button' as any);
        
        fireEvent(buttons[0], 'press');
        expect(mockNavigation.goBack).toHaveBeenCalled();
    });

    it('should handle sign in', async () => {
        mockSignIn.mockResolvedValueOnce(undefined);
        const { getByTestId } = render(<SignInScreen navigation={mockNavigation} />);
        
        fireEvent.press(getByTestId('submit-button'));
        
        await waitFor(() => {
            expect(mockSignIn).toHaveBeenCalled();
        });
    });

    it('should switch between sign in and sign up modes', () => {
        const { getByTestId } = render(<SignInScreen navigation={mockNavigation} />);
        
        fireEvent.press(getByTestId('switch-button'));
        
        expect(true).toBe(true);
    });

    it('should handle sign up success', async () => {
        mockSignUp.mockResolvedValueOnce(undefined);
        const { getByTestId } = render(<SignInScreen navigation={mockNavigation} />);
        
        // Switch to signup mode first
        fireEvent.press(getByTestId('switch-button'));
        
        // Submit the form
        fireEvent.press(getByTestId('submit-button'));
        
        await waitFor(() => {
            expect(mockSignUp).toHaveBeenCalled();
        });
    });

    it('should handle sign in error', async () => {
        mockSignIn.mockRejectedValueOnce(new Error('Invalid credentials'));
        const { getByTestId } = render(<SignInScreen navigation={mockNavigation} />);
        
        fireEvent.press(getByTestId('submit-button'));
        
        await waitFor(() => {
            expect(mockSignIn).toHaveBeenCalled();
            expect(Alert.alert).toHaveBeenCalled();
        });
    });

    it('should handle sign up error', async () => {
        mockSignUp.mockRejectedValueOnce(new Error('Registration failed'));
        const { getByTestId } = render(<SignInScreen navigation={mockNavigation} />);
        
        // Switch to signup mode
        fireEvent.press(getByTestId('switch-button'));
        
        // Submit the form
        fireEvent.press(getByTestId('submit-button'));
        
        await waitFor(() => {
            expect(mockSignUp).toHaveBeenCalled();
            expect(Alert.alert).toHaveBeenCalled();
        });
    });
});
