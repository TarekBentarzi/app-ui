/**
 * Application Layer - Service Application
 * Orchestre les use cases et les adapte pour l'interface
 */

import { GetAllUsersUseCase } from '@/domain/usecases/GetAllUsersUseCase';
import { RegisterUserUseCase } from '@/domain/usecases/RegisterUserUseCase';
import { IUserRepository } from '@/domain/repositories/IUserRepository';
import { UserDTO } from '../dto/UserDTO';
import { CreateUserInput } from '@/domain/entities/User';

export class UserApplicationService {
  private getAllUsersUseCase: GetAllUsersUseCase;
  private registerUserUseCase: RegisterUserUseCase;

  constructor(userRepository: IUserRepository) {
    this.getAllUsersUseCase = new GetAllUsersUseCase(userRepository);
    this.registerUserUseCase = new RegisterUserUseCase(userRepository);
  }

  async getAllUsers(): Promise<UserDTO[]> {
    const users = await this.getAllUsersUseCase.execute();
    return users.map((user) => ({
      id: user.id,
      name: user.name,
      email: user.email,
    }));
  }

  async register(input: CreateUserInput): Promise<UserDTO> {
    const user = await this.registerUserUseCase.execute(input);
    return {
      id: user.id,
      name: user.name,
      email: user.email,
    };
  }
}
