import { UserDTO } from '@/application/dto/UserDTO';

export const AuthStorage = {
    isBrowser: () => typeof window !== 'undefined',

    saveUser: (user: UserDTO) => {
        if (AuthStorage.isBrowser()) {
            localStorage.setItem('auth_user', JSON.stringify(user));
        }
    },

    getUser: (): UserDTO | null => {
        if (AuthStorage.isBrowser()) {
            const user = localStorage.getItem('auth_user');
            return user ? JSON.parse(user) : null;
        }
        return null;
    },

    clearUser: () => {
        if (AuthStorage.isBrowser()) {
            localStorage.removeItem('auth_user');
        }
    },
};
