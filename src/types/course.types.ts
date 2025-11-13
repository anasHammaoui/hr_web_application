export interface Course {
  id: string;
  title: string;
  description: string;
  imageUrl: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateCourseDTO {
  title: string;
  description: string;
  imageUrl?: string;
}

export interface UpdateCourseDTO {
  title?: string;
  description?: string;
  imageUrl?: string;
}

export interface CourseWithEnrollments extends Course {
  enrollments: Array<{
    id: string;
    userId: string;
    courseId: string;
    enrolledAt: Date;
    user: {
      id: string;
      name: string;
      email: string;
      profilePicture: string | null;
    };
  }>;
  _count: {
    enrollments: number;
  };
}

export interface Enrollment {
  id: string;
  userId: string;
  courseId: string;
  enrolledAt: Date;
  user: {
    id: string;
    name: string;
    email: string;
  };
  course: {
    id: string;
    title: string;
    description: string;
  };
}

export interface EnrollmentDTO {
  userId: string;
  courseId: string;
}
