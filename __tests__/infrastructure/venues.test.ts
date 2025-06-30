/**
 * Venue utilities test suite
 */

import { describe, it, expect } from 'bun:test';
import {
  generateVenueId,
  getVenueCoordinates,
  createVenueData,
  isValidVenueId,
  formatVenueForDisplay,
  generateVenueShareInfo,
  getVenueDistance,
  suggestVenueLabels,
  VenuePrivacy,
  VenueAPI
} from '../../lib/venues';

describe('Venue Utilities', () => {
  const testCoords = {
    latitude: 40.7589,
    longitude: -73.9851
  };

  const testCoords2 = {
    latitude: 40.7505,
    longitude: -73.9934
  };

  describe('Venue ID Generation', () => {
    it('should generate valid venue IDs', () => {
      const venueId = generateVenueId(testCoords);
      
      expect(typeof venueId).toBe('string');
      expect(venueId).toHaveLength(6);
      expect(isValidVenueId(venueId)).toBe(true);
    });

    it('should be consistent for same coordinates', () => {
      const venueId1 = generateVenueId(testCoords);
      const venueId2 = generateVenueId(testCoords);
      
      expect(venueId1).toBe(venueId2);
    });

    it('should throw for invalid coordinates', () => {
      expect(() => {
        generateVenueId({ latitude: 91, longitude: 0 });
      }).toThrow('Invalid coordinates');
    });
  });

  describe('Venue ID Validation', () => {
    it('should validate correct venue IDs', () => {
      expect(isValidVenueId('dr5ru7')).toBe(true);
      expect(isValidVenueId('9q8yy2')).toBe(true);
    });

    it('should reject invalid venue IDs', () => {
      expect(isValidVenueId('invalid')).toBe(false); // too long
      expect(isValidVenueId('abc')).toBe(false); // too short
      expect(isValidVenueId('123ABC')).toBe(false); // invalid chars
      expect(isValidVenueId('')).toBe(false); // empty
    });
  });

  describe('Coordinate Recovery', () => {
    it('should recover coordinates from venue ID', () => {
      const venueId = generateVenueId(testCoords);
      const recovered = getVenueCoordinates(venueId);
      
      expect(typeof recovered.latitude).toBe('number');
      expect(typeof recovered.longitude).toBe('number');
      expect(Math.abs(recovered.latitude - testCoords.latitude)).toBeLessThan(0.01);
      expect(Math.abs(recovered.longitude - testCoords.longitude)).toBeLessThan(0.01);
    });

    it('should throw for invalid venue IDs', () => {
      expect(() => {
        getVenueCoordinates('invalid');
      }).toThrow('Invalid venue ID');
    });
  });

  describe('Venue Data Creation', () => {
    it('should create valid venue data', () => {
      const venueData = createVenueData(testCoords, 'Test Venue');
      
      expect(venueData.id).toHaveLength(6);
      expect(venueData.label).toBe('Test Venue');
      expect(venueData.use_count).toBe(1);
      expect(typeof venueData.center).toBe('string');
      expect(venueData.center).toContain('POINT');
    });

    it('should handle missing label', () => {
      const venueData = createVenueData(testCoords);
      
      expect(venueData.label).toBeNull();
    });

    it('should trim labels', () => {
      const venueData = createVenueData(testCoords, '  Test Venue  ');
      
      expect(venueData.label).toBe('Test Venue');
    });
  });

  describe('Distance Calculations', () => {
    it('should calculate distance between venue and coordinates', () => {
      const venueId = generateVenueId(testCoords);
      const distance = getVenueDistance(venueId, testCoords2);
      
      expect(distance).toBeGreaterThan(0);
      expect(distance).toBeLessThan(2000); // Less than 2km for test points
    });
  });

  describe('Display Formatting', () => {
    it('should format venue for display', () => {
      const mockVenue = {
        id: 'dr5ru7',
        label: 'Test Concert Hall',
        center: null,
        use_count: 25,
        created_at: '2024-01-01T00:00:00Z',
        last_active: '2024-01-01T00:00:00Z'
      };

      const formatted = formatVenueForDisplay(mockVenue);
      
      expect(formatted.id).toBe('dr5ru7');
      expect(formatted.display_name).toBe('Test Concert Hall');
      expect(formatted.activity_level).toBe('medium');
      expect(formatted.approximate_location).toMatch(/\d+\.\d{3}, -?\d+\.\d{3}/);
    });

    it('should handle venue without label', () => {
      const mockVenue = {
        id: 'dr5ru7',
        label: null,
        center: null,
        use_count: 5,
        created_at: '2024-01-01T00:00:00Z',
        last_active: '2024-01-01T00:00:00Z'
      };

      const formatted = formatVenueForDisplay(mockVenue);
      
      expect(formatted.display_name).toBe('Venue DR5RU7');
      expect(formatted.activity_level).toBe('low');
    });

    it('should determine activity levels correctly', () => {
      const lowActivity = {
        id: 'dr5ru7', label: null, center: null, use_count: 5,
        created_at: '2024-01-01T00:00:00Z', last_active: '2024-01-01T00:00:00Z'
      };
      const mediumActivity = { ...lowActivity, use_count: 25 };
      const highActivity = { ...lowActivity, use_count: 75 };

      expect(formatVenueForDisplay(lowActivity).activity_level).toBe('low');
      expect(formatVenueForDisplay(mediumActivity).activity_level).toBe('medium');
      expect(formatVenueForDisplay(highActivity).activity_level).toBe('high');
    });
  });

  describe('Share Information', () => {
    it('should generate share info with label', () => {
      const mockVenue = {
        id: 'dr5ru7',
        label: 'Madison Square Garden',
        center: null,
        use_count: 25,
        created_at: '2024-01-01T00:00:00Z',
        last_active: '2024-01-01T00:00:00Z'
      };

      const shareInfo = generateVenueShareInfo(mockVenue);
      
      expect(shareInfo.venue_name).toBe('Madison Square Garden');
      expect(shareInfo.join_message).toContain('Madison Square Garden');
      expect(shareInfo.approximate_area).toMatch(/\d+\.\d{2}, -?\d+\.\d{2}/);
    });

    it('should generate share info without label', () => {
      const mockVenue = {
        id: 'dr5ru7',
        label: null,
        center: null,
        use_count: 25,
        created_at: '2024-01-01T00:00:00Z',
        last_active: '2024-01-01T00:00:00Z'
      };

      const shareInfo = generateVenueShareInfo(mockVenue);
      
      expect(shareInfo.venue_name).toBe('Area DR5RU7');
      expect(shareInfo.join_message).toContain('DR5RU7');
    });
  });

  describe('Suggestions', () => {
    it('should suggest venue labels', () => {
      const suggestions = suggestVenueLabels();
      
      expect(Array.isArray(suggestions)).toBe(true);
      expect(suggestions.length).toBeGreaterThan(0);
      expect(suggestions).toContain('Concert Hall');
      expect(suggestions).toContain('Stadium');
    });
  });

  describe('Privacy Utilities', () => {
    it('should indicate venues are privacy-safe', () => {
      expect(VenuePrivacy.isLocationSensitive()).toBe(false);
      expect(VenuePrivacy.isShareable()).toBe(true);
    });

    it('should provide privacy-safe descriptions', () => {
      const mockVenue = {
        id: 'dr5ru7abc', // longer than expected
        label: 'Test Venue',
        center: null,
        use_count: 25,
        created_at: '2024-01-01T00:00:00Z',
        last_active: '2024-01-01T00:00:00Z'
      };

      const description = VenuePrivacy.getPrivacyDescription(mockVenue);
      expect(description).toBe('Test Venue');

      const mockVenueNoLabel = { ...mockVenue, label: null };
      const descriptionNoLabel = VenuePrivacy.getPrivacyDescription(mockVenueNoLabel);
      expect(descriptionNoLabel).toContain('DR5R'); // First 4 chars
    });
  });

  describe('API Utilities', () => {
    it('should build correct venue URLs', () => {
      const url = VenueAPI.buildVenueUrl('dr5ru7');
      expect(url).toBe('/api/venues/dr5ru7');
    });

    it('should prepare creation requests', () => {
      const payload = {
        coordinates: testCoords,
        label: 'Test Venue',
        pattern_data: {
          primary: 'FF008C',
          animation: 'pulse' as const,
          speed: 3
        }
      };

      const request = VenueAPI.prepareCreateRequest(payload);
      
      expect(request.method).toBe('POST');
      expect(request.url).toContain('/api/venues/');
      expect(request.headers['Content-Type']).toBe('application/json');
      
      const body = JSON.parse(request.body);
      expect(body.coordinates).toEqual(testCoords);
      expect(body.label).toBe('Test Venue');
      expect(body.pattern_data).toEqual(payload.pattern_data);
    });
  });
});