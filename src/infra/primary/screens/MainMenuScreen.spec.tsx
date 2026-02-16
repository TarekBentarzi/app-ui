import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { MainMenuScreen } from './MainMenuScreen';

jest.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key: string, data?: any) => key,
    }),
}));

jest.mock('lucide-react-native', () => ({
    BookOpen: 'BookOpen',
    Brain: 'Brain',
    Mic: 'Mic',
    User: 'User',
    Bell: 'Bell',
    Lock: 'Lock',
    Flame: 'Flame',
}));

jest.mock('@/shared/contexts/AuthContext', () => ({
    useAuth: jest.fn(() => ({
        user: null,
    })),
}));

jest.mock('@/shared/contexts/UserProgressContext', () => ({
    useUserProgress: jest.fn(() => ({
        progress: { 
            streak: 0, 
            currentSurah: 1,
            currentVerse: 1, 
            versesRead: 0,
            versesMemorized: 0
        },
    })),
}));

describe('MainMenuScreen', () => {
    const mockNavigation = {
        navigate: jest.fn(),
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should render for guest user', () => {
        const { toJSON } = render(<MainMenuScreen navigation={mockNavigation} />);
        expect(toJSON()).toBeDefined();
    });

    it('should render for signed-in user', () => {
        const { useAuth } = require('@/shared/contexts/AuthContext');
        useAuth.mockReturnValue({
            user: { id: '1', name: 'Test', email: 'test@test.com' },
        });

        const { toJSON } = render(<MainMenuScreen navigation={mockNavigation} />);
        expect(toJSON()).toBeDefined();
    });

    it('should render with user progress', () => {
        const { useAuth } = require('@/shared/contexts/AuthContext');
        const { useUserProgress } = require('@/shared/contexts/UserProgressContext');
        
        useAuth.mockReturnValue({
            user: { id: '1', name: 'Test', email: 'test@test.com' },
        });
        
        useUserProgress.mockReturnValue({
            progress: { 
                streak: 5, 
                currentSurah: 2,
                currentVerse: 10, 
                versesRead: 50,
                versesMemorized: 10
            },
        });

        const { toJSON } = render(<MainMenuScreen navigation={mockNavigation} />);
        expect(toJSON()).toBeDefined();
    });

    it('should navigate to Profile when user icon is pressed (signed in)', () => {
        const { useAuth } = require('@/shared/contexts/AuthContext');
        useAuth.mockReturnValue({
            user: { id: '1', name: 'Test', email: 'test@test.com' },
        });

        const { getByTestId } = render(<MainMenuScreen navigation={mockNavigation} />);
        const userButton = getByTestId('user-icon-button');
        fireEvent.press(userButton);
        
        expect(mockNavigation.navigate).toHaveBeenCalledWith('Profile');
    });

    it('should navigate to SignIn when user icon is pressed (guest)', () => {
        const { useAuth } = require('@/shared/contexts/AuthContext');
        useAuth.mockReturnValue({
            user: null,
        });

        const { getByTestId } = render(<MainMenuScreen navigation={mockNavigation} />);
        const userButton = getByTestId('user-icon-button');
        fireEvent.press(userButton);
        
        expect(mockNavigation.navigate).toHaveBeenCalledWith('SignIn');
    });

    it('should navigate to SignIn when sign in banner button is pressed', () => {
        const { useAuth } = require('@/shared/contexts/AuthContext');
        useAuth.mockReturnValue({
            user: null,
        });

        const { getByTestId } = render(<MainMenuScreen navigation={mockNavigation} />);
        const signInButton = getByTestId('sign-in-banner-button');
        fireEvent.press(signInButton);
        
        expect(mockNavigation.navigate).toHaveBeenCalledWith('SignIn');
    });

    it('should navigate to Reading when reading card is pressed', () => {
        const { getByTestId } = render(<MainMenuScreen navigation={mockNavigation} />);
        const readingCard = getByTestId('reading-card');
        fireEvent.press(readingCard);
        
        expect(mockNavigation.navigate).toHaveBeenCalledWith('Reading');
    });

    it('should navigate to Memorizing when memorizing card is pressed (signed in)', () => {
        const { useAuth } = require('@/shared/contexts/AuthContext');
        useAuth.mockReturnValue({
            user: { id: '1', name: 'Test', email: 'test@test.com' },
        });

        const { getByTestId } = render(<MainMenuScreen navigation={mockNavigation} />);
        const memorizingCard = getByTestId('memorizing-card');
        fireEvent.press(memorizingCard);
        
        expect(mockNavigation.navigate).toHaveBeenCalledWith('Memorizing');
    });

    it('should navigate to SignIn when memorizing card is pressed (guest)', () => {
        const { useAuth } = require('@/shared/contexts/AuthContext');
        useAuth.mockReturnValue({
            user: null,
        });

        const { getByTestId } = render(<MainMenuScreen navigation={mockNavigation} />);
        const memorizingCard = getByTestId('memorizing-card');
        fireEvent.press(memorizingCard);
        
        expect(mockNavigation.navigate).toHaveBeenCalledWith('SignIn');
    });

    it('should navigate to Pronunciation when pronunciation card is pressed (signed in)', () => {
        const { useAuth } = require('@/shared/contexts/AuthContext');
        useAuth.mockReturnValue({
            user: { id: '1', name: 'Test', email: 'test@test.com' },
        });

        const { getByTestId } = render(<MainMenuScreen navigation={mockNavigation} />);
        const pronunciationCard = getByTestId('pronunciation-card');
        fireEvent.press(pronunciationCard);
        
        expect(mockNavigation.navigate).toHaveBeenCalledWith('Pronunciation');
    });

    it('should navigate to SignIn when pronunciation card is pressed (guest)', () => {
        const { useAuth } = require('@/shared/contexts/AuthContext');
        useAuth.mockReturnValue({
            user: null,
        });

        const { getByTestId } = render(<MainMenuScreen navigation={mockNavigation} />);
        const pronunciationCard = getByTestId('pronunciation-card');
        fireEvent.press(pronunciationCard);
        
        expect(mockNavigation.navigate).toHaveBeenCalledWith('SignIn');
    });
});

