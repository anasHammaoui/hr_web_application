# HR Web Application

A comprehensive HR Management System built with Next.js, featuring employee management, course enrollment, time-off requests, evaluations, and reporting capabilities.

## 🚀 Features

- **User Management** - Create, update, and manage employee profiles
- **Course Management** - Manage training courses and track enrollments
- **Time-Off Management** - Submit and approve time-off requests
- **Employee Evaluations** - Track performance evaluations and scores
- **Dashboard** - View statistics and recent activities
- **Reports** - Generate comprehensive reports for analysis
- **Role-Based Access Control** - Admin and Employee roles with different permissions
- **RESTful API** - Complete API with Swagger documentation

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18 or higher) - [Download here](https://nodejs.org/)
- **npm** or **yarn** or **pnpm** or **bun** - Package manager
- **MySQL** or **PostgreSQL** - Database server

## 🛠️ Setup Steps

### 1. Clone the Repository

```bash
git clone https://github.com/anasHammaoui/hr_web_application.git
cd hr_web_application
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

Create a `.env` file in the root directory:


Edit the `.env` file with your configuration:

```env
# Database Configuration
DATABASE_URL="mysql://user:password@localhost:3306/hr_db"

# JWT Secrets (generate secure random strings)
JWT_SECRET="your-secret-key-here"
JWT_REFRESH_SECRET="your-refresh-secret-key-here"

# Application URL
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

**Important:** Replace the JWT secrets with secure random strings. You can generate them using:

```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

### 4. Database Setup

#### Create the Database

```bash
# For MySQL
CREATE DATABASE hr_db;
```

#### Run Migrations

Generate Prisma client and run database migrations:

```bash
npm run prisma:generate
npm run prisma:migrate
```

#### Seed the Database (Optional)

Populate the database with sample data:

```bash
npm run prisma:seed
```

This will create:
- Admin user: `admin@example.com` / `password123`
- Sample employees, courses, and other data

### 5. Build the Application (Optional for Production)

```bash
npm run build
```

## 🚀 How to Run

### Run Development Server (Frontend + Backend)

The Next.js application includes both frontend and backend API routes:

```bash
npm run dev
```

The application will be available at:
- **Frontend**: [http://localhost:3000](http://localhost:3000)
- **API**: [http://localhost:3000/api](http://localhost:3000/api)
- **API Documentation**: [http://localhost:3000/api-docs](http://localhost:3000/api-docs)

### Run Production Server

```bash
npm run build
npm start
```

### Run Tests

```bash
npm test
```

### Run Linter

```bash
npm run lint
```

## 📚 API Documentation

This project includes comprehensive API documentation using Swagger/OpenAPI.

### Access Interactive Documentation

Visit the Swagger UI interface:
- **Local Development**: [http://localhost:3000/api-docs](http://localhost:3000/api-docs)

### Documentation Files

- **Complete API Guide**: See `API_DOCUMENTATION.md`

### Key API Endpoints

- **Authentication**: 
  - `POST /api/auth/login` - User login
  - `POST /api/auth/refresh` - Refresh token
  
- **Users**: 
  - `GET /api/users` - List users
  - `POST /api/users` - Create user
  - `GET /api/users/{id}` - Get user details
  - `PUT /api/users/{id}` - Update user
  - `DELETE /api/users/{id}` - Delete user
  
- **Courses**: 
  - `GET /api/courses` - List courses
  - `POST /api/courses/{id}/enroll` - Enroll in course
  
- **Time Off**: 
  - `GET /api/timeoff` - List time-off requests
  - `POST /api/timeoff` - Create request
  
- **Dashboard**: 
  - `GET /api/dashboard/stats` - Get statistics
  - `GET /api/dashboard/activities` - Get activities

## 🗄️ Database Schema

The application uses Prisma ORM with the following main models:

- **User** - Employee and admin users
- **Course** - Training courses
- **Enrollment** - Course enrollments
- **TimeOff** - Time-off requests
- **Evaluation** - Employee evaluations
- **Score** - Evaluation scores
- **Activity** - Activity logs

### View Database Schema

```bash
npx prisma studio
```

This opens Prisma Studio at [http://localhost:5555](http://localhost:5555) for visual database management.

## 📁 Project Structure

```
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── api/               # API routes (backend)
│   │   ├── dashboard/         # Dashboard pages
│   │   ├── login/             # Login page
│   │   └── api-docs/          # Swagger UI
│   ├── components/            # React components
│   ├── contexts/              # React contexts
│   ├── dao/                   # Data Access Objects
│   ├── hooks/                 # Custom hooks
│   ├── lib/                   # Utilities
│   ├── services/              # Business logic
│   └── types/                 # TypeScript types
├── prisma/
│   ├── schema.prisma          # Database schema
│   ├── migrations/            # Database migrations
│   └── seed.js                # Seed script
├── API_DOCUMENTATION.md       # Complete API docs
```

## 📝 Available Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm test` | Run tests |
| `npm run prisma:generate` | Generate Prisma client |
| `npm run prisma:migrate` | Run database migrations |
| `npm run prisma:seed` | Seed the database |

## 🔐 User Roles

### Admin
- Full access to all features
- User management
- Approve/reject time-off requests
- Manage courses and evaluations
- View all reports

### Employee
- View and update own profile
- View and enroll in courses
- Submit time-off requests
- View own evaluations
- Limited dashboard access

### Default Login Credentials

After running the seed script:

**Admin Account:**
- Email: `admin@example.com`
- Password: `password123`

**Employee Account:**
- Email: `employee@example.com`
- Password: `password123`

## 🛠️ Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Database**: MySQL/PostgreSQL with Prisma ORM
- **Authentication**: JWT (JSON Web Tokens)
- **API Documentation**: Swagger/OpenAPI
- **UI Components**: Radix UI
- **Form Handling**: React Hook Form + Zod
- **Testing**: Jest + React Testing Library
