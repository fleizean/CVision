import { apiClient } from '../api/client';
import { API_ENDPOINTS } from '../api/endpoints';

export interface SystemUser {
  Id: string;
  Name: string;
  Surname: string;
  Email: string;
  UserName: string;
  IsActive: boolean;
  Roles: string[];
  LastLogin: string | null;
  CreatedAt: string;
  CvFilesCount: number;
}

export interface CreateUserRequest {
  Name: string;
  Surname: string;
  Email: string;
  Password: string;
}

export interface UpdateUserRequest {
  Name: string;
  Surname: string;
  Email: string;
  Password?: string;
  RoleId: string;
}

export interface UserApiResponse {
  StatusCode: number;
  Message: string;
  Title?: string;
  Data: any;
}

export interface UsersListResponse {
  Users: SystemUser[];
  TotalCount: number;
}

export class UserRepository {
  async getUsers(page: number = 0, size: number = 50): Promise<{ users: SystemUser[], totalCount: number }> {
    try {
      const response = await apiClient.get<UserApiResponse>(API_ENDPOINTS.ADMIN.USERS.LIST(page, size));
      
      if (response.Data && response.Data.Users) {
        return {
          users: response.Data.Users,
          totalCount: response.Data.TotalCount || 0
        };
      }
      
      return { users: [], totalCount: 0 };
    } catch (error) {
      console.error('Error fetching users:', error);
      return { users: [], totalCount: 0 };
    }
  }

  async getUser(id: string): Promise<SystemUser | null> {
    try {
      const response = await apiClient.get<UserApiResponse>(API_ENDPOINTS.ADMIN.USERS.DETAIL(id));
      return response.Data || null;
    } catch (error) {
      console.error('Error fetching user:', error);
      return null;
    }
  }

  async toggleUserStatus(id: string): Promise<{ success: boolean, isActive?: boolean }> {
    try {
      const response = await apiClient.put<UserApiResponse>(API_ENDPOINTS.ADMIN.USERS.TOGGLE_STATUS(id));
      
      if (response.StatusCode === 200 && response.Data) {
        return {
          success: true,
          isActive: response.Data.IsActive
        };
      }
      
      return { success: false };
    } catch (error) {
      console.error('Error toggling user status:', error);
      return { success: false };
    }
  }

  async createUser(userData: CreateUserRequest): Promise<{ success: boolean, message?: string }> {
    try {
      const response = await apiClient.post<UserApiResponse>(API_ENDPOINTS.ADMIN.USERS.CREATE, userData);
      
      return {
        success: response.StatusCode === 200,
        message: response.Message
      };
    } catch (error: any) {
      console.error('Error creating user:', error);
      return {
        success: false,
        message: error.response?.data?.Message || 'Failed to create user'
      };
    }
  }

  async updateUser(id: string, userData: UpdateUserRequest): Promise<{ success: boolean, message?: string }> {
    try {
      const response = await apiClient.put<UserApiResponse>(API_ENDPOINTS.ADMIN.USERS.UPDATE(id), userData);
      
      return {
        success: response.StatusCode === 200,
        message: response.Message
      };
    } catch (error: any) {
      console.error('Error updating user:', error);
      return {
        success: false,
        message: error.response?.data?.Message || 'Failed to update user'
      };
    }
  }

  async resetUserPassword(id: string): Promise<{ success: boolean, message?: string, temporaryPassword?: string }> {
    try {
      const response = await apiClient.post<UserApiResponse>(API_ENDPOINTS.ADMIN.USERS.RESET_PASSWORD(id));
      
      return {
        success: response.StatusCode === 200,
        message: response.Message,
        temporaryPassword: response.Data?.TemporaryPassword
      };
    } catch (error: any) {
      console.error('Error resetting password:', error);
      return {
        success: false,
        message: error.response?.data?.Message || 'Failed to reset password'
      };
    }
  }

  async sendPasswordResetEmail(id: string): Promise<{ success: boolean, message?: string }> {
    try {
      const response = await apiClient.post<UserApiResponse>(API_ENDPOINTS.ADMIN.USERS.SEND_RESET_EMAIL(id));
      
      return {
        success: response.StatusCode === 200,
        message: response.Message
      };
    } catch (error: any) {
      console.error('Error sending password reset email:', error);
      return {
        success: false,
        message: error.response?.data?.Message || 'Failed to send password reset email'
      };
    }
  }
}

export const userRepository = new UserRepository();