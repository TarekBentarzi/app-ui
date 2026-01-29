/**
 * Domain Layer - Interface pour le repository
 * Définit le contrat que les implémentations doivent respecter
 */

import { User, CreateUserInput } from '../entities/User';

export interface IUserRepository {
  findAll(): Promise<User[]>;
  findById(id: string): Promise<User | null>;
  create(input: CreateUserInput): Promise<User>;
  update(id: string, input: Partial<User>): Promise<User>;
  delete(id: string): Promise<void>;
}
