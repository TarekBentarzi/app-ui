import { CreateUserInput, User } from '../entities/User';
import { IUserRepository } from '../repositories/IUserRepository';

export class RegisterUserUseCase {
    constructor(private userRepository: IUserRepository) { }

    async execute(input: CreateUserInput): Promise<User> {
        if (!input.email || !input.name) {
            throw new Error('Name and Email are required');
        }
        return this.userRepository.create(input);
    }
}
