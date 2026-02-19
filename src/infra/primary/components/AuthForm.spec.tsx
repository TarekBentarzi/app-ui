import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import { AuthForm } from './AuthForm';
import { Text } from 'react-native';

describe('AuthForm', () => {
    const defaultProps = {
        title: 'Title',
        subtitle: 'Subtitle',
        submitLabel: 'Submit',
        onSubmit: jest.fn().mockResolvedValue(undefined),
        loading: false,
        error: null,
    };

    it('renders basic info and children', () => {
        const { getByText } = render(
            <AuthForm {...defaultProps}>
                <Text>Child Content</Text>
            </AuthForm>
        );

        expect(getByText('Title')).toBeDefined();
        expect(getByText('Subtitle')).toBeDefined();
        expect(getByText('Child Content')).toBeDefined();
        expect(getByText('Submit')).toBeDefined();
    });

    it('shows loading indicator when loading', () => {
        const { queryByText } = render(
            <AuthForm {...defaultProps} loading={true}>
                <Text>Child</Text>
            </AuthForm>
        );
        expect(queryByText('Submit')).toBeNull();
    });

    it('shows error message when provided', () => {
        const { getByText } = render(
            <AuthForm {...defaultProps} error="Something went wrong">
                <Text>Child</Text>
            </AuthForm>
        );
        expect(getByText('Something went wrong')).toBeDefined();
    });

    it('calls onSubmit when button is pressed', async () => {
        const { getByText } = render(
            <AuthForm {...defaultProps}>
                <Text>Child</Text>
            </AuthForm>
        );
        fireEvent.click(getByText('Submit'));
        expect(defaultProps.onSubmit).toHaveBeenCalled();
    });

    it('renders secondary action when provided', () => {
        const onSecondary = jest.fn();
        const { getByText } = render(
            <AuthForm {...defaultProps} secondaryActionLabel="Switch" onSecondaryAction={onSecondary}>
                <Text>Child</Text>
            </AuthForm>
        );
        fireEvent.click(getByText('Switch'));
        expect(onSecondary).toHaveBeenCalled();
    });
});
