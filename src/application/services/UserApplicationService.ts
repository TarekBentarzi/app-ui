import { GetAllUsersUseCase } from '@/domain/usecases/GetAllUsersUseCase';
import { RegisterUserUseCase } from '@/domain/usecases/RegisterUserUseCase';
import { LogoutUserUseCase } from '@/domain/usecases/LogoutUserUseCase';
import { IUserRepository } from '@/domain/repositories/IUserRepository';
import { UserDTO } from '../dto/UserDTO';
import { CreateUserInput } from '@/domain/entities/User';
import { apiClient } from '@/infra/secondary/api/apiClient';
import { AuthStorage } from '@/infra/secondary/storage/AuthStorage';

export class UserApplicationService {
  private getAllUsersUseCase: GetAllUsersUseCase;
  private registerUserUseCase: RegisterUserUseCase;
  private logoutUserUseCase: LogoutUserUseCase;

  constructor(userRepository: IUserRepository) {
    this.getAllUsersUseCase = new GetAllUsersUseCase(userRepository);
    this.registerUserUseCase = new RegisterUserUseCase(userRepository);
    this.logoutUserUseCase = new LogoutUserUseCase();
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

  async login(email: string, password: string): Promise<{ user: UserDTO; token: string }> {
    const response = await apiClient.post('/auth/login', { email, password });
    apiClient.setToken(response.access_token);
    AuthStorage.saveToken(response.access_token);
    return {
      user: response.user,
      token: response.access_token,
    };
  }

  async logout(): Promise<void> {
    await this.logoutUserUseCase.execute();
    apiClient.setToken(null);
    AuthStorage.clearToken();
    AuthStorage.clearUser(); // Nettoyer aussi l'utilisateur
  }
}
