# LIQIFY - Solana Trading Competition Platform

## Overview

LIQIFY is a gamified Solana-connected trading competition platform where users stake 10 USDC to join trading challenges. The application features a dark-themed, RPG-inspired interface for competitive trading experiences using existing Drift accounts. The platform is built as a full-stack web application with a React frontend and Express backend, utilizing PostgreSQL for data persistence.

## System Architecture

### Frontend Architecture
- **Framework**: Next.js 14 with React 18 and strict TypeScript
- **Routing**: Next.js Pages Router for navigation
- **Styling**: Tailwind CSS with custom dark theme and gaming aesthetics
- **UI Components**: Radix UI primitives with shadcn/ui component library
- **State Management**: TanStack React Query for server state
- **Rendering**: Hybrid rendering with client-side components for interactive elements

### Backend Architecture
- **API Routes**: Next.js API routes for serverless functions
- **Language**: TypeScript with ES modules
- **Database**: PostgreSQL with Drizzle ORM
- **Database Provider**: Neon Database (@neondatabase/serverless)
- **Session Management**: In-memory storage with planned PostgreSQL integration
- **Development**: Next.js development server with hot module replacement

### Key Components

#### Frontend Components
1. **Hero Section**: Countdown timer, challenge stats, and call-to-action
2. **Join Challenge**: Wallet connection, username validation, and payment processing
3. **Rules & Rewards**: Challenge specifications and winning criteria
4. **Leaderboard**: Real-time player rankings and performance metrics
5. **Navigation**: Responsive navigation with wallet integration
6. **Wallet Provider**: Mock Solana wallet integration with connection state

#### Backend Components
1. **Storage Interface**: Abstracted CRUD operations for user management
2. **Memory Storage**: In-memory implementation for development
3. **API Routes**: Next.js API endpoints for data operations
4. **Server-Side Rendering**: SSR capabilities for improved SEO and performance

## Data Flow

### User Registration Flow
1. User connects Solana wallet (currently mocked)
2. User enters unique username
3. System validates username uniqueness
4. User pays 10 USDC entry fee (simulated)
5. Registration confirmation and success state

### Challenge Participation
1. Challenge countdown timer displays time until start
2. Users can join before challenge begins
3. Live leaderboard tracks player performance
4. Real-time updates of pool size and participant count

## External Dependencies

### Core Dependencies
- **Blockchain**: Solana network integration (currently mocked)
- **Database**: Neon PostgreSQL for production data
- **UI Framework**: Radix UI for accessible component primitives
- **Styling**: Tailwind CSS for utility-first styling
- **Forms**: React Hook Form with Zod validation
- **Icons**: Lucide React for consistent iconography

### Development Dependencies
- **TypeScript**: Full type safety across frontend and backend with strict mode enabled
- **Next.js**: Unified framework for both frontend and API routes
- **Drizzle Kit**: Database migrations and schema management
- **ESLint**: Code quality and style enforcement

## Deployment Strategy

### Build Process
1. **Next.js Build**: `next build` creates optimized production build
2. **Static Assets**: Static files served from `/public` directory
3. **Database**: Drizzle migrations applied via `drizzle-kit push`

### Environment Configuration
- **Development**: Next.js dev server with hot module replacement
- **Production**: Next.js server or static export depending on hosting platform
- **Database**: PostgreSQL connection via `DATABASE_URL` environment variable

### Deployment Architecture
The application follows a unified Next.js structure with:
- Next.js pages for routing and UI
- API routes for backend functionality
- Database schema and migrations