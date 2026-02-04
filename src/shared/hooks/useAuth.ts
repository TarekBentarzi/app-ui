import { useState, useEffect, useCallback } from 'react';
import { UserDTO } from '@/application/dto/UserDTO';
import { UserApplicationService } from '@/application/services/UserApplicationService';
import { AuthStorage } from '@/infra/secondary/storage/AuthStorage';
import { CreateUserInput } from '@/domain/entities/User';

export const useAuth = (userService: UserApplicationService) => {
    const [user, setUser] = useState<UserDTO | null>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const savedUser = AuthStorage.getUser();
        if (savedUser) {
            setUser(savedUser);
        }
    }, []);

    const signIn = useCallback(async (data: CreateUserInput) => {
        setLoading(true);
        try {
            const loggedUser = await userService.register(data);
            setUser(loggedUser);
            AuthStorage.saveUser(loggedUser);
            return loggedUser;
        } catch (error) {
            console.error('Sign in failed:', error);
            throw error;
        } finally {
            setLoading(false);
        }
    }, [userService]);

    const signOut = useCallback(() => {
        AuthStorage.clearUser();
        setUser(null);
    }, []);

    return { user, loading, signIn, signOut };
};
