import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { WelcomeScreen } from './WelcomeScreen';

jest.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key: string) => key,
    }),
}));

jest.mock('lucide-react-native', () => ({
    BookOpen: 'BookOpen',
    Trophy: 'Trophy',
    Mic: 'Mic',
}));

describe('WelcomeScreen', () => {
    it('should render without crashing', () => {
        const mockOnContinue = jest.fn();
        const { toJSON } = render(<WelcomeScreen onContinue={mockOnContinue} />);
        expect(toJSON()).toBeDefined();
    });

    it('should call onContinue when button is pressed', () => {
        const mockOnContinue = jest.fn();
        const result = render(<WelcomeScreen onContinue={mockOnContinue} />);
        
        const buttons = result.UNSAFE_getAllByType('button' as any);
        const continueButton = buttons[buttons.length - 1];
        fireEvent(continueButton, 'press');
        
        expect(mockOnContinue).toHaveBeenCalled();
    });

    it('should display welcome content', () => {
        const mockOnContinue = jest.fn();
        const { toJSON } = render(<WelcomeScreen onContinue={mockOnContinue} />);
        const rendered = JSON.stringify(toJSON());
        
        expect(rendered).toContain('welcome.title');
        expect(rendered).toContain('welcome.get_started');
    });
});
