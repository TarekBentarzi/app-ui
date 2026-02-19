import React from 'react';
import { render, fireEvent, act } from '@testing-library/react-native';
import { AuthFormFactory } from './AuthFormFactory';

jest.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key: string) => key,
    }),
}));

jest.mock('lucide-react-native', () => ({
    Mail: 'Mail',
    Lock: 'Lock',
    User: 'User',
}));

const mockOnSubmitProp = jest.fn();
let capturedOnSubmit: (() => void) | undefined;
let capturedInputs: any = {};

jest.mock('./AuthForm', () => ({
    AuthForm: ({ onSubmit, children }: any) => {
        capturedOnSubmit = onSubmit;
        const { View, TouchableOpacity, Text } = require('react-native');
        return (
            <View testID="auth-form">
                <TouchableOpacity testID="submit-button" onPress={onSubmit}>
                    <Text>Submit</Text>
                </TouchableOpacity>
                {children}
            </View>
        );
    },
}));

// Mock TextInput to capture onChangeText handlers
jest.mock('react-native', () => {
    const actualRN = jest.requireActual('react-native');
    return {
        ...actualRN,
        TextInput: ({ placeholder, onChangeText, testID, ...props }: any) => {
            capturedInputs[placeholder] = onChangeText;
            const { TextInput: RealTextInput } = actualRN;
            return <RealTextInput testID={testID || placeholder} onChangeText={onChangeText} {...props} />;
        },
    };
});

describe('AuthFormFactory', () => {
    const mockOnSwitchMode = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();
        mockOnSubmitProp.mockClear();
        capturedOnSubmit = undefined;
        capturedInputs = {};
    });

    it('should render login form', () => {
        const { getByTestId } = render(
            <AuthFormFactory
                type="login"
                onSubmit={mockOnSubmitProp}
                onSwitchMode={mockOnSwitchMode}
                loading={false}
            />
        );
        
        expect(getByTestId('auth-form')).toBeDefined();
    });

    it('should render register form with name field', () => {
        const { getByTestId } = render(
            <AuthFormFactory
                type="register"
                onSubmit={mockOnSubmitProp}
                onSwitchMode={mockOnSwitchMode}
                loading={false}
            />
        );
        
        expect(getByTestId('auth-form')).toBeDefined();
    });

    it('should render with loading state', () => {
        const { getByTestId } = render(
            <AuthFormFactory
                type="login"
                onSubmit={mockOnSubmitProp}
                onSwitchMode={mockOnSwitchMode}
                loading={true}
            />
        );
        
        expect(getByTestId('auth-form')).toBeDefined();
    });

    it('should validate required fields for login', async () => {
        render(
            <AuthFormFactory
                type="login"
                onSubmit={mockOnSubmitProp}
                onSwitchMode={mockOnSwitchMode}
                loading={false}
            />
        );
        
        // Call handleSubmit with empty fields
        await act(async () => {
            if (capturedOnSubmit) {
                await capturedOnSubmit();
            }
        });
        
        expect(mockOnSubmitProp).not.toHaveBeenCalled();
    });

    it('should validate required fields for register including name', async () => {
        render(
            <AuthFormFactory
                type="register"
                onSubmit={mockOnSubmitProp}
                onSwitchMode={mockOnSwitchMode}
                loading={false}
            />
        );
        
        // Call handleSubmit with empty fields (should fail because register requires name)
        await act(async () => {
            if (capturedOnSubmit) {
                await capturedOnSubmit();
            }
        });
        
        expect(mockOnSubmitProp).not.toHaveBeenCalled();
    });

    it('should submit successfully with valid data', async () => {
        mockOnSubmitProp.mockResolvedValueOnce(undefined);
        
        render(
            <AuthFormFactory
                type="login"
                onSubmit={mockOnSubmitProp}
                onSwitchMode={mockOnSwitchMode}
                loading={false}
            />
        );
        
        // Fill in the form
        act(() => {
            if (capturedInputs['auth.email']) {
                capturedInputs['auth.email']('test@example.com');
            }
            if (capturedInputs['auth.password']) {
                capturedInputs['auth.password']('password123');
            }
        });
        
        // Submit the form
        await act(async () => {
            if (capturedOnSubmit) {
                await capturedOnSubmit();
            }
        });
        
        expect(mockOnSubmitProp).toHaveBeenCalledWith({
            name: '',
            email: 'test@example.com',
            password: 'password123',
        });
    });

    it('should handle submit errors', async () => {
        const error = new Error('Auth failed');
        mockOnSubmitProp.mockRejectedValueOnce(error);
        
        render(
            <AuthFormFactory
                type="login"
                onSubmit={mockOnSubmitProp}
                onSwitchMode={mockOnSwitchMode}
                loading={false}
            />
        );
        
        // Fill in the form
        act(() => {
            if (capturedInputs['auth.email']) {
                capturedInputs['auth.email']('test@example.com');
            }
            if (capturedInputs['auth.password']) {
                capturedInputs['auth.password']('password123');
            }
        });
        
        // Submit the form
        await act(async () => {
            if (capturedOnSubmit) {
                await capturedOnSubmit();
            }
        });
        
        expect(mockOnSubmitProp).toHaveBeenCalled();
    });
});

