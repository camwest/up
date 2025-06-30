/**
 * Concert Finder Location & Geohashing Utilities
 * Handles browser geolocation with privacy-first design
 */

import { encode, decode } from 'ngeohash';

// Standard coordinate interface
export interface Coordinates {
  latitude: number;
  longitude: number;
  accuracy?: number;
  timestamp?: number;
}

// Geolocation error types
export type LocationError = 
  | 'permission_denied'
  | 'position_unavailable' 
  | 'timeout'
  | 'not_supported'
  | 'unknown';

export interface LocationResult {
  success: boolean;
  coordinates?: Coordinates;
  error?: LocationError;
  message?: string;
}

// Venue precision: geohash6 provides ~600m precision
const VENUE_GEOHASH_PRECISION = 6;

// Location request timeout (10 seconds)
const LOCATION_TIMEOUT = 10000;

/**
 * Request user's current location with graceful error handling
 */
export async function requestLocation(options: {
  enableHighAccuracy?: boolean;
  timeout?: number;
  maximumAge?: number;
} = {}): Promise<LocationResult> {
  // Check if geolocation is supported
  if (!navigator.geolocation) {
    return {
      success: false,
      error: 'not_supported',
      message: 'Geolocation is not supported by this browser'
    };
  }

  const {
    enableHighAccuracy = true,
    timeout = LOCATION_TIMEOUT,
    maximumAge = 300000 // 5 minutes
  } = options;

  return new Promise((resolve) => {
    const timeoutId = setTimeout(() => {
      resolve({
        success: false,
        error: 'timeout',
        message: 'Location request timed out'
      });
    }, timeout);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        clearTimeout(timeoutId);
        resolve({
          success: true,
          coordinates: {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
            timestamp: position.timestamp
          }
        });
      },
      (error) => {
        clearTimeout(timeoutId);
        
        let errorType: LocationError;
        let message: string;
        
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorType = 'permission_denied';
            message = 'Location access denied by user';
            break;
          case error.POSITION_UNAVAILABLE:
            errorType = 'position_unavailable';
            message = 'Location information unavailable';
            break;
          case error.TIMEOUT:
            errorType = 'timeout';
            message = 'Location request timed out';
            break;
          default:
            errorType = 'unknown';
            message = error.message || 'Unknown location error';
        }
        
        resolve({
          success: false,
          error: errorType,
          message
        });
      },
      {
        enableHighAccuracy,
        timeout,
        maximumAge
      }
    );
  });
}

/**
 * Convert coordinates to venue geohash (6 chars ~600m precision)
 */
export function coordinatesToVenueId(coordinates: Coordinates): string {
  return encode(coordinates.latitude, coordinates.longitude, VENUE_GEOHASH_PRECISION);
}

/**
 * Convert venue geohash back to approximate coordinates
 */
export function venueIdToCoordinates(venueId: string): Coordinates {
  const decoded = decode(venueId);
  return {
    latitude: decoded.latitude,
    longitude: decoded.longitude
  };
}

/**
 * Get venue geohash bounds (for geographic queries)
 */
export function getVenueBounds(venueId: string): {
  north: number;
  south: number;
  east: number;
  west: number;
} {
  const decoded = decode(venueId);
  return {
    north: decoded.latitude,
    south: decoded.latitude,
    east: decoded.longitude,
    west: decoded.longitude
  };
}

/**
 * Calculate distance between two coordinates (Haversine formula)
 * Returns distance in meters
 */
export function calculateDistance(coord1: Coordinates, coord2: Coordinates): number {
  const R = 6371000; // Earth's radius in meters
  const φ1 = coord1.latitude * Math.PI / 180;
  const φ2 = coord2.latitude * Math.PI / 180;
  const Δφ = (coord2.latitude - coord1.latitude) * Math.PI / 180;
  const Δλ = (coord2.longitude - coord1.longitude) * Math.PI / 180;

  const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ/2) * Math.sin(Δλ/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

  return R * c;
}

/**
 * Validate coordinates are within reasonable bounds
 */
export function validateCoordinates(coordinates: Coordinates): boolean {
  const { latitude, longitude } = coordinates;
  
  return (
    latitude >= -90 && latitude <= 90 &&
    longitude >= -180 && longitude <= 180 &&
    !isNaN(latitude) && !isNaN(longitude)
  );
}

/**
 * Get nearby venue IDs within a radius (approximate)
 * Returns array of geohash6 venue IDs
 */
export function getNearbyVenueIds(coordinates: Coordinates, radiusMeters: number = 1000): string[] {
  if (!validateCoordinates(coordinates)) {
    return [];
  }

  const centerVenueId = coordinatesToVenueId(coordinates);
  const venueIds = new Set([centerVenueId]);
  
  // Calculate approximate coordinate offsets for the radius
  const latOffset = radiusMeters / 111000; // ~111km per degree of latitude
  const lngOffset = radiusMeters / (111000 * Math.cos(coordinates.latitude * Math.PI / 180));
  
  // Generate neighboring venue IDs in a grid pattern
  for (let latStep = -1; latStep <= 1; latStep++) {
    for (let lngStep = -1; lngStep <= 1; lngStep++) {
      const neighborCoords = {
        latitude: coordinates.latitude + (latStep * latOffset),
        longitude: coordinates.longitude + (lngStep * lngOffset)
      };
      
      if (validateCoordinates(neighborCoords)) {
        venueIds.add(coordinatesToVenueId(neighborCoords));
      }
    }
  }
  
  return Array.from(venueIds);
}

/**
 * Format coordinates for display (privacy-aware)
 */
export function formatCoordinatesForDisplay(coordinates: Coordinates, precision: number = 3): string {
  return `${coordinates.latitude.toFixed(precision)}, ${coordinates.longitude.toFixed(precision)}`;
}

/**
 * Check if user has likely granted location permission before
 */
export function hasLikelyLocationPermission(): boolean {
  if (!navigator.geolocation) return false;
  
  // Check if we have cached location data
  try {
    const cached = localStorage.getItem('cf_last_location_success');
    if (cached) {
      const timestamp = parseInt(cached, 10);
      const oneHourAgo = Date.now() - 3600000;
      return timestamp > oneHourAgo;
    }
  } catch {
    // localStorage not available
  }
  
  return false;
}

/**
 * Cache successful location request (for permission inference)
 */
export function cacheLocationSuccess(): void {
  try {
    localStorage.setItem('cf_last_location_success', Date.now().toString());
  } catch {
    // localStorage not available, continue silently
  }
}

/**
 * Clear location cache
 */
export function clearLocationCache(): void {
  try {
    localStorage.removeItem('cf_last_location_success');
  } catch {
    // localStorage not available, continue silently
  }
}

/**
 * Get user-friendly error message for location errors
 */
export function getLocationErrorMessage(error: LocationError): string {
  switch (error) {
    case 'permission_denied':
      return 'Location access was denied. Venue features are disabled, but patterns still work normally.';
    case 'position_unavailable':
      return 'Could not determine your location. Check your connection and GPS settings.';
    case 'timeout':
      return 'Location request timed out. You can try again or continue without venue features.';
    case 'not_supported':
      return 'Your browser does not support location services.';
    default:
      return 'Could not access your location. Patterns work without location.';
  }
}

/**
 * Privacy-focused location utilities for manual entry
 */
export interface ManualLocationEntry {
  venueName?: string;
  city?: string;
  coordinates?: Coordinates;
}

/**
 * Parse manual location entry (for privacy-conscious users)
 */
export function parseManualLocation(input: string): ManualLocationEntry | null {
  const trimmed = input.trim();
  
  // Try to parse coordinates (lat, lng)
  const coordMatch = trimmed.match(/^(-?\d+\.?\d*),\s*(-?\d+\.?\d*)$/);
  if (coordMatch) {
    const lat = parseFloat(coordMatch[1]);
    const lng = parseFloat(coordMatch[2]);
    
    if (validateCoordinates({ latitude: lat, longitude: lng })) {
      return {
        coordinates: { latitude: lat, longitude: lng }
      };
    }
  }
  
  // Treat as venue/city name
  return {
    venueName: trimmed.length > 0 ? trimmed : undefined
  };
}