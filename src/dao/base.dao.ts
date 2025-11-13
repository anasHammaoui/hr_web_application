import { PrismaClient } from '@prisma/client';

export class BaseDAO {
  protected prisma: PrismaClient;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  /**
   * Calculate pagination skip value
   */
  protected calculateSkip(page: number, limit: number): number {
    return (page - 1) * limit;
  }

  /**
   * Calculate total pages
   */
  protected calculateTotalPages(total: number, limit: number): number {
    return Math.ceil(total / limit);
  }

  /**
   * Build pagination metadata
   */
  protected buildPaginationMeta(page: number, limit: number, total: number) {
    return {
      page,
      limit,
      total,
      totalPages: this.calculateTotalPages(total, limit),
    };
  }
}
