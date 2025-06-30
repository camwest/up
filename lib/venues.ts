/**
 * Concert Finder Venue Management
 * Handles venue creation, lookup, and metadata with privacy-first design
 */

import { coordinatesToVenueId, venueIdToCoordinates, validateCoordinates, type Coordinates } from './location';
import { Tables, TablesInsert, TablesUpdate } from './database.types';
import { Pattern } from './patterns';

// Use database-generated types
export type Venue = Tables<'venues'>;
export type VenueInsert = TablesInsert<'venues'>;
export type VenueUpdate = TablesUpdate<'venues'>;
export type VenueLabel = Tables<'venue_labels'>;
export type PatternRow = Tables<'patterns'>;

export interface VenueMetadata {
  id: string;
  approximate_location: Coordinates;
  popular_labels: string[];
  active_count: number;
  last_activity: Date;
}

/**
 * Generate venue ID from coordinates
 */
export function generateVenueId(coordinates: Coordinates): string {
  if (!validateCoordinates(coordinates)) {
    throw new Error('Invalid coordinates provided');
  }
  return coordinatesToVenueId(coordinates);
}

/**
 * Get approximate coordinates from venue ID
 */
export function getVenueCoordinates(venueId: string): Coordinates {
  if (!venueId || venueId.length !== 6) {
    throw new Error('Invalid venue ID format');
  }
  return venueIdToCoordinates(venueId);
}

/**
 * Create venue data for database insertion
 */
export function createVenueData(coordinates: Coordinates, label?: string): VenueInsert {
  if (!validateCoordinates(coordinates)) {
    throw new Error('Invalid coordinates for venue creation');
  }

  const venueId = generateVenueId(coordinates);
  
  return {
    id: venueId,
    label: label?.trim() || null,
    center: `POINT(${coordinates.longitude} ${coordinates.latitude})` as unknown as never, // PostGIS POINT format
    use_count: 1
  };
}

/**
 * Validate venue ID format
 */
export function isValidVenueId(venueId: string): boolean {
  // Geohash6 should be exactly 6 characters, base32 alphabet
  const geohashPattern = /^[0-9bcdefghjkmnpqrstuvwxyz]{6}$/i;
  return geohashPattern.test(venueId);
}

/**
 * Create venue creation payload for API
 */
export interface CreateVenuePayload {
  coordinates: Coordinates;
  label?: string;
  pattern_data?: Pattern; // Pattern that's being created at this venue
}

/**
 * Venue API response interfaces
 */
export interface VenueResponse {
  venue: Venue;
  metadata: {
    active_patterns: number;
    recent_labels: string[];
    is_new: boolean;
  };
}

export interface VenueError {
  error: string;
  message: string;
  code?: string;
}

/**
 * Format venue for display purposes
 */
export function formatVenueForDisplay(venue: Venue): {
  id: string;
  display_name: string;
  approximate_location: string;
  activity_level: 'low' | 'medium' | 'high';
} {
  const coords = getVenueCoordinates(venue.id);
  
  // Determine activity level based on use_count
  const useCount = venue.use_count || 0;
  const activity_level: 'low' | 'medium' | 'high' = 
    useCount > 50 ? 'high' : useCount > 10 ? 'medium' : 'low';
  
  return {
    id: venue.id,
    display_name: venue.label || `Venue ${venue.id.toUpperCase()}`,
    approximate_location: `${coords.latitude.toFixed(3)}, ${coords.longitude.toFixed(3)}`,
    activity_level
  };
}

/**
 * Generate shareable venue information
 */
export function generateVenueShareInfo(venue: Venue): {
  venue_name: string;
  approximate_area: string;
  join_message: string;
} {
  const coords = getVenueCoordinates(venue.id);
  const venueName = venue.label || `Area ${venue.id.toUpperCase()}`;
  
  return {
    venue_name: venueName,
    approximate_area: `${coords.latitude.toFixed(2)}, ${coords.longitude.toFixed(2)}`,
    join_message: venue.label 
      ? `Join patterns at ${venue.label}`
      : `Join patterns in area ${venue.id.toUpperCase()}`
  };
}

/**
 * Privacy-aware venue distance calculation
 */
export function getVenueDistance(venueId: string, userCoordinates: Coordinates): number {
  const venueCoords = getVenueCoordinates(venueId);
  
  // Simple Haversine distance
  const R = 6371000; // Earth's radius in meters
  const φ1 = userCoordinates.latitude * Math.PI / 180;
  const φ2 = venueCoords.latitude * Math.PI / 180;
  const Δφ = (venueCoords.latitude - userCoordinates.latitude) * Math.PI / 180;
  const Δλ = (venueCoords.longitude - userCoordinates.longitude) * Math.PI / 180;

  const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ/2) * Math.sin(Δλ/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

  return R * c;
}

/**
 * Suggest venue labels based on common patterns
 */
export function suggestVenueLabels(): string[] {
  // This could be enhanced with reverse geocoding in the future
  const suggestions = [
    'Concert Hall',
    'Stadium',
    'Arena',
    'Festival Grounds',
    'Club',
    'Theater',
    'Park',
    'Convention Center'
  ];
  
  return suggestions;
}

/**
 * Venue privacy helpers
 */
export const VenuePrivacy = {
  /**
   * Check if venue ID reveals sensitive location data
   */
  isLocationSensitive(): boolean {
    // All venue IDs are designed to be privacy-safe (600m precision)
    return false;
  },

  /**
   * Get privacy-safe venue description
   */
  getPrivacyDescription(venue: Venue): string {
    if (venue.label) {
      return venue.label;
    }
    
    // Generic area description without exact coordinates
    return `Area ${venue.id.substring(0, 4).toUpperCase()}`;
  },

  /**
   * Check if venue can be shared publicly
   */
  isShareable(): boolean {
    // All venues are shareable by design (anonymized locations)
    return true;
  }
};

/**
 * Venue caching utilities for performance
 */
export const VenueCache = {
  /**
   * Cache venue data locally
   */
  setVenue(venueId: string, venue: Venue): void {
    try {
      const cacheKey = `cf_venue_${venueId}`;
      const cacheData = {
        venue,
        timestamp: Date.now(),
        expires: Date.now() + 300000 // 5 minutes
      };
      localStorage.setItem(cacheKey, JSON.stringify(cacheData));
    } catch {
      // localStorage not available
    }
  },

  /**
   * Get cached venue data
   */
  getVenue(venueId: string): Venue | null {
    try {
      const cacheKey = `cf_venue_${venueId}`;
      const cached = localStorage.getItem(cacheKey);
      
      if (cached) {
        const cacheData = JSON.parse(cached);
        if (Date.now() < cacheData.expires) {
          return cacheData.venue;
        }
        // Expired, remove it
        localStorage.removeItem(cacheKey);
      }
    } catch {
      // localStorage error or invalid JSON
    }
    
    return null;
  },

  /**
   * Clear venue cache
   */
  clearAll(): void {
    try {
      const keys = Object.keys(localStorage);
      keys.forEach(key => {
        if (key.startsWith('cf_venue_')) {
          localStorage.removeItem(key);
        }
      });
    } catch {
      // localStorage not available
    }
  }
};

/**
 * Venue API client utilities
 */
export const VenueAPI = {
  /**
   * Build venue API URL
   */
  buildVenueUrl(venueId: string): string {
    return `/api/venues/${encodeURIComponent(venueId)}`;
  },

  /**
   * Prepare venue creation request
   */
  prepareCreateRequest(payload: CreateVenuePayload): {
    url: string;
    method: string;
    body: string;
    headers: Record<string, string>;
  } {
    return {
      url: `/api/venues/${generateVenueId(payload.coordinates)}`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        coordinates: payload.coordinates,
        label: payload.label,
        pattern_data: payload.pattern_data
      })
    };
  }
};