export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  role?: 'admin' | 'employee';
  jobPosition: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'employee';
  jobPosition: string;
  dateHired: string;
  profilePicture?: string;
}

export interface JWTPayload {
  userId: string;
  email: string;
  role: string;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}
