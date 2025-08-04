import { apiClient } from '../api/client';
import { API_ENDPOINTS } from '../api/endpoints';

export interface Role {
  Id: string;
  Name: string;
  NormalizedName: string;
}

export interface CreateRoleRequest {
  Name: string;
}

export interface AssignRoleRequest {
  UserId: string;
  RoleName: string;
}

export interface RemoveRoleRequest {
  UserId: string;
  RoleName: string;
}

export interface UserRole {
  UserId: string;
  UserName: string;
  Email: string;
  Roles: string[];
}

export interface RoleApiResponse {
  StatusCode: number;
  Message: string;
  Title?: string;
  Data: any;
}

export class RoleRepository {
  async getRoles(): Promise<Role[]> {
    try {
      const response = await apiClient.get<RoleApiResponse>(API_ENDPOINTS.ROLES.LIST);
      return Array.isArray(response.Data) ? response.Data : [];
    } catch (error) {
      console.error('Error fetching roles:', error);
      return [];
    }
  }

  async createRole(roleData: CreateRoleRequest): Promise<{ success: boolean, message?: string }> {
    try {
      const response = await apiClient.post<RoleApiResponse>(API_ENDPOINTS.ROLES.CREATE, roleData);
      
      return {
        success: response.StatusCode === 200,
        message: response.Message
      };
    } catch (error: any) {
      console.error('Error creating role:', error);
      return {
        success: false,
        message: error.response?.data?.Message || 'Failed to create role'
      };
    }
  }

  async assignRoleToUser(assignData: AssignRoleRequest): Promise<{ success: boolean, message?: string }> {
    try {
      const response = await apiClient.post<RoleApiResponse>(API_ENDPOINTS.ROLES.ASSIGN, assignData);
      
      return {
        success: response.StatusCode === 200,
        message: response.Message
      };
    } catch (error: any) {
      console.error('Error assigning role:', error);
      return {
        success: false,
        message: error.response?.data?.Message || 'Failed to assign role'
      };
    }
  }

  async removeRoleFromUser(removeData: RemoveRoleRequest): Promise<{ success: boolean, message?: string }> {
    try {
      const response = await apiClient.post<RoleApiResponse>(API_ENDPOINTS.ROLES.REMOVE, removeData);
      
      return {
        success: response.StatusCode === 200,
        message: response.Message
      };
    } catch (error: any) {
      console.error('Error removing role:', error);
      return {
        success: false,
        message: error.response?.data?.Message || 'Failed to remove role'
      };
    }
  }

  async getUserRoles(userId: string): Promise<string[]> {
    try {
      const response = await apiClient.get<RoleApiResponse>(API_ENDPOINTS.ROLES.USER_ROLES(userId));
      return Array.isArray(response.Data) ? response.Data : [];
    } catch (error) {
      console.error('Error fetching user roles:', error);
      return [];
    }
  }

  async getAllUserRoles(): Promise<UserRole[]> {
    try {
      const response = await apiClient.get<RoleApiResponse>(API_ENDPOINTS.ROLES.ALL_USER_ROLES);
      return Array.isArray(response.Data) ? response.Data : [];
    } catch (error) {
      console.error('Error fetching all user roles:', error);
      return [];
    }
  }

  async deleteRole(roleId: string): Promise<{ success: boolean, message?: string }> {
    try {
      const response = await apiClient.delete<RoleApiResponse>(API_ENDPOINTS.ROLES.DELETE(roleId));
      
      return {
        success: response.StatusCode === 200,
        message: response.Message
      };
    } catch (error: any) {
      console.error('Error deleting role:', error);
      return {
        success: false,
        message: error.response?.data?.Message || 'Failed to delete role'
      };
    }
  }
}

export const roleRepository = new RoleRepository();