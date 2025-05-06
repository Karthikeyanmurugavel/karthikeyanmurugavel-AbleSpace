Architecture Documentation
Overview
This project is a full-stack task management application ("TaskFlow") that allows users to create, assign, and track tasks. The application follows a modern client-server architecture with a clear separation between frontend and backend components. It uses PostgreSQL for data persistence, implements real-time notifications via WebSockets, and features a responsive UI built with React and ShadcnUI components.

System Architecture
The application follows a traditional three-tier architecture:

Presentation Layer: React-based single-page application
Application Layer: Express.js backend server
Data Layer: PostgreSQL database accessed via Drizzle ORM
The system employs a monorepo structure with clear separation between client and server code, while sharing certain schemas and types between frontend and backend.

┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│                 │     │                 │     │                 │
│  React Frontend │◄────┤ Express Backend │◄────┤  PostgreSQL DB  │
│                 │     │                 │     │                 │
└─────────────────┘     └─────────────────┘     └─────────────────┘
        ▲                       ▲
        │                       │
        └───────────────────────┘
           WebSocket Connection
Directory Structure
/
├── client/               # Frontend React application
│   ├── src/              # React source code
│   │   ├── components/   # UI components
│   │   ├── hooks/        # Custom React hooks
│   │   ├── lib/          # Utility functions and clients
│   │   ├── pages/        # Page components
│   │   └── types/        # TypeScript type definitions
├── server/               # Backend Express application
│   ├── controllers/      # Route handlers
│   ├── auth.ts           # Authentication logic
│   ├── index.ts          # Server entry point
│   ├── routes.ts         # API route definitions
│   └── storage.ts        # Database access layer
├── db/                   # Database configuration
│   ├── index.ts          # Database connection
│   └── seed.ts           # Database seeding script
├── shared/               # Shared code between frontend and backend
│   └── schema.ts         # Database schema and type definitions
└── ...                   # Configuration files
Key Components
Frontend
The frontend is built with React and uses the following key technologies:

UI Framework: React with TypeScript
Routing: Wouter for lightweight client-side routing
State Management: React Query for server state and React Context for application state
UI Components: ShadcnUI components (based on Radix UI primitives)
Styling: Tailwind CSS for utility-first styling
The frontend architecture follows a component-based approach with clear separation of concerns:

Pages: High-level components that represent different routes in the application
Components: Reusable UI elements organized by feature area
Hooks: Custom React hooks for shared logic and state management
Utils/Lib: Utility functions and API client code
Backend
The backend is built with Express.js and provides:

RESTful API: For CRUD operations on tasks and user management
Authentication: Session-based authentication with Passport.js
WebSockets: Real-time notifications using ws library
Database Access: Abstracted through a storage interface
The backend architecture follows a layered approach:

Routes: Define API endpoints and connect them to controllers
Controllers: Implement business logic for each endpoint
Storage: Abstracts database operations
Authentication: Handles user sessions and security
Database
The database layer uses:

PostgreSQL: As the primary data store
Drizzle ORM: For type-safe database access
Connect-PG-Simple: For PostgreSQL-based session storage
The database schema defines the following main entities:

Users: Storing user credentials and profile information
Tasks: Storing task details, status, and assignments
Notifications: Storing user notifications
Data Flow
Task Creation Flow
User fills out task creation form in the UI
Frontend validates form and sends POST request to /api/tasks
Backend controller validates request and calls storage layer
Storage layer inserts new task into the database
Backend sends WebSocket notification to assigned user
Frontend updates UI and task list via React Query invalidation
Authentication Flow
User submits login credentials
Frontend sends authentication request to /api/login
Backend validates credentials and creates a user session
Session ID is stored in a cookie
Frontend redirects to dashboard
Subsequent requests include the session cookie for authentication
External Dependencies
Frontend Dependencies
@tanstack/react-query: For server state management
@radix-ui/react-: UI component primitives
shadcn/ui: Component library based on Radix UI
tailwindcss: Utility-first CSS framework
wouter: Lightweight router for React
Backend Dependencies
express: Web server framework
passport: Authentication middleware
@neondatabase/serverless: PostgreSQL client for Neon database
drizzle-orm: TypeScript ORM
ws: WebSocket implementation
Deployment Strategy
The application is configured for deployment on Replit with the following approach:

Build Process:

Frontend: Vite builds static assets to dist/public
Backend: ESBuild bundles server code to dist/index.js
Production Deployment:

The application runs in production mode with NODE_ENV=production
The Express server serves the static frontend assets
Database Provisioning:

The application expects a PostgreSQL database connection string through the DATABASE_URL environment variable
Uses Neon Database (serverless PostgreSQL)
Environment Variables:

DATABASE_URL: PostgreSQL connection string
SESSION_SECRET: Secret for signing session cookies
NODE_ENV: Runtime environment
Scaling Considerations:

Stateless design allows horizontal scaling of the backend
Session state is persisted in the database, not in memory
WebSocket connections might require sticky sessions in a multi-instance deployment