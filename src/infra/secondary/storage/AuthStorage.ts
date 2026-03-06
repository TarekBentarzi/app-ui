import { UserDTO } from '@/application/dto/UserDTO';
import { UniversalStorage } from './UniversalStorage';

// Cache en mémoire pour accès synchrone sur mobile
let tokenCache: string | null = null;
let userCache: UserDTO | null = null;

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
            userCache = user; // Mettre en cache pour accès synchrone
            await UniversalStorage.setItem('user', JSON.stringify(user));
        } catch (error) {
            console.error('[AuthStorage] Error saving user:', error);
        }
    },

    getUser: (): UserDTO | null => {
        try {
            // Sur web, utiliser localStorage
            if (typeof window !== 'undefined' && window.localStorage) {
                const userStr = localStorage.getItem('user');
                if (userStr) {
                    return JSON.parse(userStr);
                }
            }
            // Sur mobile, utiliser le cache en mémoire
            return userCache;
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
                const user = JSON.parse(userStr);
                userCache = user; // Remplir le cache
                return user;
            }
        } catch (error) {
            console.error('[AuthStorage] Error getting user async:', error);
        }
        console.log('[AuthStorage] getUserAsync: Not found');
        userCache = null;
        return null;
    },

    clearUser: async () => {
        console.log('[AuthStorage] clearUser');
        try {
            userCache = null; // Vider le cache
            tokenCache = null; // Vider aussi le cache du token
            await UniversalStorage.removeItem('user');
            await UniversalStorage.removeItem('token');
        } catch (error) {
            console.error('[AuthStorage] Error clearing user:', error);
        }
    },

    saveToken: async (token: string) => {
        try {
            tokenCache = token;
            await UniversalStorage.setItem('token', token);
        } catch (error) {
            console.error('[AuthStorage] Error saving token:', error);
        }
    },

    getToken: (): string | null => {
        try {
            if (typeof window !== 'undefined' && window.localStorage) {
                return localStorage.getItem('token');
            }
            return tokenCache;
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
            tokenCache = token; // Remplir le cache
            return token;
        } catch (error) {
            console.error('[AuthStorage] Error getting token async:', error);
            tokenCache = null;
            return null;
        }
    },

    clearToken: async () => {
        console.log('[AuthStorage] clearToken');
        try {
            tokenCache = null; // Vider le cache
            await UniversalStorage.removeItem('token');
        } catch (error) {
            console.error('[AuthStorage] Error clearing token:', error);
        }
    },
};
