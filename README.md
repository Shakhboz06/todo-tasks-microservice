# ✅ Todo Tasks Microservice (NestJS + Prisma + Supabase)

A production-ready **microservice-based Todo application** built with **NestJS**, **Prisma**, **PostgreSQL (Supabase)**, **Docker**, and **Caddy** as the reverse proxy.

The system consists of:
- **user-service** → Handles authentication, JWT token issuance, and user management.
- **todo-service** → Handles CRUD operations for user-specific todos.
- **Caddy** → Reverse proxy, HTTPS via Let's Encrypt, routes requests to the correct service, and serves Swagger API docs.
- **Frontend** → Vue 3 + Vite app (hosted on Vercel).
- **Database** → Managed PostgreSQL instance via Supabase.

---

## 🚀 Live Links

| Component | URL |
|-----------|-----|
| **Frontend (Vercel)** | https://todo-tasks-one.vercel.app |
| **API Gateway (Caddy)** | https://mytodotasks.duckdns.org |
| **Swagger Docs (User Service)** | https://mytodotasks.duckdns.org/auth/docs |
| **Swagger Docs (Todo Service)** | https://mytodotasks.duckdns.org/todos/docs |
| **📊 Test Reports** | https://shakhboz06.github.io/todo-tasks-microservice |

---

## 🧪 Testing & Quality Assurance

This project includes comprehensive test coverage and automated quality checks:

- **Unit Tests** → Individual service components and utilities
- **Integration Tests** → API endpoints and database operations  
- **End-to-End Tests** → Complete user workflows
- **Coverage Reports** → Detailed test coverage metrics

### View Test Reports
- **📊 Live Test Reports:** https://shakhboz06.github.io/todo-tasks-microservice
- **CI Pipeline:** Automatically runs tests on every push/PR
- **Coverage Thresholds:** Maintains high code quality standards

### Running Tests Locally
```bash
# Install dependencies
npm ci

# Set up test database (if using Docker)
docker compose up -d postgres

# Run all tests
npm test

# Run tests with coverage
npm run test:cov

# Generate HTML reports
npm run test:html

# Run specific service tests
npm run -w user-service test
npm run -w todo-service test
```

### Test Report Structure
```
reports_publish/
├── index.html              # Test reports dashboard
├── user-service/           # User service test results
│   ├── coverage/          # Coverage reports
│   └── test-results.html  # Test results
└── todo-service/           # Todo service test results
    ├── coverage/          # Coverage reports  
    └── test-results.html  # Test results
```

---

## 📂 Repository Structure

```
.
├─ .github/workflows/ci.yml     # GitHub Actions CI pipeline
├─ docs/                        # Swagger docs & additional documentation
├─ frontend/                    # Vue 3 frontend app
├─ libs/                        # Shared NestJS libraries (e.g., JWT utils)
│  ├─ common/
│  └─ jwt/
├─ services/                    # Backend microservices
│  ├─ user-service/              # Auth service
│  └─ todo-service/              # Todo service
├─ Caddyfile                    # Reverse proxy config
├─ docker-compose.yml           # Local dev stack
├─ docker-compose.prod.yml      # Production stack
├─ Makefile                     # Handy CLI commands
├─ .env.compose.example         # Example environment variables
└─ package.json                 # Monorepo package definition
```

---

## 🛠 Tech Stack

- **Backend Framework:** NestJS
- **ORM:** Prisma
- **Database:** PostgreSQL (Supabase for production)
- **Reverse Proxy & TLS:** Caddy
- **Frontend:** Vue 3 + Vite
- **Containerization:** Docker + Docker Compose
- **CI/CD:** GitHub Actions
- **Testing:** Jest + Supertest

---

## ⚙️ Environment Variables

All environment variables for Docker Compose are in `.env.compose`.

### Shared
```env
NODE_ENV=production
JWT_SECRET=change_me
JWT_EXPIRES_IN=900s
ALLOWED_ORIGINS=https://todo-tasks-one.vercel.app,https://mytodotasks.duckdns.org
```

### user-service
```env
# Local development
DATABASE_USER_URL=postgresql://postgres:secretpass@user-db:5432/users
```

### todo-service
```env
# Local development
DATABASE_TASKS_URL=postgresql://postgres:secretpass@todo-db:5432/tasks
```

---

## 💻 Local Development

```bash
# 1. Install dependencies
npm ci

# 2. Set environment variables
# Copy from example and update values:
DATABASE_USER_URL=postgresql://postgres:secretpass@user-db:5432/users
DATABASE_TASKS_URL=postgresql://postgres:secretpass@todo-db:5432/tasks
JWT_EXPIRES_IN=1200s
JWT_SECRET=anything_here_your_jwt_secret123
ALLOWED_ORIGINS=http://localhost:5173

# 3. Start stack
docker compose up -d --build

# 4. Run database migrations
docker compose exec user-service npx prisma migrate deploy --schema services/user-service/prisma/schema.prisma
docker compose exec todo-service npx prisma migrate deploy --schema services/todo-service/prisma/schema.prisma

# 5. Run tests (optional)
npm test
npm run test:html  # Generate HTML reports

# 6. Access services
# http://localhost:3001/docs  (user-service)
# http://localhost:3002/docs  (todo-service)
```

---

## 🌐 Production Deployment

The production setup runs on a VPS (e.g., Linode) using `docker-compose.prod.yml`.

### 1. Prepare `.env.compose`
- Use **pooled** Supabase connection strings (port 6543, `sslmode=require`).
- Set `ALLOWED_ORIGINS` to both Vercel URL and API domain.

### 2. Start services
```bash
docker compose -f docker-compose.prod.yml up -d --build
```

### 3. Run migrations
```bash
docker compose exec user-service npx prisma migrate deploy --schema services/user-service/prisma/schema.prisma
docker compose exec todo-service npx prisma migrate deploy --schema services/todo-service/prisma/schema.prisma
```

---

## 📜 API Overview

### Auth Service
- **POST** `/auth/register` → Create a new user.
- **POST** `/auth/login` → Login and receive JWT token.

### Todo Service (requires Bearer token)
- **GET** `/todos` → List todos.
- **POST** `/todos` → Create todo.
- **PUT** `/todos/:id` → Update todo.
- **DELETE** `/todos/:id` → Delete todo.

Full Swagger API docs:
- https://mytodotasks.duckdns.org/auth/docs
- https://mytodotasks.duckdns.org/todos/docs

---

## 🛡 Security

- **CORS** restricted to `ALLOWED_ORIGINS`.
- **Helmet** enabled for HTTP headers.
- **JWT Authentication** with `HS256`.

---

## 📌 Quick Start for Reviewers

1. **Frontend:** https://todo-tasks-one.vercel.app  
2. **Register and log in** to test the full workflow
3. **Create, update, and delete** todos to see the system in action  
4. **Explore APIs** via Swagger docs
5. **View Test Reports:** https://shakhboz06.github.io/todo-tasks-microservice

---

## 🚀 Continuous Integration

The project uses GitHub Actions for automated testing and deployment:

- ✅ **Automated testing** on every push/PR
- 📊 **Test coverage reports** generated automatically  
- 🚀 **GitHub Pages deployment** for test reports
- 🔄 **Multi-service testing** with shared database

**Build Status:** ![CI](https://github.com/Shakhboz06/todo-tasks-microservice/workflows/CI%20Pipeline/badge.svg)

---

## 📄 License
MIT
