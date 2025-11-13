import { NextRequest } from 'next/server';
import { GET, POST } from '@/app/api/users/route';
import { PUT, DELETE } from '@/app/api/users/[id]/route';
import { signAccessToken } from '@/lib/auth';

// Create mock service instance
const mockUserService = {
  getUsers: jest.fn(),
  getUserById: jest.fn(),
  createUser: jest.fn(),
  updateUser: jest.fn(),
  deleteUser: jest.fn(),
};

// Mock the UserService class
jest.mock('@/services', () => ({
  UserService: jest.fn().mockImplementation(() => mockUserService),
}));

// Mock prisma
jest.mock('@/lib/db', () => ({
  prisma: {
    user: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
    },
  },
}));

import { prisma } from '@/lib/db';

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
        role: 'employee' as const,
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

  describe('PUT /api/users/[id]', () => {
    it('should update a user', async () => {
      const updatedData = {
        name: 'John Updated',
        jobPosition: 'Senior Accountant',
      };

      const mockUpdatedUser = {
        id: '1',
        name: 'John Updated',
        email: 'john@hr.com',
        role: 'employee',
        jobPosition: 'Senior Accountant',
        birthday: null,
        dateHired: null,
        profilePicture: null,
        createdAt: '2025-11-13T19:48:10.077Z',
        updatedAt: '2025-11-13T19:48:10.077Z',
      };

      (prisma.user.update as jest.Mock).mockResolvedValue(mockUpdatedUser);

      const request = new NextRequest('http://localhost:3000/api/users/1', {
        method: 'PUT',
        headers: {
          authorization: `Bearer ${adminToken}`,
          'content-type': 'application/json',
        },
        body: JSON.stringify(updatedData),
      });

      const response = await PUT(request, { params: { id: '1' } });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.name).toBe('John Updated');
    });
  });

  describe('DELETE /api/users/[id]', () => {
    it('should delete a user', async () => {
      mockUserService.deleteUser.mockResolvedValue(undefined);

      const request = new NextRequest('http://localhost:3000/api/users/1', {
        method: 'DELETE',
        headers: {
          authorization: `Bearer ${adminToken}`,
        },
      });

      const response = await DELETE(request, { params: { id: '1' } });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.message).toBe('User deleted successfully');
    });
  });
});
