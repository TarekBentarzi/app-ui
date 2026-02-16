import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { UserDTO } from '@/application/dto/UserDTO';
import { UserApplicationService } from '@/application/services/UserApplicationService';
import { UserApiRepository } from '@/infra/secondary/repositories/UserApiRepository';
import { AuthStorage } from '@/infra/secondary/storage/AuthStorage';
import { CreateUserInput } from '@/domain/entities/User';
import { apiClient } from '@/infra/secondary/api/apiClient';

interface AuthContextType {
    user: UserDTO | null;
    loading: boolean;
    signIn: (email: string, password: string) => Promise<UserDTO>;
    signUp: (data: CreateUserInput & { password: string }) => Promise<UserDTO>;
    signOut: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Initialize services
const userRepository = new UserApiRepository();
const userService = new UserApplicationService(userRepository);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<UserDTO | null>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const savedUser = AuthStorage.getUser();
        const savedToken = AuthStorage.getToken();
        console.log('[AuthContext] Init', { savedUser, savedToken });
        if (savedUser && savedToken) {
            setUser(savedUser);
            apiClient.setToken(savedToken);
        } else if (savedUser || savedToken) {
            console.warn('[AuthContext] Partial session found, clearing...');
            AuthStorage.clearUser();
        }
    }, []);

    const signIn = useCallback(async (email: string, password: string) => {
        setLoading(true);
        console.log('[AuthContext] signIn called', { email });
        try {
            const { user: loggedUser } = await userService.login(email, password);
            console.log('[AuthContext] signIn success', loggedUser);
            setUser(loggedUser);
            AuthStorage.saveUser(loggedUser);
            return loggedUser;
        } catch (error) {
            console.error('[AuthContext] signIn failed:', error);
            throw error;
        } finally {
            setLoading(false);
        }
    }, []);

    const signUp = useCallback(async (data: CreateUserInput & { password: string }) => {
        setLoading(true);
        console.log('[AuthContext] signUp called', { email: data.email });
        try {
            const newUser = await userService.register(data);
            console.log('[AuthContext] signUp success, attempting auto-login...');
            const { user: loggedUser } = await userService.login(data.email, data.password);
            setUser(loggedUser);
            AuthStorage.saveUser(loggedUser);
            return loggedUser;
        } catch (error) {
            console.error('[AuthContext] signUp failed:', error);
            throw error;
        } finally {
            setLoading(false);
        }
    }, []);

    const signOut = useCallback(async () => {
        console.log('[AuthContext] signOut called');
        try {
            await userService.logout();
            apiClient.setToken(null);
            setUser(null);
            console.log('[AuthContext] signOut success');
        } catch (error) {
            console.error('[AuthContext] signOut failed:', error);
        }
    }, []);

    return (
        <AuthContext.Provider value={{ user, loading, signIn, signUp, signOut }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
