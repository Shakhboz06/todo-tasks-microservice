# 📋 Todo Tasks Microservice

[![CI Pipeline](https://github.com/Shakhboz06/todo-tasks-microservice/workflows/CI%20Pipeline/badge.svg)](https://github.com/Shakhboz06/todo-tasks-microservice/actions)
[![Test Reports](https://img.shields.io/badge/📊-Test%20Reports-blue)](https://shakhboz06.github.io/todo-tasks-microservice)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

> A production-ready **microservice-based Todo application** built with **NestJS**, **Prisma**, **PostgreSQL**, **Docker**, and **Caddy** reverse proxy.

## 📖 Table of Contents

- [🚀 Live Demo](#-live-demo)
- [✨ Features](#-features)
- [🏗️ Architecture](#️-architecture)
- [🛠️ Tech Stack](#️-tech-stack)
- [⚡ Quick Start](#-quick-start)
- [🔧 Local Development](#-local-development)
- [🧪 Testing](#-testing)
- [🌐 Production Deployment](#-production-deployment)
- [📜 API Documentation](#-api-documentation)
- [🔒 Security](#-security)
- [📂 Project Structure](#-project-structure)
- [⚙️ Environment Variables](#️-environment-variables)
- [🚀 CI/CD](#-cicd)
- [🤝 Contributing](#-contributing)
- [📄 License](#-license)

## 🚀 Live Demo

| Service | URL | Status |
|---------|-----|---------|
| **Frontend** | [todo-tasks-one.vercel.app](https://todo-tasks-one.vercel.app) | ✅ Live |
| **User Service Docs** | [mytodotasks.duckdns.org/auth/docs](https://mytodotasks.duckdns.org/auth/docs) | ✅ Live |
| **Todo Service Docs** | [mytodotasks.duckdns.org/todos/docs](https://mytodotasks.duckdns.org/todos/docs) | ✅ Live |
| **Test Reports** | [shakhboz06.github.io/todo-tasks-microservice](https://shakhboz06.github.io/todo-tasks-microservice) | ✅ Live |

## ✨ Features

### 🔐 **Authentication & Authorization**
- User registration and login
- JWT token-based authentication
- Secure password hashing
- Token expiration handling

### 📋 **Todo Management**
- Create, read, update, delete todos
- User-specific todo isolation
- Real-time updates

### 🏗️ **Microservice Architecture**
- Independent service deployment
- Database per service 

### 🔒 **Security & Quality**
- CORS protection
- Helmet security headers
- Input validation
- Comprehensive test coverage
- Automated CI/CD pipeline

## 🏗️ Architecture

```
┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │     Caddy       │
│   (Vue 3)       │◄──►│ Reverse Proxy   │
│                 │    │   + HTTPS       │
└─────────────────┘    └─────────┬───────┘
                                 │
                    ┌────────────┼────────────┐
                    ▼            ▼            ▼
            ┌───────────┐ ┌──────────┐ ┌─────────────┐
            │User       │ │Todo      │ │Shared       │
            │Service    │ │Service   │ │Libraries    │
            │(Auth/JWT) │ │(CRUD)    │ │(@libs)      │
            └─────┬─────┘ └────┬─────┘ └─────────────┘
                  │            │
                  ▼            ▼
            ┌───────────┐ ┌──────────┐
            │PostgreSQL │ │PostgreSQL│
            │(Users)    │ │(Todos)   │
            └───────────┘ └──────────┘
```

## 🛠️ Tech Stack

### **Backend**
- **Framework:** NestJS (Node.js)
- **Language:** TypeScript
- **ORM:** Prisma
- **Database:** PostgreSQL (Supabase)
- **Authentication:** JWT + bcrypt
- **Validation:** class-validator

### **Frontend**
- **Framework:** Vue 3
- **Build Tool:** Vite
- **Styling:** Tailwind CSS

### **Infrastructure**
- **Reverse Proxy:** Caddy (HTTPS + Let's Encrypt)
- **Containerization:** Docker + Docker Compose
- **Hosting:** VPS (Linode) + Vercel (Frontend)
- **Domain:** DuckDNS

### **Development & CI/CD**
- **Testing:** Jest
- **CI/CD:** GitHub Actions
- **Code Quality:** ESLint + Prettier
- **Documentation:** Swagger/OpenAPI

## ⚡ Quick Start

### 🎯 **Try the Live Demo**
1. Visit: https://todo-tasks-one.vercel.app
2. Register a new account or login
3. Create, edit, and manage your todos
4. Explore the API docs: https://mytodotasks.duckdns.org/auth/docs

### 🚀 **Run Locally (Docker)**
```bash
# Clone repository
git clone https://github.com/Shakhboz06/todo-tasks-microservice.git
cd todo-tasks-microservice

# Copy environment variables
cp .env.compose.example .env.compose

# Start all services
docker compose up -d --build

# Run database migrations
docker compose exec user-service npx prisma migrate deploy --schema services/user-service/prisma/schema.prisma
docker compose exec todo-service npx prisma migrate deploy --schema services/todo-service/prisma/schema.prisma

# Access the application
# Frontend: http://localhost:5173
# API Docs: http://localhost:3001/docs (user-service)
# API Docs: http://localhost:3002/docs (todo-service)
```

## 🔧 Local Development

### **Prerequisites**
- Node.js 20+
- Docker & Docker Compose
- Git

### **Development Setup**
```bash
# 1. Install dependencies
npm ci

# 2. Set environment variables
DATABASE_USER_URL="postgresql://postgres:secretpass@localhost:5432/users"
DATABASE_TASKS_URL="postgresql://postgres:secretpass@localhost:5433/tasks"
JWT_SECRET="your-secret-key-here"
JWT_EXPIRES_IN="1200s"
ALLOWED_ORIGINS="http://localhost:5173"

# 3. Start databases only
docker compose up -d

# 4. Generate Prisma clients
npx prisma generate --schema services/user-service/prisma/schema.prisma
npx prisma generate --schema services/todo-service/prisma/schema.prisma

# 5. Run migrations
npx prisma migrate deploy --schema services/user-service/prisma/schema.prisma
npx prisma migrate deploy --schema services/todo-service/prisma/schema.prisma

# 6. Build shared libraries
npm run -w @backendrestapi/jwt build

# 7. Start services in development mode
npm run -w user-service start:dev
npm run -w todo-service start:dev
```

### **Useful Commands**
```bash
# Start specific service
npm run -w user-service start:dev
npm run -w todo-service start:dev

# View database
npx prisma studio --schema services/user-service/prisma/schema.prisma
npx prisma studio --schema services/todo-service/prisma/schema.prisma

# Reset database
npx prisma migrate reset --schema services/user-service/prisma/schema.prisma
```

## 🧪 Testing

This project includes comprehensive testing with **Unit Tests** and **E2E Tests** for all services.

### **📊 View Test Reports**
- **Live Reports:** https://shakhboz06.github.io/todo-tasks-microservice
- Automatically updated on every CI run
- Includes coverage metrics and detailed results

### **Run Tests Locally**
```bash
# Install dependencies
npm ci

# Run all tests (unit + e2e for all services)
npm test
```

### **Test Structure**
```
services/
├── user-service/
│   ├── src/
│   │   └── **/*.spec.ts     # Unit tests
│   └── test/
│       └── **/*.e2e-spec.ts # E2E tests
└── todo-service/
    ├── src/
    │   └── **/*.spec.ts     # Unit tests
    └── test/
        └── **/*.e2e-spec.ts # E2E tests
```

### **Coverage Goals**
- **Unit Tests:** Core business logic and utilities
- **E2E Tests:** API endpoints and complete workflows  
- **Target Coverage:** >80% for critical paths

## 🌐 Production Deployment

### **VPS Deployment (Current)**
```bash
# 1. Prepare environment
cp .env.compose.example .env.compose
# Edit with production values (Supabase URLs, etc.)

# 2. Deploy stack
docker compose -f docker-compose.prod.yml up -d --build

# 3. Run migrations
docker compose exec user-service npx prisma migrate deploy --schema services/user-service/prisma/schema.prisma
docker compose exec todo-service npx prisma migrate deploy --schema services/todo-service/prisma/schema.prisma

```

### **Infrastructure Overview**
- **VPS:** Linode
- **Domain:** DuckDNS
- **SSL:** Let's Encrypt (via Caddy)
- **Database:** Supabase (managed PostgreSQL)
- **Frontend:** Vercel

## 📜 API Documentation

### **Authentication Service**
```http
POST /auth/register     # Create new user
POST /auth/login        # Authenticate user
```

### **Todo Service** (JWT required)
```http
GET    /todos           # List user todos
POST   /todos           # Create new todo
PUT    /todos/:id       # Update todo
DELETE /todos/:id       # Delete todo
```

### **Interactive Documentation**
- **User Service:** https://mytodotasks.duckdns.org/auth/docs
- **Todo Service:** https://mytodotasks.duckdns.org/todos/docs
- Built with Swagger/OpenAPI 3.0

## 🔒 Security

### **Authentication**
- JWT tokens with HS256 algorithm
- Configurable token expiration
- Secure password hashing with bcrypt

### **API Security**
- CORS restricted to allowed origins
- Helmet.js security headers
- Input validation on all endpoints
- SQL injection prevention via Prisma

### **Infrastructure Security**
- HTTPS enforced via Caddy
- Environment variable isolation
- Database connection encryption
- Container security best practices

## 📂 Project Structure

```
.
├── .github/
│   └── workflows/ci.yml        # GitHub Actions CI/CD
├── docs/                       # Documentation
├── frontend/                   # Vue 3 frontend
├── libs/                       # Shared NestJS libraries
│   ├── common/                 # Common utilities
│   └── jwt/                    # JWT authentication lib
├── services/                   # Microservices
│   ├── user-service/           # Authentication service
│   │   ├── src/
│   │   ├── test/
│   │   └── prisma/
│   └── todo-service/           # Todo management service
│       ├── src/
│       ├── test/
│       └── prisma/
├── Caddyfile                   # Reverse proxy config
├── docker-compose.yml          # Local development
├── docker-compose.prod.yml     # Production deployment
├── Makefile                    # Development commands
└── package.json                # Workspace configuration
```

## ⚙️ Environment Variables

### **Development (.env.compose)**
```bash
# Database connections
DATABASE_USER_URL="postgresql://postgres:secretpass@user-db:5432/users"
DATABASE_TASKS_URL="postgresql://postgres:secretpass@todo-db:5432/tasks"

# JWT configuration
JWT_SECRET="your-dev-secret-key"
JWT_EXPIRES_IN="1200s"

# CORS
ALLOWED_ORIGINS="http://localhost:5173,http://localhost:3000"

# Environment
NODE_ENV="development"
```

### **Production**
```bash
# Supabase (pooled connections)
DATABASE_USER_URL="postgresql://user:pass@host:6543/users?sslmode=require"
DATABASE_TASKS_URL="postgresql://user:pass@host:6543/tasks?sslmode=require"

# Production settings
JWT_SECRET="strong-production-secret"
JWT_EXPIRES_IN="1200s"
ALLOWED_ORIGINS=origins
NODE_ENV="production"
```

## 🚀 CI/CD

### **GitHub Actions Pipeline**
- ✅ **Automated Testing:** Unit and E2E tests on every push
- 📊 **Test Reports:** Generated and deployed to GitHub Pages
- 🔍 **Code Quality:** ESLint and TypeScript checks
- 🗑️ **Cleanup:** Automatic deployment history management

### **Pipeline Steps**
1. Checkout code and setup Node.js
2. Install dependencies and build shared libraries
3. Setup PostgreSQL test database
4. Run Prisma migrations
5. Execute test suites (unit + e2e)
6. Generate HTML test reports
7. Deploy reports to GitHub Pages
8. Cleanup old deployments
---
