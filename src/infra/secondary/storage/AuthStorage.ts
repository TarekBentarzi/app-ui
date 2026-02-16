import { UserDTO } from '@/application/dto/UserDTO';

export const AuthStorage = {
    // Robust check for web environment
    isBrowser: () => {
        try {
            return typeof window !== 'undefined' &&
                typeof window.localStorage !== 'undefined' &&
                window.location?.protocol?.startsWith('file:') === false;
        } catch (e) {
            return false;
        }
    },

    setItem: (key: string, value: string) => {
        if (AuthStorage.isBrowser()) {
            localStorage.setItem(key, value);
        }
    },

    getItem: (key: string): string | null => {
        if (AuthStorage.isBrowser()) {
            const value = localStorage.getItem(key);
            console.log(`[AuthStorage] getItem: ${key}`, value ? 'Found' : 'Not found');
            return value;
        }
        return null;
    },

    removeItem: (key: string) => {
        if (AuthStorage.isBrowser()) {
            console.log(`[AuthStorage] removeItem: ${key}`);
            localStorage.removeItem(key);
        }
    },

    saveUser: (user: any) => {
        console.log('[AuthStorage] saveUser', user);
        AuthStorage.setItem('user', JSON.stringify(user));
    },

    getUser: () => {
        // Cleanup all possible legacy keys
        if (AuthStorage.isBrowser()) {
            ['auth_user', 'auth_token', 'authUser', 'authToken'].forEach(k => {
                if (localStorage.getItem(k)) {
                    console.warn(`[AuthStorage] Removing legacy key: ${k}`);
                    localStorage.removeItem(k);
                }
            });
        }

        const user = AuthStorage.getItem('user');
        return user ? JSON.parse(user) : null;
    },

    clearUser: () => {
        console.log('[AuthStorage] clearUser (Nuclear)');
        if (AuthStorage.isBrowser()) {
            localStorage.clear(); // Clear EVERYTHING local for this domain to be sure
            console.log('[AuthStorage] localStorage cleared completely');
        }
    },

    saveToken: (token: string) => {
        console.log('[AuthStorage] saveToken');
        AuthStorage.setItem('token', token);
    },

    getToken: () => {
        return AuthStorage.getItem('token');
    },

    clearToken: () => {
        console.log('[AuthStorage] clearToken');
        AuthStorage.removeItem('token');
    },
};
