import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { RegistrationForm } from './RegistrationForm';
import '@testing-library/jest-dom';

describe('RegistrationForm component', () => {
    const onRegister = jest.fn();
    const onCancel = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should render the form', () => {
        render(<RegistrationForm onRegister={onRegister} onCancel={onCancel} />);
        expect(screen.getByPlaceholderText('Full Name')).toBeInTheDocument();
    });

    it('should show error if name or email is missing on submit', () => {
        render(<RegistrationForm onRegister={onRegister} onCancel={onCancel} />);
        fireEvent.click(screen.getByText('Confirm Registration'));
        expect(screen.getByText('Name and Email are required')).toBeInTheDocument();
    });

    it('should call onRegister with valid data', async () => {
        onRegister.mockResolvedValueOnce(undefined);
        render(<RegistrationForm onRegister={onRegister} onCancel={onCancel} />);
        fireEvent.change(screen.getByPlaceholderText('Full Name'), { target: { value: 'John' } });
        fireEvent.change(screen.getByPlaceholderText('Email Address'), { target: { value: 'j@e.c' } });
        fireEvent.click(screen.getByText('Confirm Registration'));
        await waitFor(() => expect(onRegister).toHaveBeenCalled());
    });

    it('should handle registration failure and log it', async () => {
        const error = new Error('Form error');
        onRegister.mockRejectedValue(error);
        const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => { });

        render(<RegistrationForm onRegister={onRegister} onCancel={onCancel} />);
        fireEvent.change(screen.getByPlaceholderText('Full Name'), { target: { value: 'John' } });
        fireEvent.change(screen.getByPlaceholderText('Email Address'), { target: { value: 'j@e.c' } });
        fireEvent.click(screen.getByText('Confirm Registration'));

        await waitFor(() => {
            expect(screen.getByText('Form error')).toBeInTheDocument();
            expect(consoleSpy).toHaveBeenCalledWith(error);
        });
        consoleSpy.mockRestore();
    });

    it('should call onCancel', () => {
        render(<RegistrationForm onRegister={onRegister} onCancel={onCancel} />);
        fireEvent.click(screen.getByText('Cancel'));
        expect(onCancel).toHaveBeenCalled();
    });

    it('should handle registration failure without message', async () => {
        onRegister.mockRejectedValueOnce({}); // No message
        render(<RegistrationForm onRegister={onRegister} onCancel={onCancel} />);

        fireEvent.change(screen.getByPlaceholderText('Full Name'), { target: { value: 'John' } });
        fireEvent.change(screen.getByPlaceholderText('Email Address'), { target: { value: 'j@e.c' } });
        fireEvent.click(screen.getByText('Confirm Registration'));

        await waitFor(() => {
            expect(screen.getByText('Registration failed')).toBeInTheDocument();
        });
    });
});
