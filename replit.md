# B-Perks: Barangay Community Engagement Platform

## Overview

B-Perks is a comprehensive community engagement platform designed for Barangay San Vicente in Baguio City, Philippines. The application uses a points-based reward system to incentivize civic participation through events, community reporting, and local engagement. The platform features both resident and administrative interfaces with offline-capable GIS mapping functionality.

## User Preferences

Preferred communication style: Simple, everyday language.
Authentication: Frontend-only mode, no backend database connections.

## Recent Changes (July 16, 2025)

- **Complete Offline Functionality Implementation**: Implemented comprehensive offline capabilities
  - Progressive Web App (PWA) with service worker for caching and background sync
  - Offline storage system using IndexedDB for persistent data storage
  - Smart caching strategies: network-first for API calls, cache-first for static resources
  - Offline queue system for user actions when internet is unavailable
  - Automatic sync when connection is restored
  - Enhanced GIS map with offline tile caching for Baguio City area
  - PWA install prompts with native app-like experience
  - Offline indicator showing connection status and pending actions
  - Dedicated offline settings page for cache management
  - Map preloading and smart tile management with 30-day expiry
  - Comprehensive offline features: cached events, rewards, reports, news viewing
  - Queued actions for event registration, reward redemption, report submission
  - Service worker handles 50+ MB of cached map tiles and application data

## Previous Changes (July 14, 2025)

- **Project Migration Complete**: Successfully migrated from Replit Agent to Replit environment
- **Critical Bug Fixes**: Fixed multiple core functionality issues during migration
  - Reporter name display: Fixed "Unknown User" issue in report details by adding userName to reports API
  - One-time point granting: Admin can now only grant or decline points once per participant
  - Reward quantity tracking: Fixed quantity deduction and points deduction on reward redemption
  - Admin interface cleanup: Removed "Publish a Report" feature from admin panel
- **Enhanced Query Management**: Improved cache invalidation for real-time UI updates
- **Authentication System**: Maintained frontend-only authentication with file-based storage
- **Critical Authentication Fix**: Resolved user ID mismatch between frontend and backend authentication systems
- **Complete Activity Tracking**: All user actions (reports, event registration, point grants) now appear in Recent Activity dashboard
- **GIS Map Coordinates Fix**: Reports now display at exact user-specified coordinates on community map
- **Admin Participant Display**: Event participants now show actual user names and phone numbers instead of "Unknown User"
- **Real-Time Status Updates**: Report status changes by admin now immediately reflect in UI and notifications
- **News Publishing System**: Admin can publish report updates to News & Alerts with proper status information
- **Transaction System Enhancement**: Added support for report submissions and event registrations in activity tracking
- **Real-Time Data Persistence**: All operations now automatically save to local text files:
  - User registrations, login credentials, and point updates
  - Community events creation and management
  - Rewards catalog and claim processing
  - Community reports submission and tracking
  - News and alerts publishing
- **Admin Point Granting System**: Implemented complete point granting workflow:
  - Admin can view event participants with real-time API data
  - One-time point granting per event with status tracking
  - Points granted show immediately in user's Recent Activity dashboard
  - Automatic transaction creation with event details
  - Event status updates (active/ended) controlled by admin
- **Enhanced Event Management**: Real event participant tracking with user name resolution
- **Smart Location Autocomplete**: Added intelligent location search for San Vicente addresses
- **Database Location**: All data stored in `data/local_database/` with automatic updates
- **Persistence Fixed**: Users now persist across server restarts (loads from files on startup)
- **Migration Benefits**: No external database dependency, enhanced security, improved performance
- **Event Registration Fixes**: Fixed event registration UI updates, GIS map real-time data integration, and participant tracking
  - Event registration now immediately shows "Registered" status
  - GIS map displays actual events from database instead of sample data
  - Admin can see real-time event participants with proper user name resolution
  - Improved query caching to ensure fresh data after registration
- **Post-Migration Issue Fixes (Latest)**:
  - **Notification Date Display**: Fixed missing dates in notification timestamps with proper fallback handling
  - **Reward Claim History**: Fixed "Unknown Reward" display by enhancing API to include reward titles in claims response
  - **Admin Grant/Decline Buttons**: Improved mutation handling with proper loading states and query invalidation
  - **Event Creation Enhancement**: Added comprehensive event creation with map-based location selection and date/time pickers
  - **Event Type Routing**: Events now correctly appear in Events section instead of News when created by admin
  - **GIS Map Integration**: Fixed GIS map component exports and location selection functionality for event creation
  - **Map Location Selection Fix**: Resolved blank map issue in admin event creation by adding proper props interface and click handling
  - **Event Location Preview**: Replaced input box with map preview in event creation form, showing selected location with marker
  - **Rewards History Cache**: Enhanced reward redemption to immediately update claim history with proper query invalidation
  - **Claim Code Display**: Resolved claim code visibility issues in reward history detailed view

## System Architecture

### Frontend Architecture
The frontend is built using React with TypeScript, utilizing Vite as the build tool for fast development and optimized production builds. The application follows a component-based architecture with:

- **UI Framework**: Custom design system based on shadcn/ui components with Philippine-inspired color scheme
- **Routing**: React Router for client-side navigation with role-based route protection
- **State Management**: Local storage-based authentication store and React Query for server state
- **Styling**: Tailwind CSS with custom CSS variables for theming
- **Offline Capabilities**: Progressive Web App features with offline map caching

### Backend Architecture
The backend uses Express.js with TypeScript in a minimalist RESTful API design:

- **Server Framework**: Express.js with middleware for logging and error handling
- **Database Layer**: Drizzle ORM configured for PostgreSQL with Neon Database serverless adapter
- **Storage Interface**: Abstracted storage layer supporting both in-memory and database implementations
- **Development Setup**: Vite integration for hot module replacement during development

### Project Structure
```
├── client/                 # Frontend React application
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/         # Route-specific page components
│   │   ├── hooks/         # Custom React hooks
│   │   ├── store/         # Client-side state management
│   │   ├── types/         # TypeScript type definitions
│   │   └── utils/         # Utility functions and helpers
├── server/                # Backend Express application
│   ├── routes.ts          # API route definitions
│   ├── storage.ts         # Data access layer
│   └── vite.ts           # Development server integration
├── shared/                # Shared code between client and server
│   └── schema.ts         # Database schema and validation
└── migrations/           # Database migration files
```

## Key Components

### Authentication System
- **Implementation**: Local storage-based session management with role-based access control
- **User Roles**: Regular residents and administrative users with different interface access
- **Security**: Client-side validation with plans for server-side session management

### Points and Rewards System
- **Earning Points**: Users earn points by participating in community events and activities
- **Redemption**: Points can be exchanged for rewards like eco-friendly products and community merchandise
- **Transaction Tracking**: Complete audit trail of point earnings and redemptions

### GIS Mapping Integration
- **Technology**: Leaflet with React Leaflet for interactive mapping
- **Offline Support**: Custom tile caching system using localforage for offline map access
- **Layers**: Multiple map layers for reports, events, safety levels, and administrative boundaries
- **Geolocation**: Location-based features for event participation and community reporting

### Event Management
- **Event Creation**: Administrative interface for creating and managing community events
- **Registration**: User registration system with proof of participation
- **Location Integration**: GIS coordinates for event locations with navigation support

### Community Reporting
- **Report Submission**: Users can submit community issues with location data and media attachments
- **Status Tracking**: Administrative workflow for processing and responding to reports
- **Categorization**: Different report types for various community concerns

### News and Announcements
- **Content Management**: Administrative publishing system for community news and alerts
- **Categorization**: Different content types (news, alerts, announcements) with visual distinction
- **Real-time Updates**: Push notification system for urgent alerts and announcements

## Data Flow

### Client-Server Communication
1. **API Requests**: RESTful API endpoints prefixed with `/api` for all server communication
2. **Data Fetching**: React Query for caching, synchronization, and background updates
3. **Offline Support**: Local storage fallback for critical data when offline

### Database Operations
1. **Schema Definition**: Drizzle ORM schema with Zod validation for type safety
2. **Migration Management**: Drizzle Kit for database schema migrations
3. **Storage Abstraction**: Interface-based storage layer supporting multiple implementations

### State Management
1. **Authentication**: Centralized auth store with localStorage persistence
2. **Application State**: React Query for server state, local React state for UI state
3. **Offline Data**: IndexedDB through localforage for cached map tiles and offline data

## External Dependencies

### Core Technologies
- **React 18**: Frontend framework with hooks and functional components
- **TypeScript**: Type safety across the entire application
- **Vite**: Build tool and development server
- **Express.js**: Backend web framework
- **Drizzle ORM**: Database toolkit with TypeScript support

### UI and Styling
- **Tailwind CSS**: Utility-first CSS framework
- **Radix UI**: Accessible component primitives
- **shadcn/ui**: Pre-built component library
- **Lucide React**: Icon library

### Database and Storage
- **PostgreSQL**: Primary database (configured for Neon Database)
- **localforage**: IndexedDB wrapper for client-side storage
- **connect-pg-simple**: PostgreSQL session store

### Mapping and Location
- **Leaflet**: Open-source mapping library
- **React Leaflet**: React components for Leaflet integration

### Development Tools
- **TypeScript Compiler**: Type checking and compilation
- **PostCSS**: CSS processing with Autoprefixer
- **ESBuild**: Fast JavaScript bundler for production builds

## Deployment Strategy

### Development Environment
- **Replit Integration**: Configured for Replit development environment with hot reloading
- **Local Development**: Vite dev server with Express backend integration
- **Environment Variables**: Database connection string and configuration through environment variables

### Production Build
- **Frontend**: Vite build process generating optimized static assets
- **Backend**: ESBuild compilation to ESM modules for Node.js execution
- **Database**: Drizzle migrations for schema deployment
- **Static Assets**: Served through Express with proper caching headers

### Infrastructure Requirements
- **Node.js Runtime**: ESM module support required
- **PostgreSQL Database**: Neon Database serverless or traditional PostgreSQL
- **File Storage**: Local file system or cloud storage for uploaded media
- **CDN**: Optional for static asset delivery and map tile caching

The application is designed as a monorepo with shared TypeScript types and utilities, enabling rapid development while maintaining type safety across the full stack. The architecture supports both online and offline usage patterns, making it suitable for areas with intermittent internet connectivity.