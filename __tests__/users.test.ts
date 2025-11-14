import { NextRequest } from 'next/server';
import { GET, POST } from '@/app/api/users/route';
import { GET as GET_USER } from '@/app/api/users/[id]/route';
import { signAccessToken } from '@/lib/auth';

// Create mock service instance
const mockUserService = {
  getUsers: jest.fn(),
  getUserById: jest.fn(),
  createUser: jest.fn(),
};

// Mock the UserService class
jest.mock('@/services', () => ({
  UserService: jest.fn().mockImplementation(() => mockUserService),
}));

// Mock prisma
jest.mock('@/lib/db', () => ({
  prisma: {},
}));

describe('Users API', () => {
  const adminToken = signAccessToken({
    userId: 'admin-id',
    email: 'admin@hr.com',
    role: 'admin',
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/users', () => {
    it('should return users list with pagination', async () => {
      const mockResult = {
        users: [
          {
            id: '1',
            name: 'John Doe',
            email: 'john@hr.com',
            role: 'employee',
            jobPosition: 'Accountant',
            dateHired: '2020-01-01T00:00:00.000Z',
            profilePicture: null,
            createdAt: '2025-11-13T19:48:10.077Z',
            updatedAt: '2025-11-13T19:48:10.077Z',
          },
        ],
        pagination: {
          page: 1,
          limit: 10,
          total: 1,
          totalPages: 1,
        },
      };

      mockUserService.getUsers.mockResolvedValue(mockResult);

      const request = new NextRequest('http://localhost:3000/api/users', {
        headers: {
          authorization: `Bearer ${adminToken}`,
        },
      });

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.users).toEqual(mockResult.users);
      expect(data.pagination.total).toBe(1);
    });

    it('should return 401 for non-admin users', async () => {
      const employeeToken = signAccessToken({
        userId: 'employee-id',
        email: 'employee@hr.com',
        role: 'employee',
      });

      const request = new NextRequest('http://localhost:3000/api/users', {
        headers: {
          authorization: `Bearer ${employeeToken}`,
        },
      });

      const response = await GET(request);
      expect(response.status).toBe(401);
    });
  });

  describe('POST /api/users', () => {
    it('should create a new user', async () => {
      const newUserData = {
        name: 'Jane Smith',
        email: 'jane@hr.com',
        password: 'password123',
        role: 'employee',
        jobPosition: 'Tax Specialist',
      };

      const mockCreatedUser = {
        id: '2',
        name: 'Jane Smith',
        email: 'jane@hr.com',
        role: 'employee',
        jobPosition: 'Tax Specialist',
        birthday: null,
        dateHired: null,
        profilePicture: null,
        createdAt: '2025-11-13T19:48:10.077Z',
        updatedAt: '2025-11-13T19:48:10.077Z',
      };

      mockUserService.createUser.mockResolvedValue(mockCreatedUser);

      const request = new NextRequest('http://localhost:3000/api/users', {
        method: 'POST',
        headers: {
          authorization: `Bearer ${adminToken}`,
          'content-type': 'application/json',
        },
        body: JSON.stringify(newUserData),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.email).toBe(newUserData.email);
    });

    it('should return 400 if email already exists', async () => {
      mockUserService.createUser.mockRejectedValue(new Error('Email already in use'));

      const request = new NextRequest('http://localhost:3000/api/users', {
        method: 'POST',
        headers: {
          authorization: `Bearer ${adminToken}`,
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          name: 'Test',
          email: 'existing@hr.com',
          password: 'password123',
          jobPosition: 'Developer',
        }),
      });

      const response = await POST(request);
      expect(response.status).toBe(400);
    });
  });

  describe('GET /api/users/[id]', () => {
    it('should return user by ID for admin', async () => {
      const mockUser = {
        id: '1',
        name: 'John Doe',
        email: 'john@hr.com',
        role: 'employee',
        jobPosition: 'Accountant',
        birthday: null,
        dateHired: '2020-01-01T00:00:00.000Z',
        profilePicture: null,
        createdAt: '2025-11-13T19:48:10.077Z',
        updatedAt: '2025-11-13T19:48:10.077Z',
        scores: [],
        enrollments: [],
        timeOffRequests: [],
      };

      mockUserService.getUserById.mockResolvedValue(mockUser);

      const request = new NextRequest('http://localhost:3000/api/users/1', {
        headers: {
          authorization: `Bearer ${adminToken}`,
        },
      });

      const response = await GET_USER(request, { params: Promise.resolve({ id: '1' }) });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.id).toBe('1');
      expect(data.email).toBe('john@hr.com');
    });

    it('should return 404 if user not found', async () => {
      mockUserService.getUserById.mockResolvedValue(null);

      const request = new NextRequest('http://localhost:3000/api/users/999', {
        headers: {
          authorization: `Bearer ${adminToken}`,
        },
      });

      const response = await GET_USER(request, { params: Promise.resolve({ id: '999' }) });
      expect(response.status).toBe(404);
    });

    it('should allow employee to view their own profile', async () => {
      const employeeToken = signAccessToken({
        userId: 'employee-id',
        email: 'employee@hr.com',
        role: 'employee',
      });

      const mockUser = {
        id: 'employee-id',
        name: 'Employee User',
        email: 'employee@hr.com',
        role: 'employee',
        jobPosition: 'Developer',
        birthday: null,
        dateHired: '2020-01-01T00:00:00.000Z',
        profilePicture: null,
        createdAt: '2025-11-13T19:48:10.077Z',
        updatedAt: '2025-11-13T19:48:10.077Z',
        scores: [],
        enrollments: [],
        timeOffRequests: [],
      };

      mockUserService.getUserById.mockResolvedValue(mockUser);

      const request = new NextRequest('http://localhost:3000/api/users/employee-id', {
        headers: {
          authorization: `Bearer ${employeeToken}`,
        },
      });

      const response = await GET_USER(request, { params: Promise.resolve({ id: 'employee-id' }) });
      expect(response.status).toBe(200);
    });

    it('should return 403 if employee tries to view another user', async () => {
      const employeeToken = signAccessToken({
        userId: 'employee-id',
        email: 'employee@hr.com',
        role: 'employee',
      });

      const request = new NextRequest('http://localhost:3000/api/users/other-user-id', {
        headers: {
          authorization: `Bearer ${employeeToken}`,
        },
      });

      const response = await GET_USER(request, { params: Promise.resolve({ id: 'other-user-id' }) });
      expect(response.status).toBe(403);
    });
  });
});
