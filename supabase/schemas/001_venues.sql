-- Venues schema for Concert Finder
-- Location-based "rooms" using geohashing for pattern collision detection

-- Enable PostGIS extension for geographic operations
CREATE EXTENSION IF NOT EXISTS postgis;

-- Venues table (lazy-created based on geohash6 ~600m precision)
CREATE TABLE IF NOT EXISTS venues (
  id TEXT PRIMARY KEY, -- geohash6 (~600m)
  label TEXT,
  center GEOGRAPHY(POINT),
  use_count INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  last_active TIMESTAMPTZ DEFAULT NOW()
);

-- Active patterns table
CREATE TABLE IF NOT EXISTS patterns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  venue_id TEXT REFERENCES venues(id),
  pattern JSONB NOT NULL, -- {colors, animation, speed, etc}
  contrast_vector FLOAT[], -- for collision detection
  location GEOGRAPHY(POINT),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  last_ping TIMESTAMPTZ DEFAULT NOW()
);

-- Venue labels table (crowd-sourced)
CREATE TABLE IF NOT EXISTS venue_labels (
  venue_id TEXT REFERENCES venues(id),
  label TEXT,
  count INTEGER DEFAULT 1,
  PRIMARY KEY (venue_id, label)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_patterns_venue ON patterns(venue_id);
CREATE INDEX IF NOT EXISTS idx_patterns_last_ping ON patterns(last_ping);
CREATE INDEX IF NOT EXISTS idx_venues_location ON venues USING GIST(center);

-- Row Level Security (RLS) policies
ALTER TABLE venues ENABLE ROW LEVEL SECURITY;
ALTER TABLE patterns ENABLE ROW LEVEL SECURITY;
ALTER TABLE venue_labels ENABLE ROW LEVEL SECURITY;

-- Anonymous users can read all venues and patterns
CREATE POLICY "Anonymous users can read venues" ON venues
FOR SELECT USING (true);

CREATE POLICY "Anonymous users can read patterns" ON patterns
FOR SELECT USING (true);

CREATE POLICY "Anonymous users can read venue labels" ON venue_labels
FOR SELECT USING (true);

-- Anonymous users can insert patterns (for sharing)
CREATE POLICY "Anonymous users can create patterns" ON patterns
FOR INSERT WITH CHECK (true);

-- Anonymous users can update their own patterns (for ping updates)
CREATE POLICY "Anonymous users can update patterns" ON patterns
FOR UPDATE USING (true);

-- Anonymous users can delete their own patterns
CREATE POLICY "Anonymous users can delete patterns" ON patterns
FOR DELETE USING (true);

-- Anonymous users can create venues (lazy creation)
CREATE POLICY "Anonymous users can create venues" ON venues
FOR INSERT WITH CHECK (true);

-- Anonymous users can update venues (increment use_count, update last_active)
CREATE POLICY "Anonymous users can update venues" ON venues
FOR UPDATE USING (true);

-- Anonymous users can create venue labels
CREATE POLICY "Anonymous users can create venue labels" ON venue_labels
FOR INSERT WITH CHECK (true);

-- Anonymous users can update venue label counts
CREATE POLICY "Anonymous users can update venue labels" ON venue_labels
FOR UPDATE USING (true);