export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'employee';
  jobPosition: string | null;
  dateHired: Date | null;
  profilePicture: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateUserDTO {
  name: string;
  email: string;
  password: string;
  role?: 'admin' | 'employee';
  jobPosition: string;
  profilePicture?: string;
}

export interface UpdateUserDTO {
  name?: string;
  email?: string;
  password?: string;
  role?: 'admin' | 'employee';
  jobPosition?: string;
  profilePicture?: string;
}

export interface UserListQuery {
  page?: number;
  limit?: number;
  search?: string;
  role?: 'admin' | 'employee';
}

export interface UserListResponse {
  users: User[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface UserWithRelations {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'employee';
  jobPosition: string | null;
  dateHired: Date | null;
  profilePicture: string | null;
  createdAt: Date;
  updatedAt: Date;
  scores?: Array<{
    id: string;
    score: number;
    evaluation: {
      id: string;
      name: string;
    };
  }>;
  enrollments?: Array<{
    id: string;
    enrolledAt: Date;
    course: {
      id: string;
      title: string;
    };
  }>;
  timeOffRequests?: Array<{
    id: string;
    startDate: Date;
    endDate: Date;
    reason: string;
    status: string;
  }>;
}
