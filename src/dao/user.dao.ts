import { PrismaClient, User } from '@prisma/client';
import { BaseDAO } from './base.dao';
import type { CreateUserDTO, UpdateUserDTO, UserListQuery } from '@/types';

export class UserDAO extends BaseDAO {
  constructor(prisma: PrismaClient) {
    super(prisma);
  }

  /**
   * Find user by ID
   */
  async findById(id: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { id },
    });
  }

  /**
   * Find user by email
   */
  async findByEmail(email: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { email },
    });
  }

  /**
   * Find user with all relations
   */
  async findByIdWithRelations(id: string) {
    return this.prisma.user.findUnique({
      where: { id },
      include: {
        scores: {
          include: {
            evaluation: true,
          },
        },
        enrollments: {
          include: {
            course: true,
          },
        },
        timeOffRequests: {
          orderBy: {
            createdAt: 'desc',
          },
        },
      },
    });
  }

  /**
   * Get paginated list of users with search
   */
  async findMany(query: UserListQuery) {
    const { page = 1, limit = 10, search = '', role } = query;
    const skip = this.calculateSkip(page, limit);

    const where: any = {};

    if (search) {
      where.OR = [
        { name: { contains: search } },
        { email: { contains: search } },
        { jobPosition: { contains: search } },
      ];
    }

    if (role) {
      where.role = role;
    }

    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          jobPosition: true,
          dateHired: true,
          profilePicture: true,
          createdAt: true,
          updatedAt: true,
        },
      }),
      this.prisma.user.count({ where }),
    ]);

    return {
      users,
      pagination: this.buildPaginationMeta(page, limit, total),
    };
  }

  /**
   * Get all users (for export)
   */
  async findAll() {
    return this.prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        jobPosition: true,
        birthday: true,
        dateHired: true,
        createdAt: true,
      },
    });
  }

  /**
   * Create new user
   */
  async create(data: CreateUserDTO): Promise<User> {
    return this.prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        passwordHash: data.password,
        role: data.role || 'employee',
        jobPosition: data.jobPosition,
        profilePicture: data.profilePicture,
        dateHired: new Date(),
      },
    });
  }

  /**
   * Update user
   */
  async update(id: string, data: UpdateUserDTO): Promise<User> {
    return this.prisma.user.update({
      where: { id },
      data,
    });
  }

  /**
   * Delete user
   */
  async delete(id: string): Promise<User> {
    return this.prisma.user.delete({
      where: { id },
    });
  }

  /**
   * Count users by role
   */
  async countByRole(role?: 'admin' | 'employee'): Promise<number> {
    return this.prisma.user.count({
      where: role ? { role } : undefined,
    });
  }

  /**
   * Check if email exists
   */
  async emailExists(email: string, excludeUserId?: string): Promise<boolean> {
    const user = await this.prisma.user.findUnique({
      where: { email },
      select: { id: true },
    });

    if (!user) return false;
    if (excludeUserId && user.id === excludeUserId) return false;
    return true;
  }
}
