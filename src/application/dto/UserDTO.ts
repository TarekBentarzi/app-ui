/**
 * Application Layer - DTO (Data Transfer Object)
 * Format de données pour les transferts
 */

export interface UserDTO {
  id: string;
  name: string;
  email: string;
}

export interface CreateUserDTO {
  name: string;
  email: string;
}
