/**
 * Application Layer - Service Application
 * Orchestre les use cases et les adapte pour l'interface
 */

import { GetAllUsersUseCase } from '@/domain/usecases/GetAllUsersUseCase';
import { IUserRepository } from '@/domain/repositories/IUserRepository';
import { UserDTO } from '../dto/UserDTO';

export class UserApplicationService {
  private getAllUsersUseCase: GetAllUsersUseCase;

  constructor(userRepository: IUserRepository) {
    this.getAllUsersUseCase = new GetAllUsersUseCase(userRepository);
  }

  async getAllUsers(): Promise<UserDTO[]> {
    const users = await this.getAllUsersUseCase.execute();
    return users.map((user) => ({
      id: user.id,
      name: user.name,
      email: user.email,
    }));
  }
}
