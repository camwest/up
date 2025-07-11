# Concert Finder - Claude Development Notes

## Project Overview
Concert Finder is a web app that generates unique, shareable flashing patterns on phones. No app install required.

## Project Status & Roadmap


## Key Documentation
- [MVP Specification](./specs/mvp.md) - Complete product specification
- [Core Aesthetic Guide](./docs/AESTHETIC.md) - "8-Bit Neon Signals" design system and implementation guidelines
- [Deployment Guide](./docs/DEPLOYMENT.md) - Production deployment requirements including anonymous auth setup
- [Concert Finder MVP](https://github.com/users/camwest/projects/1/views/1)
- [GitHub Issues](https://github.com/camwest/up/issues) - Development roadmap with detailed acceptance criteria

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
2. **Pattern Generation**: Create unique flashing patterns with customization options
3. **Mobile-First**: Designed for phones held up in crowds
4. **Accessibility**: Colorblind-friendly options and seizure warnings

## Database Schema
Simplified database with no tables needed - the app works entirely with client-side pattern generation and sharing via URLs.

## Development Workflow
1. Work on issues in phase order (Foundation → Core → Polish → Launch)
2. Update GitHub project board status as you progress
3. Follow existing code conventions and patterns