import { PrismaClient, Course } from '@prisma/client';
import { BaseDAO } from './base.dao';
import type { CreateCourseDTO, UpdateCourseDTO } from '@/types';

export class CourseDAO extends BaseDAO {
  constructor(prisma: PrismaClient) {
    super(prisma);
  }

  /**
   * Find course by ID
   */
  async findById(id: string): Promise<Course | null> {
    return this.prisma.course.findUnique({
      where: { id },
    });
  }

  /**
   * Find course with enrollments
   */
  async findByIdWithEnrollments(id: string) {
    return this.prisma.course.findUnique({
      where: { id },
      include: {
        enrollments: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                profilePicture: true,
              },
            },
          },
        },
        _count: {
          select: {
            enrollments: true,
          },
        },
      },
    });
  }

  /**
   * Get all courses with enrollment count
   */
  async findAll() {
    return this.prisma.course.findMany({
      include: {
        _count: {
          select: {
            enrollments: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Get all courses with enrollments
   */
  async findAllWithEnrollments() {
    return this.prisma.course.findMany({
      include: {
        enrollments: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                profilePicture: true,
              },
            },
          },
        },
        _count: {
          select: {
            enrollments: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Create new course
   */
  async create(data: CreateCourseDTO): Promise<Course> {
    return this.prisma.course.create({
      data,
    });
  }

  /**
   * Update course
   */
  async update(id: string, data: UpdateCourseDTO): Promise<Course> {
    return this.prisma.course.update({
      where: { id },
      data,
    });
  }

  /**
   * Delete course
   */
  async delete(id: string): Promise<Course> {
    return this.prisma.course.delete({
      where: { id },
    });
  }

  /**
   * Count total courses
   */
  async count(): Promise<number> {
    return this.prisma.course.count();
  }
}
