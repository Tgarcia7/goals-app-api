# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Goals-api is a Node.js RESTful API backend for a Goals tracking application. It uses Express.js, MongoDB with Mongoose ODM, and JWT-based authentication.

## Project Status (Updated 2025-11-06)

**Recently Updated:**
- Node.js upgraded from v14 (EOL) to v20 LTS
- All dependencies updated to latest secure versions (0 vulnerabilities)
- Mongoose upgraded from v5 to v8
- MongoDB Docker image pinned to 7.0 with fixed healthcheck
- CircleCI updated to Ubuntu 22.04

## Development Commands

### Docker-based Development (Recommended)

The application is designed to run in Docker containers. All commands use docker-compose or docker compose (v2).

**Important:** Unit tests use mongodb-memory-server which may have platform compatibility issues on some systems. When running locally without Docker, tests are best executed via the Docker commands below, which provide a consistent MongoDB environment.

**Start the application:**
```bash
docker-compose up -d
```

**Run linting:**
```bash
docker-compose --file docker-compose.ci.yml run --rm api bin/lint
```

**Run unit tests:**
```bash
# All unit tests
docker-compose -f docker-compose.ci.yml run --rm api bin/unit

# Specific test directory
docker-compose -f docker-compose.ci.yml run --rm api bin/unit __tests__/unit/models/

# Tests matching a pattern
docker-compose -f docker-compose.ci.yml run --rm api bin/unit -g "test-description"
```

**Run integration tests:**
```bash
# Start MongoDB first
docker-compose -f docker-compose.ci.yml up -d mongo
docker-compose -f docker-compose.ci.yml up -d api

# All integration tests
docker-compose -f docker-compose.ci.yml run --rm api bin/integration

# Specific test file
docker-compose -f docker-compose.ci.yml run --rm api bin/integration __tests__/integration/general/app.test.js

# Tests matching a pattern
docker-compose -f docker-compose.ci.yml run --rm api bin/integration -g "test-description"
```

### Local Development (Alternative)

If running locally without Docker:

```bash
npm run dev         # Start with nodemon (auto-reload)
npm run lint        # Run ESLint
npm run lint:fix    # Auto-fix linting issues
npm run unit        # Run unit tests
npm run integration # Run integration tests
```

## Architecture

### Application Structure

The codebase follows a standard MVC-like pattern:

- **server.js** - Application entry point; creates HTTP server and listens on configured port
- **app.js** - Express app configuration with middleware (CORS, body-parser) and routes
- **config.js** - Centralized configuration from environment variables
- **routes/index.js** - All API route definitions with auth middleware applied where needed

### Core Directories

- **controllers/** - Request handlers for each resource (user, goal, graph, statistic, graph-stat)
- **models/** - Mongoose schema definitions and database connection
- **middlewares/** - Authentication middleware (JWT token validation)
- **services/** - Business logic layer (currently just token service for JWT)
- **utils/** - Shared utility functions
- **bin/** - Executable scripts for linting and testing

### Database

- Uses **MongoDB 7.0** with **Mongoose ODM v8.19.3**
- Connection configured via `DB_URI` and `DB_NAME` environment variables
- Models include: User, Goal, Graph, Statistic, RefreshToken
- Models define custom methods like `transform()` to convert MongoDB `_id` to `id`
- User model includes password hashing (bcrypt) via pre-save hooks
- **Note:** Mongoose v8 removed deprecated options like `useNewUrlParser`, `useUnifiedTopology`, `useCreateIndex`

### Authentication

- JWT-based authentication using jsonwebtoken
- Auth middleware (`middlewares/auth.js`) extracts token from Authorization header
- Token decoded via `services/token.js`
- Most routes protected with `auth` middleware except `/signup` and `/test`
- Supports refresh tokens for session management

### API Resources

The API manages four main resources:
- **Users** - Authentication, profile management, password changes
- **Goals** - User goals tracking
- **Graphs** - Visual representations of goals
- **Statistics** - Statistical data for goals
- **Graph-Stats** - Combined graph and statistics view

All resources follow RESTful conventions with standard CRUD operations.

### Testing Structure

Tests are split into two categories:

**Unit Tests** (`__tests__/unit/`)
- Fast, isolated tests using mongodb-memory-server for in-memory database
- Test individual models, controllers, and utilities
- Global hooks in `globalHooks.js` handle test setup/teardown
- Uses Mocha, Chai, and Sinon

**Integration Tests** (`__tests__/integration/`)
- End-to-end API tests using supertest
- Requires actual MongoDB connection (started via docker-compose)
- Tests API endpoints with full request/response cycle
- Uses test utilities in `test-utils/` for common operations

Both test suites use Mocha with custom configurations in `.mocharc.js` files.

## Code Style

- **ESLint** enforces code quality (see `.eslintrc.js`)
- 2-space indentation
- Single quotes for strings
- No semicolons
- Use strict equality (`===`)
- All functions use `'use strict'` pragma

## Environment Variables

Required environment variables (see `.env.example`):
- `DB_URI` - MongoDB connection string
- `DB_NAME` - Database name
- `SECRET_TOKEN` - JWT signing secret
- `PORT` - Server port (default: 3000)
- `NODE_ENV` - Environment (dev/test/production)

## Recent Major Updates

### 2025-11-06 - Modernization & Security Updates

**Node.js & Runtime:**
- Upgraded from Node.js v14 (EOL) to v20 LTS
- Updated Dockerfile to use node:20

**Security Fixes:**
- Resolved all 36 security vulnerabilities (now 0 vulnerabilities)
- Upgraded Mongoose from v5.13.14 to v8.19.3 (5 critical vulnerabilities fixed)
- Upgraded jsonwebtoken from v8.5.1 to v9.0.2 (3 high severity vulnerabilities fixed)
- Updated express, moment, uuid, bcrypt, and all dev dependencies

**Mongoose v8 Breaking Changes Applied:**
- Removed deprecated connection options: `useCreateIndex`, `useNewUrlParser`, `useUnifiedTopology`
- Updated both application code (`models/db.js`) and test code (`__tests__/unit/globalHooks.js`)

**Docker & CI/CD:**
- MongoDB image pinned to `mongo:7.0` (was unversioned `mongo`)
- Fixed MongoDB healthcheck to use `mongosh` instead of deprecated `mongo` CLI
- Updated CircleCI from `ubuntu-2004:2023.04.2` to `ubuntu-2204:current`

**Known Issues:**
- Unit tests with mongodb-memory-server may have platform detection issues on Ubuntu 24.04 when running locally
- Workaround: Run tests via Docker using the commands above
- CI/CD tests run in Docker and work correctly
