# Lofi Music Web App

## Overview

An immersive lofi music player web application that combines YouTube music integration, Hindi radio stations, and atmospheric background videos. The application features a glassmorphic UI design that overlays video backgrounds, creating a distraction-free music listening experience perfect for studying, working, or relaxation.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Framework**: React with TypeScript using Vite as the build tool.

**UI Component Library**: Shadcn UI (Radix UI primitives) with a "new-york" style configuration. Components are built with Tailwind CSS and follow a consistent design system with glassmorphic effects.

**Design System**:
- Glassmorphic panels with backdrop blur and semi-transparent backgrounds
- Dark and light theme support with custom CSS variables
- Typography using Inter for UI elements and Outfit for headers
- Custom color palette optimized for video overlays with subtle accent colors (soft purple)
- Design draws inspiration from premium music streaming platforms (Spotify, YouTube Music, Apple Music)

**State Management**: 
- React Query (@tanstack/react-query) for server state and API data fetching
- Local React hooks for component-level state
- Custom hooks for mobile detection and toast notifications

**Key Features**:
- YouTube music search and playback via YouTube IFrame API
- Background video player with multiple atmospheric video options
- Hindi radio station integration
- Volume control, playback controls, and track management
- Responsive design with mobile support

### Backend Architecture

**Server Framework**: Express.js with TypeScript running on Node.js.

**API Structure**:
- RESTful API endpoints
- `/api/youtube/search` - Proxy endpoint for YouTube Data API v3 searches with music category filtering
- Server-side request logging with duration tracking
- Custom error handling middleware

**Development Setup**:
- Vite middleware integration for HMR (Hot Module Replacement) in development
- Separate build process for client (Vite) and server (esbuild)
- Production build bundles server as ESM module

**Session Management**: Infrastructure exists for PostgreSQL-based sessions using connect-pg-simple (though not actively used in current implementation).

### Data Storage Solutions

**Database ORM**: Drizzle ORM configured for PostgreSQL.

**Database Provider**: Neon Database (serverless PostgreSQL) via `@neondatabase/serverless`.

**Schema Design** (minimal current implementation):
- Users table with id (UUID), username (unique), and password fields
- Zod validation schemas generated from Drizzle schema definitions

**Storage Layer**: 
- In-memory storage implementation (MemStorage) used for development/prototyping
- Production-ready database configuration available but storage layer can be swapped
- Migration system via Drizzle Kit configured

### Authentication and Authorization

**Current Implementation**: Basic user schema exists with username/password fields but no active authentication flow implemented in the current codebase.

**Prepared Infrastructure**: Session storage configuration ready (connect-pg-simple) for when authentication is implemented.

### External Dependencies

**YouTube Integration**:
- YouTube IFrame API for embedded video playback
- YouTube Data API v3 for music search functionality (requires `YOUTUBE_API_KEY` environment variable)
- Server-side proxy to protect API credentials

**Third-Party Services**:
- Google Fonts (Inter, Outfit) for typography
- Lucide React for icon system
- Background videos hosted externally (URLs configured in application)

**Build & Development Tools**:
- Vite for frontend development and bundling
- esbuild for server bundling
- TypeScript for type safety across the stack
- Tailwind CSS with PostCSS for styling
- Replit-specific plugins for development environment integration

**Design Libraries**:
- Radix UI primitives for accessible component foundations
- class-variance-authority (CVA) for component variant management
- clsx and tailwind-merge for conditional styling