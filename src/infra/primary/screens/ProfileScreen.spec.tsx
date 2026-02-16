import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { ProfileScreen } from './ProfileScreen';
import { Alert } from 'react-native';

jest.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key: string, data?: any) => key,
    }),
}));

jest.mock('lucide-react-native', () => ({
    ArrowLeft: 'ArrowLeft',
    User: 'User',
    LogOut: 'LogOut',
    Settings: 'Settings',
    Bell: 'Bell',
    Shield: 'Shield',
}));

const mockSignOut = jest.fn();
const mockResetProgress = jest.fn();

jest.mock('@/shared/contexts/AuthContext', () => ({
    useAuth: jest.fn(() => ({
        user: { id: '1', name: 'Test', email: 'test@test.com' },
        signOut: mockSignOut,
    })),
}));

jest.mock('@/shared/contexts/UserProgressContext', () => ({
    useUserProgress: jest.fn(() => ({
        resetProgress: mockResetProgress,
    })),
}));

jest.mock('@/infra/secondary/storage/AuthStorage', () => ({
    AuthStorage: {
        clearUser: jest.fn(),
    },
}));

jest.spyOn(Alert, 'alert');

describe('ProfileScreen', () => {
    const mockNavigation = {
        navigate: jest.fn(),
        goBack: jest.fn(),
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should render profile screen', () => {
        const { toJSON } = render(<ProfileScreen navigation={mockNavigation} />);
        expect(toJSON()).toBeDefined();
    });

    it('should render user information', () => {
        const { toJSON } = render(<ProfileScreen navigation={mockNavigation} />);
        const rendered = JSON.stringify(toJSON());
        expect(rendered).toContain('Test');
        expect(rendered).toContain('test@test.com');
    });

    it('should render for guest user', () => {
        const { useAuth } = require('@/shared/contexts/AuthContext');
        useAuth.mockReturnValue({
            user: null,
            signOut: mockSignOut,
        });

        const { toJSON } = render(<ProfileScreen navigation={mockNavigation} />);
        const rendered = JSON.stringify(toJSON());
        expect(rendered).toContain('profile.guest');
        expect(rendered).toContain('profile.signin_to_sync');
    });

    it('should handle back button press', () => {
        const { getByTestId } = render(<ProfileScreen navigation={mockNavigation} />);
        const backButton = getByTestId('back-button');
        fireEvent.press(backButton);
        
        expect(mockNavigation.goBack).toHaveBeenCalled();
    });

    it('should show all menu items', () => {
        const { toJSON } = render(<ProfileScreen navigation={mockNavigation} />);
        const rendered = JSON.stringify(toJSON());
        expect(rendered).toContain('profile.preferences');
        expect(rendered).toContain('profile.notifications');
        expect(rendered).toContain('profile.privacy');
        expect(rendered).toContain('profile.reset_progress');
        expect(rendered).toContain('profile.sign_out');
    });

    it('should show sign out alert when sign out button is pressed', () => {
        const { getByTestId } = render(<ProfileScreen navigation={mockNavigation} />);
        const signOutButton = getByTestId('sign-out-button');
        fireEvent.press(signOutButton);
        
        expect(Alert.alert).toHaveBeenCalledWith(
            'profile.sign_out',
            'profile.sign_out_confirm',
            expect.arrayContaining([
                expect.objectContaining({ text: 'common.cancel', style: 'cancel' }),
                expect.objectContaining({ 
                    text: 'profile.sign_out', 
                    style: 'destructive'
                }),
            ])
        );
    });

    it('should call signOut when confirmed', async () => {
        const { getByTestId } = render(<ProfileScreen navigation={mockNavigation} />);
        const signOutButton = getByTestId('sign-out-button');
        fireEvent.press(signOutButton);
        
        // Get the onPress callback from the destructive button
        const alertCall = (Alert.alert as jest.Mock).mock.calls[0];
        const buttons = alertCall[2];
        const destructiveButton = buttons.find((btn: any) => btn.style === 'destructive');
        
        // Execute the onPress callback
        await destructiveButton.onPress();
        
        expect(mockSignOut).toHaveBeenCalled();
        expect(mockNavigation.navigate).toHaveBeenCalledWith('Welcome');
    });

    it('should show reset progress alert when reset button is pressed', () => {
        const { getByTestId } = render(<ProfileScreen navigation={mockNavigation} />);
        const resetButton = getByTestId('reset-progress-button');
        fireEvent.press(resetButton);
        
        expect(Alert.alert).toHaveBeenCalledWith(
            'profile.reset_progress',
            'profile.reset_confirm',
            expect.arrayContaining([
                expect.objectContaining({ text: 'common.cancel', style: 'cancel' }),
                expect.objectContaining({ 
                    text: 'common.reset', 
                    style: 'destructive'
                }),
            ])
        );
    });

    it('should call resetProgress when confirmed', () => {
        const { getByTestId } = render(<ProfileScreen navigation={mockNavigation} />);
        const resetButton = getByTestId('reset-progress-button');
        fireEvent.press(resetButton);
        
        // Get the onPress callback from the destructive button
        const alertCall = (Alert.alert as jest.Mock).mock.calls[0];
        const buttons = alertCall[2];
        const destructiveButton = buttons.find((btn: any) => btn.style === 'destructive');
        
        // Execute the onPress callback
        destructiveButton.onPress();
        
        expect(mockResetProgress).toHaveBeenCalled();
    });

    it('should show nuclear reset alert when nuclear button is pressed', () => {
        const { getByTestId } = render(<ProfileScreen navigation={mockNavigation} />);
        const nuclearButton = getByTestId('nuclear-reset-button');
        fireEvent.press(nuclearButton);
        
        expect(Alert.alert).toHaveBeenCalledWith(
            'profile.nuclear_reset',
            'profile.nuclear_confirm',
            expect.arrayContaining([
                expect.objectContaining({ text: 'common.cancel', style: 'cancel' }),
                expect.objectContaining({ text: 'common.nuke' }),
            ])
        );
    });

    it('should clear user and navigate when nuclear reset confirmed', () => {
        const { AuthStorage } = require('@/infra/secondary/storage/AuthStorage');
        const { getByTestId } = render(<ProfileScreen navigation={mockNavigation} />);
        const nuclearButton = getByTestId('nuclear-reset-button');
        fireEvent.press(nuclearButton);
        
        // Get the onPress callback from the nuke button
        const alertCall = (Alert.alert as jest.Mock).mock.calls[0];
        const buttons = alertCall[2];
        const nukeButton = buttons.find((btn: any) => btn.text === 'common.nuke');
        
        // Execute the onPress callback
        nukeButton.onPress();
        
        expect(AuthStorage.clearUser).toHaveBeenCalled();
        expect(mockNavigation.navigate).toHaveBeenCalledWith('Welcome');
    });
});
