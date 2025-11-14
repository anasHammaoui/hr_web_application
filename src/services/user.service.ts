import { PrismaClient } from '@prisma/client';
import { hashPassword } from '@/lib/auth';
import { UserDAO } from '@/dao';
import type {
  CreateUserDTO,
  UpdateUserDTO,
  UserListQuery,
  UserListResponse,
  UserWithRelations,
} from '@/types';

export class UserService {
  private userDAO: UserDAO;

  constructor(prisma: PrismaClient) {
    this.userDAO = new UserDAO(prisma);
  }

  /**
   * Get paginated list of users
   */
  async getUsers(query: UserListQuery): Promise<UserListResponse> {
    return this.userDAO.findMany(query);
  }

  /**
   * Get user by ID
   */
  async getUserById(id: string): Promise<UserWithRelations | null> {
    const user = await this.userDAO.findByIdWithRelations(id);
    if (!user) {
      return null;
    }

    // Remove passwordHash from response
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { passwordHash, ...userWithoutPassword } = user;
    return userWithoutPassword as UserWithRelations;
  }

  /**
   * Create new user
   */
  async createUser(data: CreateUserDTO) {
    // Validate email doesn't exist
    const emailExists = await this.userDAO.emailExists(data.email);
    if (emailExists) {
      throw new Error('Email already in use');
    }

    // Hash password
    const hashedPassword = await hashPassword(data.password);

    // Create user - DAO expects password field but saves as passwordHash
    const userDataForCreate = {
      ...data,
      password: hashedPassword,
    };
    
    const user = await this.userDAO.create(userDataForCreate);

    // Remove passwordHash from response
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { passwordHash, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  /**
   * Update user
   */
  async updateUser(id: string, data: UpdateUserDTO) {
    // Check if user exists
    const existingUser = await this.userDAO.findById(id);
    if (!existingUser) {
      throw new Error('User not found');
    }

    // If updating email, check it's not already in use
    if (data.email && data.email !== existingUser.email) {
      const emailExists = await this.userDAO.emailExists(data.email, id);
      if (emailExists) {
        throw new Error('Email already in use');
      }
    }

    // Hash password if provided
    const updateData: Record<string, unknown> = { ...data };
    if (data.password) {
      updateData.passwordHash = await hashPassword(data.password);
      delete updateData.password;
    }

    // Update user
    const user = await this.userDAO.update(id, updateData);

    // Remove passwordHash from response
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { passwordHash, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  /**
   * Delete user
   */
  async deleteUser(id: string) {
    // Check if user exists
    const existingUser = await this.userDAO.findById(id);
    if (!existingUser) {
      throw new Error('User not found');
    }

    // Delete user
    await this.userDAO.delete(id);

    return { message: 'User deleted successfully' };
  }

  /**
   * Get user statistics
   */
  async getUserStats() {
    const [totalUsers, adminCount, employeeCount] = await Promise.all([
      this.userDAO.countByRole(),
      this.userDAO.countByRole('admin'),
      this.userDAO.countByRole('employee'),
    ]);

    // Get new employees this month
    const thisMonthStart = new Date();
    thisMonthStart.setDate(1);
    thisMonthStart.setHours(0, 0, 0, 0);

    const newThisMonth = await this.userDAO.countNewEmployees(thisMonthStart);

    return {
      total: totalUsers,
      admins: adminCount,
      employees: employeeCount,
      newThisMonth,
    };
  }

  /**
   * Export users to CSV format
   */
  async exportUsersToCSV() {
    const users = await this.userDAO.findAll();
    
    // CSV headers
    const headers = ['ID', 'Name', 'Email', 'Role', 'Job Position', 'Birthday', 'Date Hired', 'Status'];
    
    // CSV rows
    const rows = users.map((user: { id: string; name: string; email: string; role: string; jobPosition: string | null; birthday: Date | null; dateHired: Date | null }) => [
      user.id,
      user.name,
      user.email,
      user.role,
      user.jobPosition || '',
      user.birthday ? new Date(user.birthday).toISOString().split('T')[0] : '',
      user.dateHired ? new Date(user.dateHired).toISOString().split('T')[0] : '',
      'Active'
    ]);

    // Combine headers and rows
    const csvContent = [headers, ...rows]
      .map((row: (string | number)[]) => row.map((cell: string | number) => `"${String(cell).replace(/"/g, '""')}"`).join(','))
      .join('\n');

    return csvContent;
  }
}
