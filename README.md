# Task Management System - Backend API

![NestJS](https://img.shields.io/badge/nestjs-%23E0234E.svg?style=for-the-badge&logo=nestjs&logoColor=white)
![TypeScript](https://img.shields.io/badge/typescript-%23007ACC.svg?style=for-the-badge&logo=typescript&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/postgresql-%23316192.svg?style=for-the-badge&logo=postgresql&logoColor=white)
![Docker](https://img.shields.io/badge/docker-%230db7ed.svg?style=for-the-badge&logo=docker&logoColor=white)
![JWT](https://img.shields.io/badge/JWT-black?style=for-the-badge&logo=JSON%20web%20tokens)

A robust NestJS backend API with PostgreSQL, JWT authentication, and comprehensive RBAC system.

## 🚀 Quick Start with Docker

### Prerequisites
- Docker & Docker Compose
- NestJs(Node.js 18+), Typescript, Sequelizer, Postgresql, winston (for development)

### 1. Clone & Setup
```bash
git clone <https://github.com/Paskab012/be_task_management_system.git>
cd task-management-backend
cp .env.example .env
```

### 2. Start with Docker
```bash
# Development environment
yarn docker:dev

# Production environment  
yarn docker:prod
```

### 3. Access Application
- **API**: http://localhost:3000
- **Swagger Docs**: http://localhost:3000/api/docs
- **Database**: localhost:5432

## 🛠️ Manual Setup (Without Docker)

### 1. Install Dependencies
```bash
yarn install
```

### 2. Environment Configuration
```env
# Database
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=password123
DB_NAME=task_management

# JWT
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRES_IN=1h

# App
PORT=3000
NODE_ENV=development
```

### 3. Database Setup
```bash
# Create database
yarn db:create

# Run migrations & seeds
yarn migrate:all
```

### 4. Start Development Server
```bash
yarn start:dev
```

## 🗄️ Database Schema

### Core Tables

#### **Users Table**
```sql
users (
  id                    UUID PRIMARY KEY,
  firstName             VARCHAR(50) NOT NULL,
  lastName              VARCHAR(50) NOT NULL,  
  email                 VARCHAR(255) UNIQUE NOT NULL,
  password              VARCHAR(255) NOT NULL,
  role                  ENUM('super_admin', 'admin', 'user', 'guest'),
  phone                 VARCHAR(20),
  jobTitle              VARCHAR(100),
  department            VARCHAR(100),
  isEmailVerified       BOOLEAN DEFAULT false,
  isActive              BOOLEAN DEFAULT true,
  organizationId        UUID,
  createdAt             TIMESTAMP,
  updatedAt             TIMESTAMP
)
```

#### **Boards Table**
```sql
boards (
  id               UUID PRIMARY KEY,
  name             VARCHAR(255) NOT NULL,
  description      TEXT,
  visibility       ENUM('public', 'private', 'organization'),
  status           ENUM('active', 'archived', 'deleted'),
  color            VARCHAR(7),
  icon             VARCHAR(10),
  organizationId   UUID,
  createdById      UUID NOT NULL,
  createdAt        TIMESTAMP,
  updatedAt        TIMESTAMP
)
```

#### **Tasks Table**
```sql
tasks (
  id                UUID PRIMARY KEY,
  title             VARCHAR(255) NOT NULL,
  description       TEXT,
  status            ENUM('todo', 'in_progress', 'in_review', 'done'),
  priority          ENUM('low', 'medium', 'high', 'urgent'),
  dueDate           TIMESTAMP,
  estimatedHours    INTEGER,
  actualHours       INTEGER,
  boardId           UUID NOT NULL,
  assignedUserId    UUID,
  createdById       UUID NOT NULL,
  createdAt         TIMESTAMP,
  updatedAt         TIMESTAMP
)
```

## 🔐 Role-Based Access Control (RBAC)

| Role | Users | Boards | Tasks | Access Level |
|------|-------|--------|-------|--------------|
| **Super Admin** | ✅ Full CRUD | ✅ Full CRUD | ✅ Full CRUD | System-wide |
| **Admin** | ✅ View/Create | ✅ Full CRUD | ✅ Full CRUD | Organization |
| **User** | ❌ View only | 👁️ View accessible | 👁️ Assigned only | Limited |
| **Guest** | ❌ No access | 👁️ Public only | ❌ No access | Public only |

### Permission Implementation
```typescript
@Post()
@Roles('super_admin', 'admin')
@ApiOperation({ summary: 'Create user (Admin+)' })
async createUser(@Body() createUserDto: CreateUserDto) {
  return this.usersService.createUser(createUserDto);
}
```

## 🌱 Seeded Data

### Default Super Admin
```typescript
{
  email: 'superadmin@taskmanagement.com',
  password: 'SuperAdmin123!',
  role: 'super_admin',
  firstName: 'Super',
  lastName: 'Admin'
}
```

### Sample Data Included
- **4 User accounts** (Super Admin, Admin, User, Guest)
- **3 Sample boards** (Public, Private, Organization)
- **6 Sample tasks** with different statuses and priorities

## 📡 API Endpoints

### Authentication
```
POST /api/v1/auth/login      # User login
POST /api/v1/auth/register   # User registration  
POST /api/v1/auth/logout     # User logout
GET  /api/v1/auth/profile    # Current user profile
```

### Users Management
```
GET    /api/v1/users         # List users (Admin+)
POST   /api/v1/users         # Create user (Super Admin)
GET    /api/v1/users/:id     # Get user (Admin+)
PATCH  /api/v1/users/:id     # Update user (Super Admin)
DELETE /api/v1/users/:id     # Delete user (Super Admin)
```

### Boards Management
```
GET    /api/v1/boards        # List boards (role-filtered)
POST   /api/v1/boards        # Create board (Admin+)
GET    /api/v1/boards/public # Public boards (no auth)
GET    /api/v1/boards/:id    # Get board details
PATCH  /api/v1/boards/:id    # Update board
DELETE /api/v1/boards/:id    # Delete board
```

### Tasks Management
```
GET    /api/v1/tasks         # List tasks (role-filtered)
POST   /api/v1/tasks         # Create task (Admin+)
GET    /api/v1/tasks/my-tasks # User's assigned tasks
PATCH  /api/v1/tasks/:id     # Update task
DELETE /api/v1/tasks/:id     # Delete task (Admin+)
PATCH  /api/v1/tasks/:id/assign # Assign task (Admin+)
```

## 🛡️ Security Features

- **JWT Authentication** with access & refresh tokens
- **Password Hashing** using bcryptjs (12 rounds)
- **Role-based Guards** for endpoint protection
- **Input Validation** with class-validator
- **CORS Protection** for cross-origin requests
- **Error Sanitization** to prevent data leaks

## 📋 Available Scripts

```bash
# Development
yarn start:dev              # Start with hot reload
yarn start:debug            # Start in debug mode

# Database
yarn db:create              # Create database
yarn db:migrate             # Run migrations
yarn db:seed               # Seed database
yarn migrate:all           # Migrate + seed
yarn db:reset              # Full database reset

# Docker
yarn docker:dev            # Start dev environment
yarn docker:prod           # Start prod environment
yarn docker:down           # Stop containers
yarn docker:clean          # Clean containers & volumes

# Code Quality
yarn lint                  # ESLint check
yarn test                  # Run tests
yarn test:e2e              # End-to-end tests
yarn build                 # Build for production
```

## 🔧 Environment Variables

```env
# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=your_password
DB_NAME=task_management

# JWT Configuration  
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRES_IN=1h
JWT_REFRESH_SECRET=your-refresh-secret
JWT_REFRESH_EXPIRES_IN=7d

# Application
PORT=3000
NODE_ENV=development
SALT_ROUNDS=12

# CORS
FRONTEND_URL=http://localhost:5173
```

## 🐳 Docker Configuration

### Development Stack
- **NestJS App** (Port 3000)
- **PostgreSQL** (Port 5432)
- **Redis** (Port 6379) - For caching
- **Hot Reload** enabled

### Production Stack
- **Optimized builds**
- **Health checks**
- **Multi-stage builds**
- **Security hardening**

## 📚 API Documentation

Visit `http://localhost:3000/api/docs` for interactive Swagger documentation with:
- **All endpoints** documented
- **Request/Response schemas**
- **Authentication flows**
- **Try-it-out functionality**

## 🧪 Testing

```bash
# Unit tests
yarn test

# E2E tests  
yarn test:e2e

# Test coverage
yarn test:cov
```

## 🚀 Deployment

### Production Build
```bash
yarn build
yarn start:prod
```

### Docker Production
```bash
yarn docker:prod
```

## 🐛 Common Issues

### Database Connection
```bash
# Check PostgreSQL is running
docker ps | grep postgres

# Reset database
yarn db:reset
```

### Permission Errors
```bash
# Check user roles in database
SELECT email, role FROM users;
```

### Docker Issues
```bash
# Clean everything
yarn docker:clean

# Rebuild containers
yarn docker:dev
```

## 📈 Performance Features

- **Connection Pooling** for database efficiency
- **Query Optimization** with proper indexing
- **Caching Strategy** with Redis
- **Pagination** for large datasets
- **Request Logging** for monitoring

---

**Built by Paskab_dev, with ⚡ NestJS for enterprise-grade performance and security**