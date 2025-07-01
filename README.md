# Concert Finder

> Find your friends in the crowd with unique flashing patterns

Concert Finder is a zero-friction web app that helps people find each other in crowded venues by generating unique, shareable flashing patterns on their phones. No app install required.

## 🚀 Key Features

- **Zero Friction**: Click link → pattern displays immediately
- **Custom Patterns**: Choose colors, animations (pulse/strobe/wave/fade), and speeds
- **Mobile-First**: Designed for phones held up in crowds
- **Accessibility**: Colorblind-friendly options and seizure warnings
- **Instant Sharing**: Share pattern links via text/messaging

## 🎯 How It Works

1. **Create**: Generate a unique flashing pattern with custom colors and animations
2. **Share**: Send the pattern link to friends via text/messaging  
3. **Display**: Friends click link → pattern displays fullscreen immediately
4. **Find**: Hold phones up with matching patterns to locate each other in crowds

## 🛠 Tech Stack

- **Frontend**: Next.js 14 (App Router) with TypeScript
- **Database**: Supabase (anonymous auth only)
- **Styling**: Tailwind CSS + shadcn/ui with "8-Bit Neon Signals" design system
- **Package Manager**: Bun
- **Hosting**: Vercel

## 📋 Development Status

- [📊 GitHub Project Board](https://github.com/users/camwest/projects/1/views/1)
- [📋 Development Issues](https://github.com/camwest/up/issues)
- [📖 MVP Specification](./specs/mvp.md)

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

## 🎨 Pattern Customization

- **5 Color Families**: NEON (magenta), TRON (cyan), ACID (lime), GOLD (amber), VOID (violet)
- **4 Animation Types**: PULSE (smooth breathing), STROBE (fast flashing), WAVE (moving sweep), FADE (gentle pulse)
- **5 Speed Levels**: From slow ambient to high-attention emergency
- **Accessibility Options**: Colorblind-friendly presets for protanopia, deuteranopia, and tritanopia
- **Safety Features**: Seizure warnings for strobe patterns

## 🔒 Privacy & Security

- **Fully anonymous** - no user accounts or personal data stored
- **Client-side generation** - patterns created entirely in browser
- **No tracking** - no analytics or user behavior monitoring  
- **Open source** - full transparency in code and functionality

## 🚀 Deployment

Concert Finder is designed to deploy seamlessly on Vercel with Supabase:

1. **Database**: Supabase with anonymous authentication enabled
2. **Frontend**: Vercel with automatic deployments from GitHub
3. **Pattern Generation**: Fully client-side, no server dependencies

See [docs/DEPLOYMENT.md](./docs/DEPLOYMENT.md) for detailed deployment instructions.

---

**Built for real-world use at concerts, festivals, and crowded events.** 🎵