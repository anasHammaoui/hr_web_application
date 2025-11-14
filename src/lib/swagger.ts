import { createSwaggerSpec } from 'next-swagger-doc';

export const getApiDocs = () => {
  const spec = createSwaggerSpec({
    apiFolder: 'src/app/api',
    definition: {
      openapi: '3.0.0',
      info: {
        title: 'HR Web Application API',
        version: '1.0.0',
        description: 'Comprehensive API documentation for the HR Management System',
        contact: {
          name: 'API Support',
          email: 'support@hrapp.com',
        },
      },
      servers: [
        {
          url: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
          description: 'Application server',
        },
      ],
      components: {
        securitySchemes: {
          bearerAuth: {
            type: 'http',
            scheme: 'bearer',
            bearerFormat: 'JWT',
            description: 'Enter your JWT token',
          },
        },
        schemas: {
          Error: {
            type: 'object',
            properties: {
              error: {
                type: 'string',
                description: 'Error message',
              },
            },
          },
          User: {
            type: 'object',
            properties: {
              id: {
                type: 'string',
                format: 'uuid',
              },
              name: {
                type: 'string',
              },
              email: {
                type: 'string',
                format: 'email',
              },
              role: {
                type: 'string',
                enum: ['admin', 'employee'],
              },
              jobPosition: {
                type: 'string',
              },
              profilePicture: {
                type: 'string',
                nullable: true,
              },
              createdAt: {
                type: 'string',
                format: 'date-time',
              },
              updatedAt: {
                type: 'string',
                format: 'date-time',
              },
            },
          },
          Course: {
            type: 'object',
            properties: {
              id: {
                type: 'string',
                format: 'uuid',
              },
              title: {
                type: 'string',
              },
              description: {
                type: 'string',
              },
              duration: {
                type: 'integer',
                description: 'Duration in hours',
              },
              category: {
                type: 'string',
              },
              level: {
                type: 'string',
                enum: ['beginner', 'intermediate', 'advanced'],
              },
              createdAt: {
                type: 'string',
                format: 'date-time',
              },
              updatedAt: {
                type: 'string',
                format: 'date-time',
              },
            },
          },
          TimeOff: {
            type: 'object',
            properties: {
              id: {
                type: 'string',
                format: 'uuid',
              },
              userId: {
                type: 'string',
                format: 'uuid',
              },
              type: {
                type: 'string',
                enum: ['vacation', 'sick', 'personal', 'other'],
              },
              startDate: {
                type: 'string',
                format: 'date-time',
              },
              endDate: {
                type: 'string',
                format: 'date-time',
              },
              reason: {
                type: 'string',
              },
              status: {
                type: 'string',
                enum: ['pending', 'approved', 'rejected'],
              },
              createdAt: {
                type: 'string',
                format: 'date-time',
              },
              updatedAt: {
                type: 'string',
                format: 'date-time',
              },
            },
          },
          Evaluation: {
            type: 'object',
            properties: {
              id: {
                type: 'string',
                format: 'uuid',
              },
              employeeId: {
                type: 'string',
                format: 'uuid',
              },
              evaluatorId: {
                type: 'string',
                format: 'uuid',
              },
              period: {
                type: 'string',
              },
              overallRating: {
                type: 'integer',
                minimum: 1,
                maximum: 5,
              },
              comments: {
                type: 'string',
                nullable: true,
              },
              createdAt: {
                type: 'string',
                format: 'date-time',
              },
              updatedAt: {
                type: 'string',
                format: 'date-time',
              },
            },
          },
          PaginatedResponse: {
            type: 'object',
            properties: {
              data: {
                type: 'array',
                items: {
                  type: 'object',
                },
              },
              pagination: {
                type: 'object',
                properties: {
                  page: {
                    type: 'integer',
                  },
                  limit: {
                    type: 'integer',
                  },
                  total: {
                    type: 'integer',
                  },
                  pages: {
                    type: 'integer',
                  },
                },
              },
            },
          },
        },
      },
      security: [],
      tags: [
        {
          name: 'Authentication',
          description: 'User authentication endpoints',
        },
        {
          name: 'Users',
          description: 'User management endpoints',
        },
        {
          name: 'Courses',
          description: 'Course management and enrollment endpoints',
        },
        {
          name: 'Time Off',
          description: 'Time off request management endpoints',
        },
        {
          name: 'Evaluations',
          description: 'Employee evaluation endpoints',
        },
        {
          name: 'Dashboard',
          description: 'Dashboard statistics and activities',
        },
        {
          name: 'Reports',
          description: 'Reporting endpoints',
        },
      ],
    },
  });

  return spec;
};
