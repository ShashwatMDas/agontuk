# Overview

This is a full-stack e-commerce customer support application built with React frontend and Express backend. The application provides an AI-powered chat system for customer support with escalation capabilities for human agents. It features a customer-facing product catalog with support chat functionality and an admin dashboard for managing escalated cases.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
- **Framework**: React with TypeScript using Vite as the build tool
- **UI Components**: shadcn/ui component library built on Radix UI primitives
- **Styling**: Tailwind CSS with CSS custom properties for theming
- **State Management**: TanStack Query for server state management
- **Routing**: Wouter for client-side routing
- **Forms**: React Hook Form with Zod schema validation

## Backend Architecture
- **Framework**: Express.js with TypeScript
- **Database ORM**: Drizzle ORM configured for PostgreSQL
- **Data Storage**: In-memory storage implementation with interface for database abstraction
- **API Design**: RESTful API with structured error handling and logging middleware
- **Development**: Vite integration for hot module replacement in development

## Authentication & Authorization
- **Strategy**: Simple session-based authentication with role-based access control
- **Roles**: Customer and admin user roles with protected routes
- **Storage**: Browser localStorage for session persistence

## Database Schema
- **Users**: Authentication and role management
- **Products**: E-commerce product catalog
- **Chats**: Chat sessions with message history stored as JSON
- **Escalations**: Support ticket system for human agent intervention

## Key Features
- **AI Chat Support**: Mock AI service for customer support interactions
- **Escalation System**: Automatic escalation based on confidence scores
- **Role-based Dashboards**: Separate interfaces for customers and administrators
- **Real-time Metrics**: Admin dashboard with chat and escalation analytics

# External Dependencies

## Database
- **PostgreSQL**: Primary database configured through Drizzle ORM
- **Neon Database**: Serverless PostgreSQL provider (@neondatabase/serverless)

## UI & Styling
- **Radix UI**: Comprehensive set of accessible UI primitives
- **Tailwind CSS**: Utility-first CSS framework with custom design tokens
- **Lucide Icons**: Icon library for consistent iconography

## Development Tools
- **Drizzle Kit**: Database migration and schema management
- **ESBuild**: Fast JavaScript bundler for production builds
- **Replit Integration**: Development environment optimizations and error handling

## Frontend Libraries
- **TanStack Query**: Data fetching and caching library
- **React Hook Form**: Form state management and validation
- **Wouter**: Lightweight routing library
- **Date-fns**: Date utility library