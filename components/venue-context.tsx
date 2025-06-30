"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPin, Users, Eye, EyeOff, AlertCircle } from "lucide-react";
import { requestLocation, getLocationErrorMessage, type Coordinates, type LocationResult } from "@/lib/location";
import { getPresenceManager, type PatternPresence, type VenueChannelState } from "@/lib/presence";
import { VenueAPI } from "@/lib/venues";
import { type Pattern } from "@/lib/patterns";

interface VenueContextProps {
  /** The current pattern being displayed */
  pattern?: Pattern;
  /** The pattern ID/name */
  patternId?: string;
  /** Called when venue state changes */
  onVenueStateChange?: (state: VenueChannelState | null) => void;
  /** Called when collision status changes */
  onCollisionChange?: (collisions: PatternPresence[]) => void;
  /** Custom class name */
  className?: string;
}

export function VenueContext({ 
  pattern, 
  patternId, 
  onVenueStateChange, 
  onCollisionChange,
  className 
}: VenueContextProps) {
  const [locationState, setLocationState] = useState<'idle' | 'requesting' | 'granted' | 'denied' | 'error'>('idle');
  const [venueState, setVenueState] = useState<VenueChannelState | null>(null);
  const [otherPatterns, setOtherPatterns] = useState<PatternPresence[]>([]);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [showVenueDetails, setShowVenueDetails] = useState(false);
  const presenceManagerRef = useRef(getPresenceManager());

  // Request location access
  const requestLocationAccess = async () => {
    setLocationState('requesting');
    setLocationError(null);
    
    try {
      const locationResult: LocationResult = await requestLocation({
        enableHighAccuracy: false,
        timeout: 10000,
        maximumAge: 300000
      });
      
      if (locationResult.success && locationResult.coordinates) {
        setLocationState('granted');
        
        if (pattern && patternId) {
          await joinVenueWithPattern(locationResult.coordinates);
        }
      } else {
        setLocationState('denied');
        setLocationError(locationResult.error || 'Location access denied');
      }
    } catch {
      setLocationState('error');
      setLocationError(getLocationErrorMessage('unknown'));
    }
  };

  // Join venue with current pattern
  const joinVenueWithPattern = async (coordinates: Coordinates) => {
    if (!pattern || !patternId) return;
    
    try {
      const presenceManager = presenceManagerRef.current;
      
      // Set up presence event listeners
      presenceManager.on('sync', handlePresenceUpdate);
      presenceManager.on('join', handlePresenceUpdate);
      presenceManager.on('leave', handlePresenceUpdate);
      
      // Join venue with current pattern
      await presenceManager.joinVenue(coordinates, pattern, patternId);
      
      // Create or update venue in database
      const createRequest = VenueAPI.prepareCreateRequest({
        coordinates,
        pattern_data: pattern
      });
      
      await fetch(createRequest.url, {
        method: createRequest.method,
        headers: createRequest.headers,
        body: createRequest.body
      });
      
      // Get initial venue state
      updateVenueState();
    } catch (error) {
      console.warn('Failed to join venue:', error);
    }
  };

  // Handle presence updates
  const handlePresenceUpdate = () => {
    updateVenueState();
  };

  // Update venue state and notify parent
  const updateVenueState = () => {
    const presenceManager = presenceManagerRef.current;
    const currentVenueState = presenceManager.getVenueState();
    const currentOtherPatterns = presenceManager.getOtherPatterns();
    
    setVenueState(currentVenueState);
    setOtherPatterns(currentOtherPatterns);
    
    // Notify parent components
    onVenueStateChange?.(currentVenueState);
    
    // Check for collisions if pattern is provided
    if (pattern) {
      const collisions = presenceManager.detectCollisions(pattern);
      onCollisionChange?.(collisions);
    }
  };

  // Leave venue
  const leaveVenue = async () => {
    const presenceManager = presenceManagerRef.current;
    await presenceManager.leaveVenue();
    setVenueState(null);
    setOtherPatterns([]);
    setLocationState('idle');
    onVenueStateChange?.(null);
    onCollisionChange?.([]);
  };

  // Detect collisions
  const detectCollisions = () => {
    if (!pattern) return [];
    const presenceManager = presenceManagerRef.current;
    return presenceManager.detectCollisions(pattern);
  };

  // Cleanup on unmount
  useEffect(() => {
    const presenceManager = presenceManagerRef.current;
    
    return () => {
      if (presenceManager) {
        presenceManager.leaveVenue();
      }
    };
  }, []);

  // Idle state - offer location features
  if (locationState === 'idle') {
    return (
      <Card className={className}>
        <CardContent className="p-4">
          <div className="text-center space-y-3">
            <h3 className="font-medium">Find Others Nearby</h3>
            <p className="text-sm text-muted-foreground">
              See other patterns in your area and avoid conflicts
            </p>
            <Button 
              onClick={requestLocationAccess}
              variant="outline"
              className="w-full"
            >
              <MapPin className="w-4 h-4 mr-2" />
              Enable Location Features
            </Button>
            <p className="text-xs text-muted-foreground">
              Your location stays private and is only used to find nearby patterns
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Requesting location
  if (locationState === 'requesting') {
    return (
      <Card className={className}>
        <CardContent className="p-4 text-center">
          <p className="text-sm text-muted-foreground">Requesting location access...</p>
        </CardContent>
      </Card>
    );
  }

  // Location granted and venue active
  if (locationState === 'granted' && venueState) {
    const collisions = detectCollisions();

    return (
      <Card className={className}>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <Users className="w-5 h-5 text-primary" />
              Your Area
            </CardTitle>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => setShowVenueDetails(!showVenueDetails)}
            >
              {showVenueDetails ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">
              Area {venueState.venue_id.toUpperCase()}
            </span>
            <span className="text-xs text-muted-foreground">
              {venueState.user_count} pattern{venueState.user_count !== 1 ? 's' : ''} active
            </span>
          </div>
          
          {showVenueDetails && otherPatterns.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-muted-foreground">Other Patterns:</h4>
              <div className="space-y-1">
                {otherPatterns.map((presence) => (
                  <div key={presence.user_id} className="text-xs bg-muted rounded p-2">
                    <div className="flex items-center justify-between">
                      <span className="font-mono">{presence.pattern_id}</span>
                      <span className="text-muted-foreground">
                        {Math.round((Date.now() - presence.joined_at) / 60000)}m ago
                      </span>
                    </div>
                    <div className="text-muted-foreground">
                      {presence.pattern_data.primary} • {presence.pattern_data.animation} • Speed {presence.pattern_data.speed}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {showVenueDetails && otherPatterns.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-2">
              You&apos;re the only one here with a pattern
            </p>
          )}
          
          {/* Collision Warning */}
          {collisions.length > 0 && (
            <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-lg p-3">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
                <div className="text-sm">
                  <p className="font-medium text-amber-800 dark:text-amber-200">
                    Pattern Conflict Detected
                  </p>
                  <p className="text-amber-700 dark:text-amber-300 mt-1">
                    {collisions.length} other pattern{collisions.length !== 1 ? 's' : ''} nearby {collisions.length === 1 ? 'is' : 'are'} very similar to yours. Consider changing your pattern for better visibility.
                  </p>
                </div>
              </div>
            </div>
          )}
          
          <div className="flex gap-2 pt-2">
            <Button 
              onClick={leaveVenue}
              variant="outline"
              size="sm"
              className="flex-1"
            >
              Leave Area
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Location denied or error
  if ((locationState === 'denied' || locationState === 'error') && locationError) {
    return (
      <Card className={className}>
        <CardContent className="p-4">
          <div className="flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" />
            <div className="text-sm">
              <p className="font-medium">Location features unavailable</p>
              <p className="text-muted-foreground mt-1">{locationError}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Fallback - shouldn't reach here
  return null;
}

/**
 * Hook to use venue context data
 */
export function useVenueContext(pattern?: Pattern, patternId?: string) {
  const [venueState, setVenueState] = useState<VenueChannelState | null>(null);
  const [collisions, setCollisions] = useState<PatternPresence[]>([]);

  const handleVenueStateChange = (state: VenueChannelState | null) => {
    setVenueState(state);
  };

  const handleCollisionChange = (newCollisions: PatternPresence[]) => {
    setCollisions(newCollisions);
  };

  return {
    venueState,
    collisions,
    handleVenueStateChange,
    handleCollisionChange,
    VenueContextComponent: (props: Omit<VenueContextProps, 'pattern' | 'patternId' | 'onVenueStateChange' | 'onCollisionChange'>) => (
      <VenueContext
        pattern={pattern}
        patternId={patternId}
        onVenueStateChange={handleVenueStateChange}
        onCollisionChange={handleCollisionChange}
        {...props}
      />
    )
  };
}