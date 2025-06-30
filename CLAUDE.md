# Concert Finder - Claude Development Notes

## Project Overview
Concert Finder is a web app that helps people find each other in crowds by generating unique, shareable flashing patterns on their phones. No app install required.

## Key Documentation
- [MVP Specification](./specs/mvp.md) - Complete product specification
- [Deployment Guide](./docs/DEPLOYMENT.md) - Production deployment requirements including anonymous auth setup

## Development Setup

### Local Supabase
```bash
# Start local Supabase
bunx supabase start

# Generate TypeScript types
bun run supabase:types

# Run database tests
bun run test:db
```

### Environment Configuration
- Local development uses anonymous authentication (already enabled)
- See `docs/DEPLOYMENT.md` for production environment setup

## Tech Stack
- **Frontend**: Next.js 14 (App Router) with TypeScript
- **Database**: Supabase (Postgres + Realtime)
- **Styling**: Tailwind CSS + shadcn/ui
- **Package Manager**: Bun
- **Hosting**: Vercel

## Key Features
1. **Zero Friction**: No accounts, click link → display pattern
2. **Real-time**: See other patterns in your area
3. **Smart Collision Detection**: Automatically adjust conflicting patterns
4. **Mobile-First**: Designed for phones held up in crowds