import { RegisterUserUseCase } from './RegisterUserUseCase';
import { IUserRepository } from '../repositories/IUserRepository';
import { CreateUserInput, User } from '../entities/User';

describe('RegisterUserUseCase', () => {
    let useCase: RegisterUserUseCase;
    let mockRepository: jest.Mocked<IUserRepository>;

    beforeEach(() => {
        mockRepository = {
            findAll: jest.fn(),
            findById: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
        } as any;
        useCase = new RegisterUserUseCase(mockRepository);
    });

    it('should create a user when valid input is provided', async () => {
        const input: CreateUserInput = { name: 'John Doe', email: 'john@example.com' };
        const mockUser: User = { id: '1', ...input, createdAt: new Date() };
        mockRepository.create.mockResolvedValue(mockUser);

        const result = await useCase.execute(input);

        expect(mockRepository.create).toHaveBeenCalledWith(input);
        expect(result).toEqual(mockUser);
    });

    it('should throw an error if name is missing', async () => {
        const input: any = { email: 'john@example.com' };

        await expect(useCase.execute(input)).rejects.toThrow('Name and Email are required');
    });

    it('should throw an error if email is missing', async () => {
        const input: any = { name: 'John Doe' };

        await expect(useCase.execute(input)).rejects.toThrow('Name and Email are required');
    });
});
