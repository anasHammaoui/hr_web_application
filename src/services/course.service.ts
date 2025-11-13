import { PrismaClient } from '@prisma/client';
import { CourseDAO, EnrollmentDAO } from '@/dao';
import type {
  CreateCourseDTO,
  UpdateCourseDTO,
  CourseWithEnrollments,
} from '@/types';

export class CourseService {
  private courseDAO: CourseDAO;
  private enrollmentDAO: EnrollmentDAO;

  constructor(prisma: PrismaClient) {
    this.courseDAO = new CourseDAO(prisma);
    this.enrollmentDAO = new EnrollmentDAO(prisma);
  }

  /**
   * Get all courses with enrollments
   */
  async getAllCourses() {
    return this.courseDAO.findAllWithEnrollments();
  }

  /**
   * Get course by ID with enrollments
   */
  async getCourseById(id: string): Promise<CourseWithEnrollments | null> {
    return this.courseDAO.findByIdWithEnrollments(id);
  }

  /**
   * Create new course
   */
  async createCourse(data: CreateCourseDTO) {
    return this.courseDAO.create(data);
  }

  /**
   * Update course
   */
  async updateCourse(id: string, data: UpdateCourseDTO) {
    // Check if course exists
    const existingCourse = await this.courseDAO.findById(id);
    if (!existingCourse) {
      throw new Error('Course not found');
    }

    return this.courseDAO.update(id, data);
  }

  /**
   * Delete course
   */
  async deleteCourse(id: string) {
    // Check if course exists
    const existingCourse = await this.courseDAO.findById(id);
    if (!existingCourse) {
      throw new Error('Course not found');
    }

    await this.courseDAO.delete(id);
    return { message: 'Course deleted successfully' };
  }

  /**
   * Enroll user in course
   */
  async enrollUser(userId: string, courseId: string) {
    // Check if course exists
    const course = await this.courseDAO.findById(courseId);
    if (!course) {
      throw new Error('Course not found');
    }

    // Check if already enrolled
    const isEnrolled = await this.enrollmentDAO.isEnrolled(userId, courseId);
    if (isEnrolled) {
      throw new Error('User already enrolled in this course');
    }

    return this.enrollmentDAO.create(userId, courseId);
  }

  /**
   * Unenroll user from course
   */
  async unenrollUser(userId: string, courseId: string) {
    // Check if enrolled
    const isEnrolled = await this.enrollmentDAO.isEnrolled(userId, courseId);
    if (!isEnrolled) {
      throw new Error('User not enrolled in this course');
    }

    await this.enrollmentDAO.delete(userId, courseId);
    return { message: 'Unenrolled successfully' };
  }

  /**
   * Get user's enrollments
   */
  async getUserEnrollments(userId: string) {
    return this.enrollmentDAO.findByUserId(userId);
  }

  /**
   * Get course enrollments
   */
  async getCourseEnrollments(courseId: string) {
    return this.enrollmentDAO.findByCourseId(courseId);
  }

  /**
   * Get course statistics
   */
  async getCourseStats() {
    const totalCourses = await this.courseDAO.count();

    return {
      total: totalCourses,
    };
  }
}
