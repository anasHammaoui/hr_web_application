import { PrismaClient, TimeOffRequest } from '@prisma/client';
import { BaseDAO } from './base.dao';
import type {
  CreateTimeOffRequestDTO,
  UpdateTimeOffRequestDTO,
  TimeOffRequestQuery,
} from '@/types';

export class TimeOffDAO extends BaseDAO {
  constructor(prisma: PrismaClient) {
    super(prisma);
  }

  /**
   * Find time-off request by ID
   */
  async findById(id: string): Promise<TimeOffRequest | null> {
    return this.prisma.timeOffRequest.findUnique({
      where: { id },
    });
  }

  /**
   * Find time-off request with user details
   */
  async findByIdWithUser(id: string) {
    return this.prisma.timeOffRequest.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            jobPosition: true,
            profilePicture: true,
          },
        },
      },
    });
  }

  /**
   * Get all time-off requests with filters
   */
  async findMany(query: TimeOffRequestQuery = {}) {
    const where: any = {};

    if (query.userId) {
      where.userId = query.userId;
    }

    if (query.status) {
      where.status = query.status;
    }

    if (query.startDate || query.endDate) {
      where.startDate = {};
      if (query.startDate) {
        where.startDate.gte = query.startDate;
      }
      if (query.endDate) {
        where.startDate.lte = query.endDate;
      }
    }

    return this.prisma.timeOffRequest.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            jobPosition: true,
            profilePicture: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Create new time-off request
   */
  async create(data: CreateTimeOffRequestDTO): Promise<TimeOffRequest> {
    return this.prisma.timeOffRequest.create({
      data: {
        userId: data.userId,
        startDate: new Date(data.startDate),
        endDate: new Date(data.endDate),
        reason: data.reason,
        status: 'pending',
      },
    });
  }

  /**
   * Update time-off request (review)
   */
  async update(
    id: string,
    data: UpdateTimeOffRequestDTO
  ): Promise<TimeOffRequest> {
    return this.prisma.timeOffRequest.update({
      where: { id },
      data: {
        status: data.status,
        adminNote: data.adminNote,
      },
    });
  }

  /**
   * Delete time-off request
   */
  async delete(id: string): Promise<TimeOffRequest> {
    return this.prisma.timeOffRequest.delete({
      where: { id },
    });
  }

  /**
   * Count pending requests
   */
  async countPending(): Promise<number> {
    return this.prisma.timeOffRequest.count({
      where: { status: 'pending' },
    });
  }

  /**
   * Get user's time-off requests
   */
  async findByUserId(userId: string) {
    return this.prisma.timeOffRequest.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Count user's requests by status
   */
  async countByUserAndStatus(
    userId: string,
    status: 'pending' | 'approved' | 'rejected'
  ): Promise<number> {
    return this.prisma.timeOffRequest.count({
      where: {
        userId,
        status,
      },
    });
  }

  /**
   * Get all time-off requests for export
   */
  async findAllForExport() {
    return this.prisma.timeOffRequest.findMany({
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }
}
