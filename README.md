# Concert Finder

> Find your friends in the crowd with unique flashing patterns

Concert Finder is a zero-friction web app that helps people find each other in crowded venues by generating unique, shareable flashing patterns on their phones. No app install required.

## 🚀 Key Features

- **Zero Friction**: Click link → pattern displays immediately
- **Real-time Coordination**: See other patterns in your area  
- **Smart Collision Detection**: Automatically adjusts conflicting patterns
- **Mobile-First**: Designed for phones held up in crowds
- **Fully Anonymous**: No accounts, no tracking, patterns auto-expire

## 🎯 How It Works

1. **Create**: Generate a unique flashing pattern based on your location
2. **Share**: Send the pattern link to friends via text/messaging
3. **Find**: Hold phones up with matching patterns to locate each other
4. **Connect**: Real-time updates show when others join your area

## 🛠 Tech Stack

- **Frontend**: Next.js 14 (App Router) with TypeScript
- **Database**: Supabase (Postgres + Realtime + PostGIS)
- **Styling**: Tailwind CSS + shadcn/ui
- **Package Manager**: Bun
- **Hosting**: Vercel

## 📋 Development Status

**Current Phase**: Foundation (Phase 1)

- [📊 GitHub Project Board](https://github.com/users/camwest/projects/1/views/1)
- [📋 Development Issues](https://github.com/camwest/up/issues)
- [📖 MVP Specification](./specs/mvp.md)

### Development Phases
1. **Phase 1**: Foundation - Remove auth, create patterns, display component
2. **Phase 2**: Core Features - Location, collision detection, real-time
3. **Phase 3**: Polish - Sharing, venue labels, mobile/PWA
4. **Phase 4**: Launch - Production deployment and testing

## 🏃‍♂️ Quick Start

### Prerequisites
- [Bun](https://bun.sh/) installed
- [Supabase CLI](https://supabase.com/docs/guides/cli) installed

### Local Development

```bash
# Clone and install
git clone <repo-url>
cd up
bun install

# Start local Supabase
bun run supabase:start

# Generate TypeScript types
bun run supabase:types

# Start development server
bun run dev
```

### Database Development

```bash
# Run database tests
bun run test:db

# Generate migration from schema changes
bun run supabase:diff -f migration_name

# Reset local database
bun run supabase:reset
```

## 📚 Documentation

- [CLAUDE.md](./CLAUDE.md) - Development notes and setup guide
- [MVP Specification](./specs/mvp.md) - Complete product specification
- [Deployment Guide](./docs/DEPLOYMENT.md) - Production deployment requirements

## 🔒 Privacy & Security

- **Fully anonymous** - no user accounts or personal data stored
- **Location privacy** - only approximate geohash stored (~600m precision)
- **Auto-expiry** - patterns automatically expire after 30 minutes
- **No tracking** - no analytics or user behavior monitoring

## 🚀 Deployment

Concert Finder is designed to deploy seamlessly on Vercel with Supabase:

1. **Database**: Supabase with anonymous authentication enabled
2. **Frontend**: Vercel with automatic deployments from GitHub
3. **Real-time**: Supabase Realtime for pattern coordination

See [docs/DEPLOYMENT.md](./docs/DEPLOYMENT.md) for detailed deployment instructions.

---

**Built for real-world use at concerts, festivals, and crowded events.** 🎵