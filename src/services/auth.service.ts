import { PrismaClient } from '@prisma/client';
import { compare } from 'bcrypt';
import { signAccessToken, signRefreshToken, verifyRefreshToken, hashPassword } from '@/lib/auth';
import { UserDAO } from '@/dao';
import type {
  LoginCredentials,
  RegisterData,
  AuthTokens,
  AuthUser,
  JWTPayload,
} from '@/types';

export class AuthService {
  private userDAO: UserDAO;

  constructor(prisma: PrismaClient) {
    this.userDAO = new UserDAO(prisma);
  }

  /**
   * Login user with email and password
   */
  async login(credentials: LoginCredentials): Promise<{
    user: AuthUser;
    tokens: AuthTokens;
  }> {
    const { email, password } = credentials;

    // Find user by email
    const user = await this.userDAO.findByEmail(email);
    if (!user) {
      throw new Error('Invalid credentials');
    }

    // Verify password
    const isValidPassword = await compare(password, user.passwordHash);
    if (!isValidPassword) {
      throw new Error('Invalid credentials');
    }

    // Generate tokens
    const tokens = await this.generateTokens({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    // Return user without password
    const { passwordHash, ...userWithoutPassword } = user;

    return {
      user: {
        ...userWithoutPassword,
        dateHired: userWithoutPassword.dateHired?.toISOString().split('T')[0] || '',
      } as AuthUser,
      tokens,
    };
  }

  /**
   * Register new user
   */
  async register(data: RegisterData): Promise<{
    user: AuthUser;
    tokens: AuthTokens;
  }> {
    // Check if email already exists
    const existingUser = await this.userDAO.findByEmail(data.email);
    if (existingUser) {
      throw new Error('Email already in use');
    }

    // Hash password
    const hashedPassword = await hashPassword(data.password);

    // Create user
    const user = await this.userDAO.create({
      ...data,
      password: hashedPassword,
    });

    // Generate tokens
    const tokens = await this.generateTokens({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    // Return user without password
    const { passwordHash, ...userWithoutPassword } = user;

    return {
      user: {
        ...userWithoutPassword,
        dateHired: userWithoutPassword.dateHired?.toISOString().split('T')[0] || '',
      } as AuthUser,
      tokens,
    };
  }

  /**
   * Refresh access token
   */
  async refreshToken(refreshToken: string): Promise<AuthTokens> {
    try {
      // Verify refresh token
      const payload = await verifyRefreshToken(refreshToken);
      
      if (!payload) {
        throw new Error('Invalid refresh token');
      }

      // Get user to ensure they still exist
      const user = await this.userDAO.findById(payload.userId);
      if (!user) {
        throw new Error('User not found');
      }

      // Generate new tokens
      return this.generateTokens({
        userId: user.id,
        email: user.email,
        role: user.role,
      });
    } catch (error) {
      throw new Error('Invalid refresh token');
    }
  }

  /**
   * Generate access and refresh tokens
   */
  private async generateTokens(payload: JWTPayload): Promise<AuthTokens> {
    const [accessToken, refreshToken] = await Promise.all([
      signAccessToken(payload),
      signRefreshToken(payload),
    ]);

    return {
      accessToken,
      refreshToken,
    };
  }

  /**
   * Validate user session
   */
  async validateUser(userId: string): Promise<AuthUser | null> {
    const user = await this.userDAO.findById(userId);
    if (!user) {
      return null;
    }

    const { passwordHash, ...userWithoutPassword } = user;
    return {
      ...userWithoutPassword,
      dateHired: userWithoutPassword.dateHired?.toISOString().split('T')[0] || '',
    } as AuthUser;
  }
}
