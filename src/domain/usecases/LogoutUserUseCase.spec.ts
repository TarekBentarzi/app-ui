import { LogoutUserUseCase } from './LogoutUserUseCase';
import { AuthStorage } from '@/infra/secondary/storage/AuthStorage';

jest.mock('@/infra/secondary/storage/AuthStorage');

describe('LogoutUserUseCase', () => {
    let useCase: LogoutUserUseCase;

    beforeEach(() => {
        useCase = new LogoutUserUseCase();
        jest.clearAllMocks();
    });

    it('should be defined', () => {
        expect(useCase).toBeDefined();
    });

    it('should clear user from storage', async () => {
        await useCase.execute();
        
        expect(AuthStorage.clearUser).toHaveBeenCalled();
    });
});
