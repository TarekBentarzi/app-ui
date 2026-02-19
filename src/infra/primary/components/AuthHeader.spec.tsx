import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { AuthHeader } from './AuthHeader';
import { UserDTO } from '@/application/dto/UserDTO';
import '@testing-library/jest-dom';

describe('AuthHeader component', () => {
    const onSignInPress = jest.fn();
    const onSignOutPress = jest.fn();
    const mockUser: UserDTO = { id: '1', name: 'Alice', email: 'alice@example.com' };

    it('should render Sign In button when no user', () => {
        render(
            <AuthHeader
                user={null}
                onSignInPress={onSignInPress}
                onSignOutPress={onSignOutPress}
            />
        );

        expect(screen.getByText('Sign In')).toBeInTheDocument();
    });

    it('should call onSignInPress when clicking Sign In', () => {
        render(
            <AuthHeader
                user={null}
                onSignInPress={onSignInPress}
                onSignOutPress={onSignOutPress}
            />
        );

        fireEvent.click(screen.getByText('Sign In'));
        expect(onSignInPress).toHaveBeenCalled();
    });

    it('should render user name and Sign Out when user is present', () => {
        render(
            <AuthHeader
                user={mockUser}
                onSignInPress={onSignInPress}
                onSignOutPress={onSignOutPress}
            />
        );

        expect(screen.getByText('Alice')).toBeInTheDocument();
        expect(screen.getByText('Sign Out')).toBeInTheDocument();
    });

    it('should call onSignOutPress when clicking Sign Out', () => {
        render(
            <AuthHeader
                user={mockUser}
                onSignInPress={onSignInPress}
                onSignOutPress={onSignOutPress}
            />
        );

        fireEvent.click(screen.getByText('Sign Out'));
        expect(onSignOutPress).toHaveBeenCalled();
    });
});
