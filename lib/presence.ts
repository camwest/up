/**
 * Concert Finder Realtime Presence System
 * Manages venue-based presence channels for real-time pattern coordination
 */

import { RealtimeChannel } from '@supabase/supabase-js';
import { createClient } from './supabase/client';
import { Pattern } from './patterns';
import { Coordinates } from './location';
import { generateVenueId } from './venues';

// Presence state interface
export interface PatternPresence {
  pattern_id: string;
  pattern_data: Pattern;
  user_id: string; // temporary session ID
  approximate_location?: [number, number]; // [lat, lng] - privacy safe
  joined_at: number;
  last_seen: number;
}

// Venue channel state
export interface VenueChannelState {
  venue_id: string;
  active_patterns: Map<string, PatternPresence>;
  user_count: number;
  last_updated: number;
}

// Presence events
export type PresenceEventType = 'join' | 'leave' | 'sync';

export interface PresenceEvent {
  type: PresenceEventType;
  presence: PatternPresence[];
  venueId: string;
}

// Presence manager class
export class VenuePresenceManager {
  private channel: RealtimeChannel | null = null;
  private venueId: string | null = null;
  private userSessionId: string;
  private currentPresence: PatternPresence | null = null;
  private eventHandlers: Map<PresenceEventType, ((event: PresenceEvent) => void)[]> = new Map();
  
  constructor() {
    // Generate unique session ID for this browser session
    this.userSessionId = this.generateSessionId();
    
    // Initialize event handler maps
    this.eventHandlers.set('join', []);
    this.eventHandlers.set('leave', []);
    this.eventHandlers.set('sync', []);
  }

  /**
   * Join a venue presence channel
   */
  async joinVenue(
    coordinates: Coordinates, 
    pattern: Pattern, 
    patternId: string
  ): Promise<void> {
    // Leave current venue if connected
    if (this.channel) {
      await this.leaveVenue();
    }

    // Calculate venue ID from coordinates
    this.venueId = generateVenueId(coordinates);
    
    // Create presence data
    this.currentPresence = {
      pattern_id: patternId,
      pattern_data: pattern,
      user_id: this.userSessionId,
      approximate_location: [coordinates.latitude, coordinates.longitude],
      joined_at: Date.now(),
      last_seen: Date.now()
    };

    // Create and configure channel
    const supabase = createClient();
    this.channel = supabase.channel(`venue:${this.venueId}`, {
      config: { presence: { key: this.userSessionId } }
    });

    // Set up presence event handlers
    this.channel
      .on('presence', { event: 'sync' }, () => {
        this.handlePresenceSync();
      })
      .on('presence', { event: 'join' }, ({ newPresences }) => {
        this.handlePresenceJoin(newPresences as unknown as PatternPresence[]);
      })
      .on('presence', { event: 'leave' }, ({ leftPresences }) => {
        this.handlePresenceLeave(leftPresences as unknown as PatternPresence[]);
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          // Track our presence
          await this.channel?.track(this.currentPresence!);
        }
      });
  }

  /**
   * Leave current venue
   */
  async leaveVenue(): Promise<void> {
    if (this.channel) {
      await this.channel.untrack();
      await this.channel.unsubscribe();
      this.channel = null;
    }
    
    this.venueId = null;
    this.currentPresence = null;
  }

  /**
   * Update current pattern presence
   */
  async updatePattern(pattern: Pattern, patternId: string): Promise<void> {
    if (!this.currentPresence || !this.channel) {
      throw new Error('No active venue session');
    }

    this.currentPresence = {
      ...this.currentPresence,
      pattern_id: patternId,
      pattern_data: pattern,
      last_seen: Date.now()
    };

    await this.channel.track(this.currentPresence);
  }

  /**
   * Get current venue state
   */
  getVenueState(): VenueChannelState | null {
    if (!this.channel || !this.venueId) {
      return null;
    }

    const presenceState = this.channel.presenceState();
    const activePatterns = new Map<string, PatternPresence>();

    // Convert presence state to our format
    Object.values(presenceState).forEach((presences) => {
      (presences as unknown as PatternPresence[]).forEach((presence) => {
        activePatterns.set(presence.user_id, presence);
      });
    });

    return {
      venue_id: this.venueId,
      active_patterns: activePatterns,
      user_count: activePatterns.size,
      last_updated: Date.now()
    };
  }

  /**
   * Get other users' patterns (excluding current user)
   */
  getOtherPatterns(): PatternPresence[] {
    const state = this.getVenueState();
    if (!state) return [];

    return Array.from(state.active_patterns.values())
      .filter(presence => presence.user_id !== this.userSessionId);
  }

  /**
   * Check for pattern collisions
   */
  detectCollisions(currentPattern: Pattern): PatternPresence[] {
    const otherPatterns = this.getOtherPatterns();
    const collisions: PatternPresence[] = [];

    otherPatterns.forEach(presence => {
      if (this.patternsCollide(currentPattern, presence.pattern_data)) {
        collisions.push(presence);
      }
    });

    return collisions;
  }

  /**
   * Add event listener
   */
  on(event: PresenceEventType, handler: (event: PresenceEvent) => void): void {
    const handlers = this.eventHandlers.get(event);
    if (handlers) {
      handlers.push(handler);
    }
  }

  /**
   * Remove event listener
   */
  off(event: PresenceEventType, handler: (event: PresenceEvent) => void): void {
    const handlers = this.eventHandlers.get(event);
    if (handlers) {
      const index = handlers.indexOf(handler);
      if (index > -1) {
        handlers.splice(index, 1);
      }
    }
  }

  /**
   * Get current venue ID
   */
  getCurrentVenueId(): string | null {
    return this.venueId;
  }

  /**
   * Get connection status
   */
  isConnected(): boolean {
    return this.channel !== null && this.venueId !== null;
  }

  // Private methods
  private generateSessionId(): string {
    return `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private handlePresenceSync(): void {
    if (!this.venueId) return;

    const state = this.getVenueState();
    if (state) {
      this.emitEvent('sync', Array.from(state.active_patterns.values()));
    }
  }

  private handlePresenceJoin(newPresences: PatternPresence[]): void {
    if (!this.venueId) return;

    this.emitEvent('join', newPresences);
  }

  private handlePresenceLeave(leftPresences: PatternPresence[]): void {
    if (!this.venueId) return;

    this.emitEvent('leave', leftPresences);
  }

  private emitEvent(type: PresenceEventType, presences: PatternPresence[]): void {
    if (!this.venueId) return;

    const event: PresenceEvent = {
      type,
      presence: presences,
      venueId: this.venueId
    };

    const handlers = this.eventHandlers.get(type);
    if (handlers) {
      handlers.forEach(handler => handler(event));
    }
  }

  private patternsCollide(pattern1: Pattern, pattern2: Pattern): boolean {
    // Simple collision detection - can be enhanced later
    return (
      pattern1.primary === pattern2.primary &&
      pattern1.animation === pattern2.animation &&
      Math.abs(pattern1.speed - pattern2.speed) <= 1
    );
  }
}

// Singleton instance for global use
let globalPresenceManager: VenuePresenceManager | null = null;

/**
 * Get the global presence manager instance
 */
export function getPresenceManager(): VenuePresenceManager {
  if (!globalPresenceManager) {
    globalPresenceManager = new VenuePresenceManager();
  }
  return globalPresenceManager;
}

/**
 * Cleanup presence manager (useful for hot reload in development)
 */
export async function cleanupPresenceManager(): Promise<void> {
  if (globalPresenceManager) {
    await globalPresenceManager.leaveVenue();
    globalPresenceManager = null;
  }
}

// Utility functions for working with presence data

/**
 * Format presence for display
 */
export function formatPresenceForDisplay(presence: PatternPresence): {
  pattern_name: string;
  duration: string;
  distance?: string;
} {
  const duration = Math.round((Date.now() - presence.joined_at) / 1000 / 60); // minutes
  
  return {
    pattern_name: presence.pattern_id,
    duration: duration < 1 ? 'Just joined' : `${duration}m ago`,
    distance: presence.approximate_location ? 'Nearby' : undefined
  };
}

/**
 * Calculate venue activity level
 */
export function getVenueActivityLevel(userCount: number): 'quiet' | 'active' | 'busy' {
  if (userCount <= 2) return 'quiet';
  if (userCount <= 8) return 'active';
  return 'busy';
}

/**
 * Generate venue context message
 */
export function getVenueContextMessage(state: VenueChannelState): string {
  const otherUsers = Math.max(0, state.user_count - 1); // Exclude current user, but don't go negative
  
  if (otherUsers === 0) {
    return 'You\'re the first person here with a pattern';
  } else if (otherUsers === 1) {
    return '1 other person is here with a pattern';
  } else {
    return `${otherUsers} other people are here with patterns`;
  }
}

/**
 * Privacy-aware presence filtering
 */
export function filterPresenceForPrivacy(presences: PatternPresence[]): PatternPresence[] {
  return presences.map(presence => ({
    ...presence,
    // Remove precise location data for privacy
    approximate_location: undefined,
    user_id: 'user_' + presence.user_id.slice(-4) // Only show last 4 chars
  }));
}