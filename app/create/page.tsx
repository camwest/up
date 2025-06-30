"use client";

import Link from "next/link";
import { useState, useEffect, useCallback } from "react";
import { generateUniquePattern, createCustomPattern, generateColorblindFriendlyPattern, type Pattern, PATTERN_NAMES, COLORBLIND_FRIENDLY } from "@/lib/patterns";
import { PatternPreview, PatternInfo } from "@/components/pattern-preview";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Copy, Shuffle, ExternalLink, Settings, MapPin, Users, AlertCircle } from "lucide-react";
import { requestLocation, getLocationErrorMessage, coordinatesToVenueId, type Coordinates, type LocationResult } from "@/lib/location";
import { getPresenceManager } from "@/lib/presence";
import { VenueAPI } from "@/lib/venues";

export default function CreatePattern() {
  const [generatedPattern, setGeneratedPattern] = useState<{pattern: Pattern, name: string} | null>(null);
  const [shareUrl, setShareUrl] = useState<string>("");
  const [copySuccess, setCopySuccess] = useState(false);
  const [customMode, setCustomMode] = useState(false);
  const [colorblindMode, setColorblindMode] = useState<keyof typeof COLORBLIND_FRIENDLY | null>(null);
  
  // Manual customization state
  const [selectedColor, setSelectedColor] = useState<string>("");
  const [selectedAnimation, setSelectedAnimation] = useState<string>("");
  const [selectedSpeed, setSelectedSpeed] = useState<number[]>([3]);
  
  // Venue integration state
  const [locationState, setLocationState] = useState<'idle' | 'requesting' | 'granted' | 'denied' | 'error'>('idle');
  const [userLocation, setUserLocation] = useState<Coordinates | null>(null);
  const [venueInfo, setVenueInfo] = useState<{id: string, label?: string, userCount: number} | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [joinedVenue, setJoinedVenue] = useState(false);

  const generatePattern = useCallback(() => {
    let result;
    
    if (colorblindMode) {
      result = generateColorblindFriendlyPattern(colorblindMode);
    } else if (customMode && selectedColor && selectedAnimation) {
      result = createCustomPattern(selectedColor, selectedAnimation, selectedSpeed[0]);
    } else {
      result = generateUniquePattern();
    }
    
    setGeneratedPattern(result);
    setShareUrl(`${window.location.origin}/p/${result.name}`);
  }, [colorblindMode, customMode, selectedColor, selectedAnimation, selectedSpeed]);
  
  // Location and venue functions
  const requestLocationAccess = async () => {
    setLocationState('requesting');
    setLocationError(null);
    
    try {
      const locationResult: LocationResult = await requestLocation({
        enableHighAccuracy: false, // Privacy-first approach
        timeout: 10000,
        maximumAge: 300000 // 5 minutes
      });
      
      if (locationResult.success && locationResult.coordinates) {
        setUserLocation(locationResult.coordinates);
        setLocationState('granted');
        
        // Get venue information
        const venueId = coordinatesToVenueId(locationResult.coordinates);
        await fetchVenueInfo(venueId);
      } else {
        setLocationState('denied');
        setLocationError(locationResult.error || 'Location access denied');
      }
    } catch {
      setLocationState('error');
      setLocationError(getLocationErrorMessage('unknown'));
    }
  };
  
  const fetchVenueInfo = async (venueId: string) => {
    try {
      const response = await fetch(`/api/venues/${venueId}`);
      if (response.ok) {
        const venue = await response.json();
        setVenueInfo({
          id: venueId,
          label: venue.label,
          userCount: 0 // Will be updated by presence
        });
      } else {
        // Venue doesn't exist yet - that's fine
        setVenueInfo({
          id: venueId,
          userCount: 0
        });
      }
    } catch (error) {
      console.warn('Failed to fetch venue info:', error);
      // Non-blocking error - venue features just won't work
    }
  };
  
  const joinVenueWithPattern = async () => {
    if (!userLocation || !generatedPattern) return;
    
    try {
      const presenceManager = getPresenceManager();
      await presenceManager.joinVenue(
        userLocation,
        generatedPattern.pattern,
        generatedPattern.name
      );
      
      // Create or update venue in database
      const createRequest = VenueAPI.prepareCreateRequest({
        coordinates: userLocation,
        pattern_data: generatedPattern.pattern
      });
      
      await fetch(createRequest.url, {
        method: createRequest.method,
        headers: createRequest.headers,
        body: createRequest.body
      });
      
      setJoinedVenue(true);
    } catch (error) {
      console.warn('Failed to join venue:', error);
    }
  };

  useEffect(() => {
    // Generate initial pattern on load
    generatePattern();
  }, [generatePattern]);

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = shareUrl;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    }
  };

  return (
    <main className="min-h-screen bg-background text-foreground flex flex-col">
      <nav className="w-full border-b border-border">
        <div className="max-w-4xl mx-auto flex justify-between items-center p-4">
          <Link href="/" className="font-bold text-lg text-primary">
            Concert Finder
          </Link>
        </div>
      </nav>

      <div className="flex-1 flex flex-col items-center px-4 py-8">
        <div className="max-w-md w-full space-y-6">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-primary mb-2">
              Create Your Pattern
            </h1>
            <p className="text-muted-foreground">
              Generate a unique flashing pattern and share it with your friends
            </p>
          </div>

          {/* Generation Mode Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Generation Mode</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 gap-3">
                <Button 
                  variant={!customMode && !colorblindMode ? "default" : "outline"}
                  onClick={() => { setCustomMode(false); setColorblindMode(null); generatePattern(); }}
                  className="w-full"
                >
                  <Shuffle className="w-4 h-4 mr-2" />
                  Random Generation
                </Button>
                
                <Button 
                  variant={customMode ? "default" : "outline"}
                  onClick={() => { setCustomMode(!customMode); setColorblindMode(null); }}
                  className="w-full"
                >
                  <Settings className="w-4 h-4 mr-2" />
                  Manual Customization
                </Button>
              </div>
              
              {/* Colorblind-friendly options */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">Accessibility Options:</Label>
                <div className="grid grid-cols-1 gap-2">
                  {Object.entries(COLORBLIND_FRIENDLY).map(([type, config]) => (
                    <Button
                      key={type}
                      variant={colorblindMode === type ? "default" : "outline"}
                      size="sm"
                      onClick={() => {
                        setColorblindMode(colorblindMode === type ? null : type as keyof typeof COLORBLIND_FRIENDLY);
                        setCustomMode(false);
                        setTimeout(generatePattern, 100);
                      }}
                      className="text-xs"
                    >
                      {config.description}
                    </Button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Manual Customization Panel */}
          {customMode && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Custom Pattern</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="color-select">Color</Label>
                  <Select onValueChange={setSelectedColor} value={selectedColor}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a color" />
                    </SelectTrigger>
                    <SelectContent>
                      {PATTERN_NAMES.colors.map((color) => (
                        <SelectItem key={color} value={color}>
                          {color}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="animation-select">Animation</Label>
                  <Select onValueChange={setSelectedAnimation} value={selectedAnimation}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select an animation" />
                    </SelectTrigger>
                    <SelectContent>
                      {PATTERN_NAMES.animations.map((animation) => (
                        <SelectItem key={animation} value={animation}>
                          {animation}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="speed-slider">Speed: {selectedSpeed[0]}</Label>
                  <Slider
                    value={selectedSpeed}
                    onValueChange={setSelectedSpeed}
                    max={5}
                    min={1}
                    step={1}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Slow</span>
                    <span>Fast</span>
                  </div>
                </div>

                <Button 
                  onClick={generatePattern}
                  disabled={!selectedColor || !selectedAnimation}
                  className="w-full"
                >
                  Generate Custom Pattern
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Pattern Preview */}
          {generatedPattern && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Your Pattern</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <PatternPreview 
                  pattern={generatedPattern.pattern} 
                  className="h-32"
                />
                <PatternInfo 
                  pattern={generatedPattern.pattern}
                  patternName={generatedPattern.name}
                />
                
                {/* Venue Integration */}
                {locationState === 'idle' && (
                  <div className="border-t pt-4">
                    <div className="text-center space-y-2">
                      <p className="text-sm text-muted-foreground">
                        Want to find others with patterns nearby?
                      </p>
                      <Button 
                        onClick={requestLocationAccess}
                        variant="outline"
                        size="sm"
                        className="w-full"
                      >
                        <MapPin className="w-4 h-4 mr-2" />
                        Enable Location Features
                      </Button>
                      <p className="text-xs text-muted-foreground">
                        Your location stays private - only used to find nearby patterns
                      </p>
                    </div>
                  </div>
                )}
                
                {locationState === 'requesting' && (
                  <div className="border-t pt-4 text-center">
                    <p className="text-sm text-muted-foreground">Requesting location access...</p>
                  </div>
                )}
                
                {locationState === 'granted' && venueInfo && (
                  <div className="border-t pt-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-primary" />
                        <span className="text-sm font-medium">
                          {venueInfo.label || `Area ${venueInfo.id.toUpperCase()}`}
                        </span>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {venueInfo.userCount} patterns nearby
                      </span>
                    </div>
                    
                    {!joinedVenue && (
                      <Button 
                        onClick={joinVenueWithPattern}
                        size="sm"
                        className="w-full"
                      >
                        <Users className="w-4 h-4 mr-2" />
                        Join This Area
                      </Button>
                    )}
                    
                    {joinedVenue && (
                      <div className="text-center text-sm text-green-600 dark:text-green-400">
                        ✓ You&apos;re now visible to others in this area
                      </div>
                    )}
                  </div>
                )}
                
                {(locationState === 'denied' || locationState === 'error') && locationError && (
                  <div className="border-t pt-4">
                    <div className="flex items-start gap-2 p-3 bg-muted rounded-lg">
                      <AlertCircle className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" />
                      <div className="text-sm">
                        <p className="font-medium">Location features unavailable</p>
                        <p className="text-muted-foreground mt-1">{locationError}</p>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Share Section */}
          {shareUrl && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Share Your Pattern</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Shareable Link:</label>
                  <div className="flex gap-2">
                    <code className="flex-1 text-xs bg-muted p-2 rounded border text-primary font-mono break-all">
                      {shareUrl}
                    </code>
                    <Button 
                      onClick={copyToClipboard}
                      size="sm"
                      variant="outline"
                      className="shrink-0"
                    >
                      {copySuccess ? "Copied!" : <Copy className="w-4 h-4" />}
                    </Button>
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <Button asChild className="flex-1">
                    <Link href={`/p/${generatedPattern?.name}${userLocation ? `?venue=${coordinatesToVenueId(userLocation)}` : ''}`}>
                      <ExternalLink className="w-4 h-4 mr-2" />
                      Test Pattern
                    </Link>
                  </Button>
                  <Button onClick={generatePattern} variant="outline">
                    <Shuffle className="w-4 h-4 mr-2" />
                    New Pattern
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="text-center">
            <Link
              href="/"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              ← Back to Home
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}