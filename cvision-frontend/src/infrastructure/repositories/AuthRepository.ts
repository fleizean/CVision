import { IAuthRepository } from '../../core/ports/repositories/IAuthRepository';
import { LoginRequest, LoginResponse, CreateUserRequest, User } from '../../core/domain/entities/User';
import { apiClient } from '../api/client';
import { API_ENDPOINTS } from '../api/endpoints';

export class AuthRepository implements IAuthRepository {
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    return await apiClient.post<LoginResponse>(API_ENDPOINTS.AUTH.LOGIN, credentials);
  }

  async register(userData: CreateUserRequest): Promise<User> {
    return await apiClient.post<User>(API_ENDPOINTS.AUTH.REGISTER, userData);
  }

  async logout(): Promise<void> {
    await apiClient.post(API_ENDPOINTS.AUTH.LOGOUT);
  }

  async refreshToken(refreshToken: string): Promise<LoginResponse> {
    return await apiClient.post<LoginResponse>(API_ENDPOINTS.AUTH.REFRESH, {
      refreshToken,
    });
  }

  async getCurrentUser(): Promise<User> {
    return await apiClient.get<User>(API_ENDPOINTS.AUTH.ME);
  }
}