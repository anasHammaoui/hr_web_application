import { PrismaClient } from '@prisma/client';

export class ActivityDAO {
  constructor(private prisma: PrismaClient) {}

  async findRecentTimeOffRequests(userId?: string, limit: number = 5) {
    return this.prisma.timeOffRequest.findMany({
      where: userId ? { userId } : {},
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: { id: true, name: true }
        }
      }
    });
  }

  async findRecentEnrollments(userId?: string, limit: number = 5) {
    return this.prisma.enrollment.findMany({
      where: userId ? { userId } : {},
      take: limit,
      orderBy: { enrolledAt: 'desc' },
      include: {
        user: {
          select: { id: true, name: true }
        },
        course: {
          select: { title: true }
        }
      }
    });
  }

  async findRecentScores(userId?: string, limit: number = 5) {
    return this.prisma.score.findMany({
      where: userId ? { userId } : {},
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: { id: true, name: true }
        },
        evaluation: {
          select: { name: true }
        }
      }
    });
  }
}
