import { ActivityType } from "../repositories/ActivityRepository";

export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/api/auth/login',
    REGISTER: '/api/auth/register',
    REFRESH: '/api/auth/refresh',
    LOGOUT: '/api/auth/logout',
    ME: '/api/auth/me',
  },
  USER: {
    PROFILE: '/api/User/profile',
    UPDATE_PROFILE: '/api/User/profile',
    CHANGE_PASSWORD: '/api/user/change-password',
  },
  ADMIN: {
    USERS: {
      LIST: (page: number, size: number) => `/api/User/admin/users?page=${page}&size=${size}`,
      DETAIL: (id: string) => `/api/User/admin/users/${id}`,
      CREATE: '/api/User/admin/users',
      UPDATE: (id: string) => `/api/User/admin/users/${id}`,
      TOGGLE_STATUS: (id: string) => `/api/User/admin/users/${id}/toggle-status`,
      RESET_PASSWORD: (id: string) => `/api/User/admin/users/${id}/reset-password`,
      SEND_RESET_EMAIL: (id: string) => `/api/User/admin/users/${id}/send-password-reset-email`,
    }
  },
  ROLES: {
    LIST: '/api/Roles',
    CREATE: '/api/Roles',
    ASSIGN: '/api/Roles/assign',
    REMOVE: '/api/Roles/remove',
    USER_ROLES: (userId: string) => `/api/Roles/user/${userId}`,
    ALL_USER_ROLES: '/api/Roles/users',
    DELETE: (roleId: string) => `/api/Roles/${roleId}`,
  },
  CV_ANALYSIS: {
    UPLOAD: '/api/cv-analysis/upload',
    ANALYZE: '/api/cv-analysis/analyze',
    RESULTS: '/api/cv-analysis/results',
    HISTORY: '/api/cv-analysis/history',
  },
  JOB_PROFILE: {
    CREATE: '/api/JobProfiles',
    LIST: '/api/JobProfiles',
    DETAIL: (id: string) => `/api/JobProfiles/${id}`,
    UPDATE: '/api/JobProfiles',
    DELETE: (id: string) => `/api/JobProfiles/${id}`,
    BY_TITLE: (title: string) => `/api/JobProfiles/by-title/${title}`,
    RECENT: (count: number) => `/api/JobProfiles/recent?count=${count}`,
  },
  CV_MATCHING: {
    MATCH_WITH_JOB: (cvId: string, jobProfileId: string) => `/api/CVMatching/match/${cvId}/with-job/${jobProfileId}`,
    MATCH_WITH_ALL_JOBS: (cvId: string) => `/api/CVMatching/match/${cvId}/with-all-jobs`,
    TOP_MATCHES: (jobProfileId: string, limit?: number) => `/api/CVMatching/top-matches/${jobProfileId}${limit ? `?limit=${limit}` : ''}`,
  },
  ACTIVITY: {
    BASE: '/api/Activity',
    RECENT: (count: number) => `/api/Activity/recent?count=${count}`,
    USER: (userId: string, count: number) => `/api/Activity/user/${userId}?count=${count}`,
    TYPE: (type: keyof ActivityType, count: number) => `/api/Activity/type/${type}?count=${count}`,
    PAGINATED: (page: number, pageSize: number) => `/api/Activity?page=${page}&pageSize=${pageSize}`,
  },
} as const;