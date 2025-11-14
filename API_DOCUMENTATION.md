# HR Web Application - API Documentation

## Overview

This document provides comprehensive information about the HR Web Application REST API. The API is built with Next.js and follows RESTful principles.

## Access API Documentation

Visit the interactive Swagger UI documentation at:
- **Development**: `http://localhost:3000/api-docs`

## Base URL

The API base URL is configured via the `NEXT_PUBLIC_APP_URL` environment variable:

- **Development**: `http://localhost:3000` (default)
- **Production**: Set `NEXT_PUBLIC_APP_URL` in your `.env` file

To change the base URL, update your `.env` file:
```bash
NEXT_PUBLIC_APP_URL="https://your-production-domain.com"
```

This URL is used throughout the application including the Swagger documentation.

## Authentication

Most endpoints require authentication using JWT (JSON Web Token). Include the token in the Authorization header:

```
Authorization: Bearer YOUR_ACCESS_TOKEN
```

### Getting a Token

Use the login endpoint to obtain access and refresh tokens:

```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

Response:
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "name": "John Doe",
    "email": "user@example.com",
    "role": "employee"
  }
}
```

### Refreshing Tokens

When your access token expires, use the refresh token:

```http
POST /api/auth/refresh
Content-Type: application/json

{
  "refreshToken": "YOUR_REFRESH_TOKEN"
}
```

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/refresh` - Refresh access token

### Users
- `GET /api/users` - Get all users (Admin only)
- `POST /api/users` - Create new user (Admin only)
- `GET /api/users/{id}` - Get user by ID
- `PUT /api/users/{id}` - Update user (Admin only)
- `DELETE /api/users/{id}` - Delete user (Admin only)

### Courses
- `GET /api/courses` - Get all courses
- `POST /api/courses` - Create course (Admin only)
- `GET /api/courses/{id}` - Get course by ID
- `PUT /api/courses/{id}` - Update course (Admin only)
- `DELETE /api/courses/{id}` - Delete course (Admin only)
- `POST /api/courses/{id}/enroll` - Enroll in course
- `DELETE /api/courses/{id}/enroll` - Unenroll from course

### Time Off
- `GET /api/timeoff` - Get time-off requests
- `POST /api/timeoff` - Create time-off request
- `PUT /api/timeoff/{id}` - Review time-off request (Admin only)

### Evaluations
- `GET /api/evaluations` - Get all evaluations
- `POST /api/evaluations/scores` - Create/update evaluation score (Admin only)

### Dashboard
- `GET /api/dashboard/stats` - Get dashboard statistics
- `GET /api/dashboard/activities` - Get recent activities

### Reports
- `GET /api/reports/evaluations` - Get evaluation reports (Admin only)

## User Roles

### Admin
- Full access to all endpoints
- Can create, update, and delete users
- Can approve/reject time-off requests
- Can manage courses and evaluations
- Can view all data and reports

### Employee
- Can view own profile and update certain fields
- Can view courses and enroll/unenroll
- Can create time-off requests
- Can view own evaluations
- Limited access to dashboard statistics

## Error Handling

The API uses standard HTTP status codes:

- `200 OK` - Successful request
- `201 Created` - Resource created successfully
- `400 Bad Request` - Invalid request data
- `401 Unauthorized` - Missing or invalid authentication
- `403 Forbidden` - Insufficient permissions
- `404 Not Found` - Resource not found
- `500 Internal Server Error` - Server error

Error Response Format:
```json
{
  "error": "Error message description"
}
```