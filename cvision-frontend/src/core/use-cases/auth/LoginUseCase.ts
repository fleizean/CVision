import { IAuthRepository } from '../../ports/repositories/IAuthRepository';
import { LoginRequest, LoginResponse } from '../../domain/entities/User';

export class LoginUseCase {
  constructor(private authRepository: IAuthRepository) {}

  async execute(credentials: LoginRequest): Promise<LoginResponse> {
    if (!credentials.email || !credentials.password) {
      throw new Error('Email and password are required');
    }

    if (!this.isValidEmail(credentials.email)) {
      throw new Error('Invalid email format');
    }

    return await this.authRepository.login(credentials);
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
}