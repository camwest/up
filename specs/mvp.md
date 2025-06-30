# Concert Finder - MVP Specification

## Overview
A web app that helps people find each other in crowds by generating unique, shareable flashing patterns on their phones. No app install required.

## Core Features

### MVP Features
1. **Pattern Generation**
   - Unique color/animation combinations based on location
   - Patterns encoded in URL query strings for easy sharing
   - Auto-contrast detection to ensure visibility

2. **Real-time Venue Rooms**
   - Location-based "rooms" using geohashing
   - See all active patterns in your area
   - Automatic pattern expiry (30 min inactive)

3. **Sharing Flow**
   - Generate pattern → Get shareable link → Text to friends
   - No accounts, no sign-up
   - Works on any mobile browser

## Tech Architecture

### Stack
- **Frontend**: Next.js 14 (App Router)
- **Hosting**: Vercel
- **Backend**: Supabase (Postgres + Realtime + Edge Functions)
- **Styling**: Tailwind CSS
- **Deployment**: Vercel (auto-deploy from GitHub)

### Database Schema (Supabase)

```sql
-- Venues (lazy-created)
CREATE TABLE venues (
  id TEXT PRIMARY KEY, -- geohash6 (~600m)
  label TEXT,
  center GEOGRAPHY(POINT),
  use_count INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  last_active TIMESTAMPTZ DEFAULT NOW()
);

-- Active patterns
CREATE TABLE patterns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  venue_id TEXT REFERENCES venues(id),
  pattern JSONB NOT NULL, -- {colors, animation, speed, etc}
  contrast_vector FLOAT[], -- for comparison
  location GEOGRAPHY(POINT),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  last_ping TIMESTAMPTZ DEFAULT NOW()
);

-- Venue labels (crowd-sourced)
CREATE TABLE venue_labels (
  venue_id TEXT REFERENCES venues(id),
  label TEXT,
  count INTEGER DEFAULT 1,
  PRIMARY KEY (venue_id, label)
);

-- Indexes
CREATE INDEX idx_patterns_venue ON patterns(venue_id);
CREATE INDEX idx_patterns_last_ping ON patterns(last_ping);
CREATE INDEX idx_venues_location ON venues USING GIST(center);
```

### Key Routes

```typescript
// app/page.tsx - Landing page
// app/create/page.tsx - Pattern creator
// app/p/[pattern]/page.tsx - Pattern display
// app/api/patterns/route.ts - Pattern CRUD
```

## User Flows

### Dual-Purpose Pattern Links

#### URL Structure
```
concertfinder.app/p?c1=FF0000&c2=00FF00&a=pulse&s=2&mode=display
```

#### Journey A: "I'm meeting friends already there"
1. **Finder** (outside) → Creates pattern → Gets link
2. Sends link to **Friend** (inside venue)
3. **Friend** clicks link → Pattern displays immediately
4. **Friend's** location triggers collision check
5. If collision detected → Auto-adjust pattern slightly (rare)
6. Both see same pattern (with any adjustments)

#### Journey B: "Come find me"
1. **Person in venue** → Creates pattern → Broadcasting
2. Sends link to **incoming friends**
3. **Friends** click link → See pattern to look for

### Creating a Pattern
1. Land on homepage → "Find My Friends"
2. Browser requests location permission
3. Generate unique pattern avoiding local collisions
4. Optional: Add venue label
5. Get shareable link

### Finding Someone
1. Receive link via text
2. Click link → Opens pattern display
3. Hold phone up with flashing pattern
4. Optional: See "3 others nearby with patterns"

## Implementation Details

### Pattern Generation Algorithm
```typescript
interface Pattern {
  primary: string; // hex color
  secondary?: string; // optional second color
  animation: 'pulse' | 'strobe' | 'wave' | 'fade';
  speed: number; // 1-5
}

function generateUniquePattern(
  location: Coords, 
  nearbyPatterns: Pattern[]
): Pattern {
  // Use HSL color space for better distribution
  // Ensure min distance from existing patterns
  // Return pattern with good contrast
}
```

### Smart Pattern Resolution
```typescript
// When someone opens a pattern link
async function handlePatternLink(params: PatternParams, location?: Coords) {
  // Pattern displays immediately (no friction)
  displayPattern(params);
  
  // If they're in a venue (location available)
  if (location) {
    const venueId = getGeohash(location);
    const validation = await validatePattern(params, venueId);
    
    if (validation.hasCollision) {
      // Smoothly transition to adjusted pattern
      const adjusted = validation.adjustedPattern;
      animatePatternChange(params, adjusted);
      updateURLParams(adjusted); // Update URL without reload
      
      // Notify subtly
      showToast("Pattern adjusted for uniqueness ✨");
    }
    
    // Broadcast to venue
    broadcastPattern(validation.pattern, venueId);
  }
}
```

### Real-time Subscription
```typescript
// app/p/[pattern]/page.tsx
useEffect(() => {
  const channel = supabase
    .channel(`venue:${venueId}`)
    .on('presence', { event: 'sync' }, () => {
      const state = channel.presenceState();
      updateNearbyPatterns(state);
    })
    .on('presence', { event: 'join' }, ({ newPresences }) => {
      // New pattern in area
    })
    .on('presence', { event: 'leave' }, ({ leftPresences }) => {
      // Pattern expired/left
    })
    .subscribe();
    
  // Broadcast own pattern
  channel.track({
    pattern: myPattern,
    location: myLocation
  });
}, []);
```

### Pattern Display Component
```tsx
// components/PatternDisplay.tsx
export function PatternDisplay({ pattern }: { pattern: Pattern }) {
  return (
    <div 
      className="fixed inset-0 transition-all duration-300"
      style={{
        backgroundColor: pattern.primary,
        animation: `${pattern.animation} ${pattern.speed}s infinite`
      }}
    >
      {/* Tailwind animations defined in globals.css */}
    </div>
  );
}
```

### Collision Handling
```typescript
function adjustPattern(original: Pattern, conflicts: Pattern[]): Pattern {
  // Try minimal adjustments first
  const adjustments = [
    () => tweakSpeed(original),
    () => tweakSecondaryColor(original),
    () => shiftHue(original, 30),
    () => changeAnimation(original)
  ];
  
  for (const adjust of adjustments) {
    const candidate = adjust();
    if (isUnique(candidate, conflicts)) {
      return candidate;
    }
  }
  
  // Fallback: generate new pattern
  return generateUniquePattern(conflicts);
}
```

## UI/UX Considerations

### Mobile-First Design
- Full screen pattern display
- Large touch targets
- Minimal UI when displaying pattern
- PWA capabilities for "Add to Home Screen"

### Landing Page Flow
```tsx
<div className="flex flex-col gap-4 p-6">
  <h1>Concert Finder</h1>
  
  {/* Primary CTA */}
  <button className="btn-primary">
    Create Pattern to Share
  </button>
  
  {/* Secondary info */}
  <p className="text-sm text-gray-600">
    Send the link to your friends so they can find you
  </p>
</div>
```

### Pattern Page Layout
```tsx
function PatternPage({ searchParams }) {
  const [mode, setMode] = useState<'display' | 'adjust'>('display');
  const [pattern, setPattern] = useState(parsePattern(searchParams));
  
  return (
    <>
      <PatternDisplay pattern={pattern} />
      
      {/* Minimal UI overlay */}
      <div className="absolute bottom-4 left-4 right-4">
        <button className="text-white/70 text-sm">
          Hold phone up high ↑
        </button>
      </div>
    </>
  );
}
```

### Accessibility
- High contrast mode option
- Pattern alternatives for colorblind users
- Optional haptic feedback (vibration patterns)

## Key UX Principles

1. **Zero Friction** - Pattern displays immediately when link clicked
2. **Smart Defaults** - Assume the link recipient is at the venue
3. **Graceful Adjustments** - If collision happens, transition smoothly
4. **Clear Communication** - Simple sharing text that explains what to do
5. **Works Without Location** - If they deny location, pattern still displays

## Share Messages

```typescript
// Context-aware share messages
const shareMessages = {
  toVenue: "Click this and hold your phone up so I can find you: [link]",
  fromVenue: "Look for this pattern - I'm holding my phone up: [link]",
  generic: "Find me with this flashing pattern: [link]"
};
```

## Privacy & Security
- No user data stored
- Locations only kept while active
- Patterns auto-expire
- No tracking or analytics in MVP

## Future Enhancements (v2)
- AR camera view to spot patterns
- Sound patterns for noisy venues
- Group patterns (one link, multiple unique patterns)
- Popular venue suggestions
- Pattern history (localStorage only)

## Launch Strategy
1. Build MVP over a weekend
2. Test at local event
3. Share with friends
4. Let it grow organically
5. Add features based on actual usage

## Success Metrics
- Time to find someone (target: < 2 minutes)
- Pattern uniqueness (no collisions reported)
- Organic sharing (links texted)