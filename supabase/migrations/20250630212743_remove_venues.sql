-- Remove venue system from Concert Finder
-- This migration drops all venue-related tables and their dependencies

-- Drop RLS policies first
DROP POLICY IF EXISTS "Anonymous users can create patterns" ON public.patterns;
DROP POLICY IF EXISTS "Anonymous users can delete patterns" ON public.patterns;
DROP POLICY IF EXISTS "Anonymous users can read patterns" ON public.patterns;
DROP POLICY IF EXISTS "Anonymous users can update patterns" ON public.patterns;
DROP POLICY IF EXISTS "Anonymous users can create venue labels" ON public.venue_labels;
DROP POLICY IF EXISTS "Anonymous users can read venue labels" ON public.venue_labels;
DROP POLICY IF EXISTS "Anonymous users can update venue labels" ON public.venue_labels;
DROP POLICY IF EXISTS "Anonymous users can create venues" ON public.venues;
DROP POLICY IF EXISTS "Anonymous users can read venues" ON public.venues;
DROP POLICY IF EXISTS "Anonymous users can update venues" ON public.venues;

-- Drop tables in reverse dependency order (child tables first)
DROP TABLE IF EXISTS public.patterns CASCADE;
DROP TABLE IF EXISTS public.venue_labels CASCADE;
DROP TABLE IF EXISTS public.venues CASCADE;

-- Drop PostGIS extension if no longer needed
-- Note: This will also remove spatial_ref_sys table and related permissions
DROP EXTENSION IF EXISTS postgis CASCADE;