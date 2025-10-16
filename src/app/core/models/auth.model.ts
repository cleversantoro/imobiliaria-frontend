export interface LoginRequest {
  username: string;
  password: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken?: string;
  expiresIn?: number;
}

export interface AdminUser {
  id: number;
  username: string;
  email: string;
  full_name?: string;
  is_active?: boolean;
}

export interface AuthResponse {
  user: AdminUser;
  tokens: AuthTokens;
}
