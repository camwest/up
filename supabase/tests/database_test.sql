-- Basic database tests for Concert Finder schema

BEGIN;
SELECT plan(6);

-- Test that tables exist
SELECT has_table('public', 'venues', 'venues table should exist');
SELECT has_table('public', 'patterns', 'patterns table should exist'); 
SELECT has_table('public', 'venue_labels', 'venue_labels table should exist');

-- Test that PostGIS extension is loaded
SELECT has_extension('postgis', 'PostGIS extension should be available');

-- Test basic venue insertion
INSERT INTO venues (id, label, center) VALUES 
  ('test123', 'Test Venue', ST_GeogFromText('POINT(-122.4194 37.7749)'));

SELECT is(
  (SELECT COUNT(*)::int FROM venues WHERE id = 'test123'),
  1,
  'Should be able to insert venue with geographic point'
);

-- Test basic pattern insertion
INSERT INTO patterns (venue_id, pattern, location) VALUES 
  ('test123', '{"color": "red", "animation": "pulse"}', ST_GeogFromText('POINT(-122.4194 37.7749)'));

SELECT is(
  (SELECT COUNT(*)::int FROM patterns WHERE venue_id = 'test123'),
  1,
  'Should be able to insert pattern with venue reference'
);

SELECT * FROM finish();
ROLLBACK;