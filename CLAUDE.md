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
bun run supabase:start

# Generate TypeScript types  
bun run supabase:types

# Run database tests
bun run test:db
```

### Schema Development Workflow
```bash
# 1. Stop Supabase to edit schemas
bun run supabase:stop

# 2. Edit schema files in supabase/schemas/
# 3. Generate migration from schema changes
bun run supabase:diff -f migration_name

# 4. Start Supabase and test
bun run supabase:start
bun run test:db

# 5. Update TypeScript types
bun run supabase:types
```

### Available Scripts
- `supabase:start/stop` - Local Supabase management
- `supabase:reset` - Reset local database
- `supabase:diff` - Generate migration from schema changes
- `supabase:push` - Deploy migrations to production
- `supabase:types` - Generate TypeScript types
- `test:db` - Run database tests

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