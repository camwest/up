/**
 * Location utilities test suite
 */

import { describe, it, expect } from 'bun:test';
import {
  coordinatesToVenueId,
  venueIdToCoordinates,
  validateCoordinates,
  calculateDistance,
  getNearbyVenueIds,
  formatCoordinatesForDisplay,
  parseManualLocation,
  getLocationErrorMessage
} from '../../lib/location';

describe('Location Utilities', () => {
  const testCoords = {
    latitude: 40.7589, // NYC Times Square
    longitude: -73.9851
  };

  const testCoords2 = {
    latitude: 40.7505, // NYC nearby location
    longitude: -73.9934
  };

  describe('Geohash Generation', () => {
    it('should generate consistent venue IDs from coordinates', () => {
      const venueId1 = coordinatesToVenueId(testCoords);
      const venueId2 = coordinatesToVenueId(testCoords);
      
      expect(venueId1).toBe(venueId2);
      expect(venueId1).toHaveLength(6);
    });

    it('should generate different venue IDs for different locations', () => {
      const venueId1 = coordinatesToVenueId(testCoords);
      const venueId2 = coordinatesToVenueId(testCoords2);
      
      expect(venueId1).not.toBe(venueId2);
    });

    it('should use valid geohash characters only', () => {
      const venueId = coordinatesToVenueId(testCoords);
      const validChars = /^[0-9bcdefghjkmnpqrstuvwxyz]+$/i;
      
      expect(venueId).toMatch(validChars);
    });
  });

  describe('Coordinate Recovery', () => {
    it('should recover approximate coordinates from venue ID', () => {
      const venueId = coordinatesToVenueId(testCoords);
      const recovered = venueIdToCoordinates(venueId);
      
      // Should be close but not exact due to geohash precision
      expect(Math.abs(recovered.latitude - testCoords.latitude)).toBeLessThan(0.01);
      expect(Math.abs(recovered.longitude - testCoords.longitude)).toBeLessThan(0.01);
    });
  });

  describe('Coordinate Validation', () => {
    it('should validate correct coordinates', () => {
      expect(validateCoordinates(testCoords)).toBe(true);
      expect(validateCoordinates({ latitude: 0, longitude: 0 })).toBe(true);
      expect(validateCoordinates({ latitude: 90, longitude: 180 })).toBe(true);
      expect(validateCoordinates({ latitude: -90, longitude: -180 })).toBe(true);
    });

    it('should reject invalid coordinates', () => {
      expect(validateCoordinates({ latitude: 91, longitude: 0 })).toBe(false);
      expect(validateCoordinates({ latitude: 0, longitude: 181 })).toBe(false);
      expect(validateCoordinates({ latitude: -91, longitude: 0 })).toBe(false);
      expect(validateCoordinates({ latitude: 0, longitude: -181 })).toBe(false);
      expect(validateCoordinates({ latitude: NaN, longitude: 0 })).toBe(false);
      expect(validateCoordinates({ latitude: 0, longitude: NaN })).toBe(false);
    });
  });

  describe('Distance Calculations', () => {
    it('should calculate distance between coordinates', () => {
      const distance = calculateDistance(testCoords, testCoords2);
      
      expect(distance).toBeGreaterThan(0);
      expect(distance).toBeLessThan(2000); // Should be less than 2km for NYC test points
    });

    it('should return 0 for identical coordinates', () => {
      const distance = calculateDistance(testCoords, testCoords);
      
      expect(distance).toBeCloseTo(0, 1);
    });
  });

  describe('Nearby Venue IDs', () => {
    it('should return array of venue IDs including center', () => {
      const nearbyIds = getNearbyVenueIds(testCoords);
      const centerVenueId = coordinatesToVenueId(testCoords);
      
      expect(nearbyIds).toContain(centerVenueId);
      expect(nearbyIds.length).toBeGreaterThan(1);
    });

    it('should return empty array for invalid coordinates', () => {
      const nearbyIds = getNearbyVenueIds({ latitude: 91, longitude: 0 });
      
      expect(nearbyIds).toEqual([]);
    });
  });

  describe('Display Formatting', () => {
    it('should format coordinates for display', () => {
      const formatted = formatCoordinatesForDisplay(testCoords, 2);
      
      expect(formatted).toBe('40.76, -73.99');
    });

    it('should use default precision', () => {
      const formatted = formatCoordinatesForDisplay(testCoords);
      
      expect(formatted).toMatch(/^\d+\.\d{3}, -\d+\.\d{3}$/);
    });
  });

  describe('Manual Location Parsing', () => {
    it('should parse coordinate strings', () => {
      const result = parseManualLocation('40.7589, -73.9851');
      
      expect(result?.coordinates?.latitude).toBeCloseTo(40.7589);
      expect(result?.coordinates?.longitude).toBeCloseTo(-73.9851);
    });

    it('should parse venue names', () => {
      const result = parseManualLocation('Madison Square Garden');
      
      expect(result?.venueName).toBe('Madison Square Garden');
      expect(result?.coordinates).toBeUndefined();
    });

    it('should handle empty input', () => {
      const result = parseManualLocation('   ');
      
      expect(result?.venueName).toBeUndefined();
    });
  });

  describe('Error Messages', () => {
    it('should provide user-friendly error messages', () => {
      expect(getLocationErrorMessage('permission_denied')).toContain('denied');
      expect(getLocationErrorMessage('timeout')).toContain('timed out');
      expect(getLocationErrorMessage('not_supported')).toContain('not support');
      expect(getLocationErrorMessage('unknown')).toContain('work without location');
    });
  });
});