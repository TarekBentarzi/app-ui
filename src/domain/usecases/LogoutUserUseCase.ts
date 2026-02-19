import { AuthStorage } from '@/infra/secondary/storage/AuthStorage';

export class LogoutUserUseCase {
    constructor() { }

    async execute(): Promise<void> {
        AuthStorage.clearUser();
    }
}
