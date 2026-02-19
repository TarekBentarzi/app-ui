/**
 * Domain Layer - Use Case (Logique métier)
 * Cas d'usage: récupérer tous les utilisateurs
 */

import { User } from '../entities/User';
import { IUserRepository } from '../repositories/IUserRepository';

export class GetAllUsersUseCase {
  constructor(private userRepository: IUserRepository) {}

  async execute(): Promise<User[]> {
    return this.userRepository.findAll();
  }
}
