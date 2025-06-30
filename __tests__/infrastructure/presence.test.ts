/**
 * Presence utilities test suite
 */

import { describe, it, expect } from 'bun:test';
import {
  formatPresenceForDisplay,
  getVenueActivityLevel,
  getVenueContextMessage,
  filterPresenceForPrivacy,
  type PatternPresence,
  type VenueChannelState
} from '../../lib/presence';

describe('Presence Utilities', () => {
  const mockPresence: PatternPresence = {
    pattern_id: 'NEON-PULSE-42',
    pattern_data: {
      primary: 'FF008C',
      animation: 'pulse',
      speed: 3
    },
    user_id: 'user_12345',
    approximate_location: [40.7589, -73.9851],
    joined_at: Date.now() - 300000, // 5 minutes ago
    last_seen: Date.now() - 60000 // 1 minute ago
  };

  const mockVenueState: VenueChannelState = {
    venue_id: 'dr5ru7',
    active_patterns: new Map([
      ['user_1', mockPresence],
      ['user_2', { ...mockPresence, user_id: 'user_2', pattern_id: 'CYAN-WAVE-15' }],
      ['user_3', { ...mockPresence, user_id: 'user_3', pattern_id: 'LIME-STROBE-88' }]
    ]),
    user_count: 3,
    last_updated: Date.now()
  };

  describe('Presence Display Formatting', () => {
    it('should format recent presence correctly', () => {
      const recentPresence = {
        ...mockPresence,
        joined_at: Date.now() - 10000 // 10 seconds ago
      };

      const formatted = formatPresenceForDisplay(recentPresence);
      
      expect(formatted.pattern_name).toBe('NEON-PULSE-42');
      expect(formatted.duration).toBe('Just joined');
      expect(formatted.distance).toBe('Nearby');
    });

    it('should format older presence correctly', () => {
      const formatted = formatPresenceForDisplay(mockPresence);
      
      expect(formatted.pattern_name).toBe('NEON-PULSE-42');
      expect(formatted.duration).toBe('5m ago');
      expect(formatted.distance).toBe('Nearby');
    });

    it('should handle presence without location', () => {
      const presenceNoLocation = {
        ...mockPresence,
        approximate_location: undefined
      };

      const formatted = formatPresenceForDisplay(presenceNoLocation);
      
      expect(formatted.distance).toBeUndefined();
    });
  });

  describe('Activity Level Calculation', () => {
    it('should classify quiet venues', () => {
      expect(getVenueActivityLevel(1)).toBe('quiet');
      expect(getVenueActivityLevel(2)).toBe('quiet');
    });

    it('should classify active venues', () => {
      expect(getVenueActivityLevel(3)).toBe('active');
      expect(getVenueActivityLevel(8)).toBe('active');
    });

    it('should classify busy venues', () => {
      expect(getVenueActivityLevel(9)).toBe('busy');
      expect(getVenueActivityLevel(50)).toBe('busy');
    });
  });

  describe('Venue Context Messages', () => {
    it('should handle single user correctly', () => {
      const singleUserState = {
        ...mockVenueState,
        user_count: 1
      };

      const message = getVenueContextMessage(singleUserState);
      expect(message).toBe('You\'re the first person here with a pattern');
    });

    it('should handle two users correctly', () => {
      const twoUserState = {
        ...mockVenueState,
        user_count: 2
      };

      const message = getVenueContextMessage(twoUserState);
      expect(message).toBe('1 other person is here with a pattern');
    });

    it('should handle multiple users correctly', () => {
      const message = getVenueContextMessage(mockVenueState);
      expect(message).toBe('2 other people are here with patterns');
    });

    it('should handle large groups correctly', () => {
      const largeGroupState = {
        ...mockVenueState,
        user_count: 15
      };

      const message = getVenueContextMessage(largeGroupState);
      expect(message).toBe('14 other people are here with patterns');
    });
  });

  describe('Privacy Filtering', () => {
    it('should filter presence data for privacy', () => {
      const presences = [mockPresence];
      const filtered = filterPresenceForPrivacy(presences);
      
      expect(filtered[0].approximate_location).toBeUndefined();
      expect(filtered[0].user_id).toBe('user_2345'); // Last 4 chars only
      expect(filtered[0].pattern_id).toBe('NEON-PULSE-42'); // Pattern ID preserved
    });

    it('should handle multiple presences', () => {
      const presences = [
        mockPresence,
        { ...mockPresence, user_id: 'user_67890' }
      ];
      const filtered = filterPresenceForPrivacy(presences);
      
      expect(filtered).toHaveLength(2);
      expect(filtered[0].user_id).toBe('user_2345');
      expect(filtered[1].user_id).toBe('user_7890');
    });

    it('should preserve all non-sensitive data', () => {
      const filtered = filterPresenceForPrivacy([mockPresence]);
      
      expect(filtered[0].pattern_id).toBe(mockPresence.pattern_id);
      expect(filtered[0].pattern_data).toEqual(mockPresence.pattern_data);
      expect(filtered[0].joined_at).toBe(mockPresence.joined_at);
      expect(filtered[0].last_seen).toBe(mockPresence.last_seen);
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty presence arrays', () => {
      const filtered = filterPresenceForPrivacy([]);
      expect(filtered).toEqual([]);
    });

    it('should handle short user IDs', () => {
      const shortIdPresence = {
        ...mockPresence,
        user_id: 'abc'
      };

      const filtered = filterPresenceForPrivacy([shortIdPresence]);
      expect(filtered[0].user_id).toBe('user_abc'); // Handles short IDs gracefully
    });

    it('should handle zero user count', () => {
      const emptyState = {
        ...mockVenueState,
        user_count: 0
      };

      const message = getVenueContextMessage(emptyState);
      expect(message).toBe('You\'re the first person here with a pattern');
    });
  });
});