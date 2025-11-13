import { PrismaClient, Enrollment } from '@prisma/client';
import { BaseDAO } from './base.dao';

export class EnrollmentDAO extends BaseDAO {
  constructor(prisma: PrismaClient) {
    super(prisma);
  }

  /**
   * Create enrollment
   */
  async create(userId: string, courseId: string): Promise<Enrollment> {
    return this.prisma.enrollment.create({
      data: {
        userId,
        courseId,
      },
    });
  }

  /**
   * Delete enrollment
   */
  async delete(userId: string, courseId: string): Promise<Enrollment> {
    const enrollment = await this.prisma.enrollment.findFirst({
      where: {
        userId,
        courseId,
      },
    });

    if (!enrollment) {
      throw new Error('Enrollment not found');
    }

    return this.prisma.enrollment.delete({
      where: { id: enrollment.id },
    });
  }

  /**
   * Check if user is enrolled in course
   */
  async isEnrolled(userId: string, courseId: string): Promise<boolean> {
    const enrollment = await this.prisma.enrollment.findFirst({
      where: {
        userId,
        courseId,
      },
    });

    return !!enrollment;
  }

  /**
   * Get user's enrollments
   */
  async findByUserId(userId: string) {
    return this.prisma.enrollment.findMany({
      where: { userId },
      include: {
        course: true,
      },
      orderBy: { enrolledAt: 'desc' },
    });
  }

  /**
   * Get course enrollments
   */
  async findByCourseId(courseId: string) {
    return this.prisma.enrollment.findMany({
      where: { courseId },
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
      orderBy: { enrolledAt: 'desc' },
    });
  }

  /**
   * Count enrollments for a course
   */
  async countByCourseId(courseId: string): Promise<number> {
    return this.prisma.enrollment.count({
      where: { courseId },
    });
  }
}
