import { LoginRequest, LoginResponse, CreateUserRequest, User } from '../../domain/entities/User';

export interface IAuthRepository {
  login(credentials: LoginRequest): Promise<LoginResponse>;
  register(userData: CreateUserRequest): Promise<User>;
  logout(): Promise<void>;
  refreshToken(refreshToken: string): Promise<LoginResponse>;
  getCurrentUser(): Promise<User>;
}