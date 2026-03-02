import { UserDTO } from '@/application/dto/UserDTO';
import { UniversalStorage } from './UniversalStorage';

export const AuthStorage = {
    // Méthodes utilitaires génériques (synchrones pour la compatibilité web)
    setItem: (key: string, value: string) => {
        if (typeof window !== 'undefined' && window.localStorage) {
            localStorage.setItem(key, value);
        }
    },

    getItem: (key: string): string | null => {
        if (typeof window !== 'undefined' && window.localStorage) {
            return localStorage.getItem(key);
        }
        return null;
    },

    removeItem: (key: string) => {
        if (typeof window !== 'undefined' && window.localStorage) {
            localStorage.removeItem(key);
        }
    },

    // Méthodes spécifiques pour l'authentification
    saveUser: async (user: any) => {
        console.log('[AuthStorage] saveUser', user);
        try {
            await UniversalStorage.setItem('user', JSON.stringify(user));
        } catch (error) {
            console.error('[AuthStorage] Error saving user:', error);
        }
    },

    getUser: (): UserDTO | null => {
        try {
            // Note: We make this synchronous by using a stored value
            // The actual async loading happens in AuthContext initialization
            const userStr = typeof window !== 'undefined' && window.localStorage 
                ? localStorage.getItem('user')
                : null;
            
            if (userStr) {
                return JSON.parse(userStr);
            }
        } catch (error) {
            console.error('[AuthStorage] Error getting user:', error);
        }
        return null;
    },

    // Async version for proper initialization
    getUserAsync: async (): Promise<UserDTO | null> => {
        try {
            const userStr = await UniversalStorage.getItem('user');
            if (userStr) {
                console.log('[AuthStorage] getUserAsync: Found');
                return JSON.parse(userStr);
            }
        } catch (error) {
            console.error('[AuthStorage] Error getting user async:', error);
        }
        console.log('[AuthStorage] getUserAsync: Not found');
        return null;
    },

    clearUser: async () => {
        console.log('[AuthStorage] clearUser');
        try {
            await UniversalStorage.removeItem('user');
            await UniversalStorage.removeItem('token');
        } catch (error) {
            console.error('[AuthStorage] Error clearing user:', error);
        }
    },

    saveToken: async (token: string) => {
        console.log('[AuthStorage] saveToken');
        try {
            await UniversalStorage.setItem('token', token);
        } catch (error) {
            console.error('[AuthStorage] Error saving token:', error);
        }
    },

    getToken: (): string | null => {
        try {
            // Synchronous version for immediate access
            const token = typeof window !== 'undefined' && window.localStorage 
                ? localStorage.getItem('token')
                : null;
            return token;
        } catch (error) {
            console.error('[AuthStorage] Error getting token:', error);
            return null;
        }
    },

    // Async version for proper initialization
    getTokenAsync: async (): Promise<string | null> => {
        try {
            const token = await UniversalStorage.getItem('token');
            console.log('[AuthStorage] getTokenAsync:', token ? 'Found' : 'Not found');
            return token;
        } catch (error) {
            console.error('[AuthStorage] Error getting token async:', error);
            return null;
        }
    },

    clearToken: async () => {
        console.log('[AuthStorage] clearToken');
        try {
            await UniversalStorage.removeItem('token');
        } catch (error) {
            console.error('[AuthStorage] Error clearing token:', error);
        }
    },
};
