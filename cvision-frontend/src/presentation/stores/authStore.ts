import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User, LoginRequest, CreateUserRequest } from '../../core/domain/entities/User';
import { AuthRepository } from '../../infrastructure/repositories/AuthRepository';
import { LoginUseCase } from '../../core/use-cases/auth/LoginUseCase';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

interface AuthActions {
  login: (credentials: LoginRequest) => Promise<void>;
  register: (userData: CreateUserRequest) => Promise<void>;
  logout: () => void;
  clearError: () => void;
  setLoading: (loading: boolean) => void;
}

type AuthStore = AuthState & AuthActions;

const authRepository = new AuthRepository();
const loginUseCase = new LoginUseCase(authRepository);

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      login: async (credentials: LoginRequest) => {
        try {
          set({ isLoading: true, error: null });
          
          const response = await loginUseCase.execute(credentials);
          
          if (typeof window !== 'undefined') {
            localStorage.setItem('auth_token', response.token.accessToken);
            localStorage.setItem('refresh_token', response.token.refreshToken);
          }

          set({
            user: response.user,
            token: response.token.accessToken,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });
        } catch (error: any) {
          set({
            error: error.message || 'Login failed',
            isLoading: false,
          });
          throw error;
        }
      },

      register: async (userData: CreateUserRequest) => {
        try {
          set({ isLoading: true, error: null });
          
          const user = await authRepository.register(userData);
          
          set({
            isLoading: false,
            error: null,
          });
        } catch (error: any) {
          set({
            error: error.message || 'Registration failed',
            isLoading: false,
          });
          throw error;
        }
      },

      logout: () => {
        if (typeof window !== 'undefined') {
          localStorage.removeItem('auth_token');
          localStorage.removeItem('refresh_token');
          localStorage.removeItem('user');
        }
        
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          error: null,
        });
      },

      clearError: () => set({ error: null }),
      
      setLoading: (loading: boolean) => set({ isLoading: loading }),
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);