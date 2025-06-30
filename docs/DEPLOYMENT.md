# Concert Finder - Deployment Guide

## Anonymous Authentication Setup

Concert Finder uses anonymous authentication to provide zero-friction user experience. Users never need to create accounts - they just click a link and start displaying patterns.

### Local Development
Already configured in `supabase/config.toml`:
```toml
enable_anonymous_sign_ins = true
```

### Production Deployment Requirements

#### 1. Supabase Dashboard Configuration
- **Enable Anonymous Sign-ins**: Navigate to Authentication → Settings in Supabase dashboard
- **Rate Limiting**: Default 30 anonymous sign-ins per hour per IP (configurable in dashboard)

#### 2. Row Level Security (RLS) Policies
When creating database policies, distinguish between anonymous and permanent users:
```sql
-- Example: Allow anonymous users to read patterns
CREATE POLICY "Anonymous users can read patterns" ON patterns
FOR SELECT USING (auth.jwt()->>'is_anonymous' = 'true');
```

#### 3. Database Cleanup (Optional)
Anonymous users don't auto-delete. Set up periodic cleanup:
```sql
-- Clean up anonymous users older than 30 days
DELETE FROM auth.users 
WHERE is_anonymous = true 
AND created_at < now() - interval '30 days';
```

#### 4. Abuse Prevention (Optional)
If bot abuse becomes an issue:
- Enable CAPTCHA (hCaptcha or Cloudflare Turnstile) in dashboard
- Adjust rate limits per use case

#### 5. Next.js Considerations
- Use dynamic rendering for pages with anonymous auth
- Ensure auth state doesn't cache across anonymous sessions

## GitHub Actions Setup

### Required Secrets

Add these secrets to your GitHub repository settings (Settings → Secrets and variables → Actions):

1. **SUPABASE_ACCESS_TOKEN**
   - Get from: Supabase Dashboard → Account Settings → Access Tokens
   - Create a new personal access token with appropriate permissions

2. **SUPABASE_PROJECT_REF**
   - Your project reference ID (e.g., `ltxbpzqxlajrxjrbwbej`)
   - Found in: Supabase Dashboard → Project Settings → General

3. **SUPABASE_DB_PASSWORD**
   - Your production database password
   - Found in: Supabase Dashboard → Project Settings → Database

### GitHub Environment Protection

The deploy workflow uses a `production` environment. Configure this in:
GitHub Repository → Settings → Environments → New environment

Add protection rules as needed (e.g., required reviewers for production deployments).

## Environment Variables

### Production
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

### Development
```env
NEXT_PUBLIC_SUPABASE_URL=http://localhost:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=local-anon-key
SUPABASE_SERVICE_ROLE_KEY=local-service-role-key
```

## Database Schema

See `specs/mvp.md` for complete schema including:
- `venues` table (location-based rooms)
- `patterns` table (active patterns with auto-expiry)
- `venue_labels` table (crowd-sourced venue names)

## Key Security Notes

1. **No User Data Storage**: Patterns are temporary, locations expire
2. **Anonymous by Design**: Zero personal information collected
3. **Auto-Expiry**: All data cleans up automatically (30 min inactive)
4. **URL-Based State**: Most state lives in shareable URLs