# Team Management Web Application
live link :http://enosh-team-management-demo-2026.s3-website-us-east-1.amazonaws.com

Full-stack team management system with JWT auth, role-based access control, MongoDB analytics, and a responsive React + Material UI frontend.

## Stack

- Frontend: React, Vite, Material UI
- Backend: Node.js, Express, Mongoose
- Database: MongoDB
- Auth: JWT + bcrypt
- deploy-AWS serverless lambda,s3(frontend)

## Project Structure

```text
backend/
  src/
    config/
    controllers/
    middleware/
    models/
    routes/
    seed/
    utils/
frontend/
  src/
    api/
    components/
    context/
    layouts/
    pages/
    theme/
```

## Features

- JWT-based authentication
- Password hashing with `bcryptjs`
- Roles: `Admin`, `Manager`, `Employee`
- CRUD APIs for users, teams, achievements, and employee performance reviews
- Search and filtering on list APIs
- Analytics dashboard for admin users with direct answers to team-structure questions
- Role-specific frontend pages for login, dashboard, teams, users, achievements, performance, and profile
- Form-based linked record creation for teams, achievements, users, and performance reviews

## Role Access

- Admin:
  Full access to users, teams, achievements, performance reviews, and analytics
- Manager:
  Create/manage their teams, add achievements, review employee performance, view only their teams
- Employee:
  View assigned team, see achievements in scope, review their own performance, update own profile

## Setup

### 1. Backend

```bash
cd backend
cp .env.example .env
npm install
npm run seed
npm run dev
```

### 2. Frontend

```bash
cd frontend
cp .env.example .env
npm install
npm run dev
```

### 3. Optional root workflow

```bash
npm install
npm run install:all
npm run dev
```

## Seed Credentials

- Admin: `admin@example.com` / `password123`
- Manager: `manager1@example.com` / `password123`
- Manager: `manager2@example.com` / `password123`

## API Summary

### Auth

- `POST /api/auth/login`
- `POST /api/auth/bootstrap` one-time first admin creation with `BOOTSTRAP_SECRET`
- `POST /api/auth/register` admin only
- `GET /api/auth/me`

### Users

- `GET /api/users` admin only
- `POST /api/users` admin only
- `GET /api/users/:id` admin only
- `PUT /api/users/:id` admin only
- `DELETE /api/users/:id` admin only
- `GET /api/users/me`
- `PUT /api/users/me`

### Teams

- `GET /api/teams`
- `POST /api/teams`
- `GET /api/teams/:id`
- `PUT /api/teams/:id`
- `DELETE /api/teams/:id`
- `POST /api/teams/:id/members`
- `DELETE /api/teams/:id/members/:userId`

### Achievements

- `GET /api/achievements`
- `POST /api/achievements`
- `GET /api/achievements/:id`
- `PUT /api/achievements/:id`
- `DELETE /api/achievements/:id`

### Performance

- `GET /api/performances`
- `POST /api/performances`
- `GET /api/performances/:id`
- `PUT /api/performances/:id`
- `DELETE /api/performances/:id`

### Analytics

- `GET /api/analytics/dashboard`
- `GET /api/analytics/teams/members`
- `GET /api/analytics/teams/locations`
- `GET /api/analytics/teams/achievements/monthly`
- `GET /api/analytics/teams/manager-not-colocated/count`
- `GET /api/analytics/teams/manager-non-direct-staff/count`
- `GET /api/analytics/teams/non-direct-staff-ratio-above-20/count`
- `GET /api/analytics/teams/reporting-to-organization-leader/count`

## MongoDB Analytics Queries

The reusable MongoDB aggregation pipelines are in [backend/src/utils/analyticsQueries.js](/c:/Users/enosh/workshop/backend/src/utils/analyticsQueries.js).

- `membersPerTeamPipeline()`
- `monthlyAchievementsPerTeamPipeline()`
- `managerNotColocatedPipeline()`
- `managerNonDirectStaffPipeline()`
- `nonDirectStaffRatioAbove20Pipeline()`
- `reportingToOrganizationLeaderPipeline()`

These power the analytics controller in [backend/src/controllers/analyticsController.js](/c:/Users/enosh/workshop/backend/src/controllers/analyticsController.js).

## Notes

- Manager-scoped team access is enforced in the backend controller layer.
- Team membership stays synchronized when users are assigned or removed.
- Team, achievement, user, and performance creation flows now use frontend selectors for linked records instead of manual MongoDB ID entry.
- Employee performance is stored monthly with reviewer, score, goal completion, strengths, and improvement areas.
- For AWS or other production deployments without seed data, set `BOOTSTRAP_SECRET` on the backend and call `POST /api/auth/bootstrap` once to create the first admin with a properly hashed password.
