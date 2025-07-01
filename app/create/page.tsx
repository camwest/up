"use client";

import Link from "next/link";
import { useState, useEffect, useCallback } from "react";
import { generateUniquePattern, createTrueCustomPattern, generateColorblindFriendlyPattern, type Pattern, PATTERN_NAMES, COLORBLIND_FRIENDLY } from "@/lib/patterns";
import { PatternPreview, PatternInfo } from "@/components/pattern-preview";
import { ShareButton } from "@/components/share-modal";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Copy, Shuffle, ExternalLink, Settings, ArrowLeft, Share2, ChevronDown } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

export default function CreatePattern() {
  const [generatedPattern, setGeneratedPattern] = useState<{pattern: Pattern, name: string} | null>(null);
  const [shareUrl, setShareUrl] = useState<string>("");
  const [copySuccess, setCopySuccess] = useState(false);
  const [customMode, setCustomMode] = useState(false);
  const [colorblindMode, setColorblindMode] = useState<keyof typeof COLORBLIND_FRIENDLY | null>(null);
  
  // Manual customization state
  const [selectedColor, setSelectedColor] = useState<string>("");
  const [selectedSecondaryColor, setSelectedSecondaryColor] = useState<string>("none");
  const [selectedAnimation, setSelectedAnimation] = useState<string>("");
  const [selectedSpeed, setSelectedSpeed] = useState<number[]>([3]);
  

  const generatePattern = useCallback(() => {
    let result;
    
    if (colorblindMode) {
      result = generateColorblindFriendlyPattern(colorblindMode);
    } else if (customMode && selectedColor && selectedAnimation) {
      result = createTrueCustomPattern(selectedColor, selectedSecondaryColor === "none" ? "" : selectedSecondaryColor, selectedAnimation, selectedSpeed[0]);
    } else {
      result = generateUniquePattern();
    }
    
    setGeneratedPattern(result);
    setShareUrl(`${window.location.origin}/p/${result.name}`);
  }, [colorblindMode, customMode, selectedColor, selectedSecondaryColor, selectedAnimation, selectedSpeed]);

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
    <main className="min-h-screen relative overflow-hidden">
      {/* Fullscreen Pattern Background */}
      {generatedPattern && (
        <div className="absolute inset-0 z-0 pattern-display">
          <PatternPreview 
            pattern={generatedPattern.pattern}
            className="w-full h-full pattern-layer"
          />
        </div>
      )}
      
      {/* Dark Overlay for Readability */}
      <div className="absolute inset-0 bg-background/80 z-10" />
      
      {/* Floating Controls */}
      <div className="relative z-20 min-h-screen flex flex-col">
        {/* Top Navigation */}
        <div className="flex items-center justify-between p-6">
          <Button variant="ghost" asChild className="text-foreground/80 hover:text-foreground">
            <Link href="/">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Signal Up
            </Link>
          </Button>
          
          {shareUrl && generatedPattern && (
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="ghost" className="text-foreground/80 hover:text-foreground">
                  <Share2 className="w-4 h-4 mr-2" />
                  Share
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80 border border-foreground/20 bg-glass backdrop-blur" align="end">
                <div className="space-y-3">
                  <div className="space-y-2">
                    <h4 className="font-headline font-semibold text-sm">Signal Locked ⚡</h4>
                    <div className="flex gap-2">
                      <code className="font-mono text-primary text-shadow-neon bg-background/80 px-3 py-2 border border-primary/30 flex-1 text-xs break-all">
                        {shareUrl}
                      </code>
                      <Button 
                        onClick={copyToClipboard}
                        variant="ghost"
                        size="sm"
                        className="shrink-0"
                      >
                        {copySuccess ? "Copied!" : <Copy className="w-4 h-4" />}
                      </Button>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <ShareButton
                      patternUrl={shareUrl}
                      patternName={generatedPattern.name}
                      className="w-full justify-center"
                      variant="primary"
                    />
                    
                    <Button asChild className="w-full font-headline" variant="ghost">
                      <Link href={`/p/${generatedPattern.name}`}>
                        <ExternalLink className="w-4 h-4 mr-2" />
                        Signal Up to Test
                      </Link>
                    </Button>
                  </div>
                </div>
              </PopoverContent>
            </Popover>
          )}
        </div>
        
        {/* Center Content - Pattern Info */}
        <div className="flex-1 flex items-center justify-center px-4">
          {generatedPattern && (
            <div className="text-center space-y-2">
              <div className="border border-foreground/20 bg-glass backdrop-blur px-4 py-3 font-body text-sm text-foreground max-w-sm">
                <PatternInfo 
                  pattern={generatedPattern.pattern}
                  patternName={generatedPattern.name}
                />
              </div>
            </div>
          )}
        </div>
        
        {/* Bottom Floating Controls */}
        <div className="p-6 space-y-4 pb-8">
          {/* Quick Actions */}
          <div className="flex gap-3 justify-center">
            <Button 
              onClick={generatePattern}
              className="font-headline font-bold bg-primary text-primary-foreground px-6 py-3 shadow-neon uppercase tracking-wide text-lg active:translate-y-0.5 transition-transform"
            >
              <Shuffle className="w-4 h-4 mr-2" />
              Signal Up New
            </Button>
          </div>
          
          {/* Generation Mode Popover */}
          <div className="max-w-sm mx-auto">
            <Popover>
              <PopoverTrigger asChild>
                <Button 
                  variant="ghost" 
                  className="w-full border border-foreground/20 bg-glass backdrop-blur font-headline"
                >
                  <Settings className="w-4 h-4 mr-2" />
                  Generation Options
                  <ChevronDown className="w-4 h-4 ml-auto" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-64 border border-foreground/20 bg-glass backdrop-blur p-4">
                <div className="space-y-2">
                  {/* Mode Selection */}
                  <div className="grid grid-cols-2 gap-1">
                    <Button 
                      variant={!customMode && !colorblindMode ? "default" : "ghost"}
                      size="sm"
                      onClick={() => { setCustomMode(false); setColorblindMode(null); generatePattern(); }}
                      className="text-xs font-headline h-8"
                    >
                      <Shuffle className="w-3 h-3 mr-1" />
                      Random
                    </Button>
                    
                    <Button 
                      variant={customMode ? "default" : "ghost"}
                      size="sm"
                      onClick={() => { 
                        const newCustomMode = !customMode;
                        setCustomMode(newCustomMode);
                        setColorblindMode(null);
                        // Set defaults when entering custom mode
                        if (newCustomMode) {
                          if (!selectedColor) setSelectedColor(PATTERN_NAMES.colors[0]);
                          if (!selectedAnimation) setSelectedAnimation(PATTERN_NAMES.animations[0]);
                        }
                      }}
                      className="text-xs font-headline h-8"
                    >
                      <Settings className="w-3 h-3 mr-1" />
                      Custom
                    </Button>
                  </div>
                  
                  {/* Accessibility Select - Only show when not in Custom mode */}
                  {!customMode && (
                    <div className="space-y-1">
                      <Label className="text-xs font-medium">Accessibility</Label>
                      <Select 
                        value={colorblindMode || "none"} 
                        onValueChange={(value) => {
                          const newMode = value === "none" ? null : value as keyof typeof COLORBLIND_FRIENDLY;
                          setColorblindMode(newMode);
                          setTimeout(generatePattern, 100);
                        }}
                      >
                        <SelectTrigger className="h-7 text-xs">
                          <SelectValue placeholder="None" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none" className="text-xs">None</SelectItem>
                          {Object.entries(COLORBLIND_FRIENDLY).map(([type, config]) => (
                            <SelectItem key={type} value={type} className="text-xs">
                              {config.description.replace("Optimized for ", "").replace(" users", "")}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                  
                  {/* Custom Controls - Compact */}
                  {customMode && (
                    <div className="space-y-1 pt-1 border-t">
                      <div className="grid grid-cols-2 gap-1">
                        <div>
                          <Label className="text-xs font-medium">Primary</Label>
                          <Select onValueChange={setSelectedColor} value={selectedColor}>
                            <SelectTrigger className="h-7 text-xs">
                              <SelectValue placeholder="Primary" />
                            </SelectTrigger>
                            <SelectContent>
                              {PATTERN_NAMES.colors.map((color) => (
                                <SelectItem key={color} value={color} className="text-xs">
                                  {color}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div>
                          <Label className="text-xs font-medium">Secondary</Label>
                          <Select onValueChange={setSelectedSecondaryColor} value={selectedSecondaryColor}>
                            <SelectTrigger className="h-7 text-xs">
                              <SelectValue placeholder="None" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="none" className="text-xs">None</SelectItem>
                              {PATTERN_NAMES.colors.map((color) => (
                                <SelectItem key={color} value={color} className="text-xs">
                                  {color}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-1">
                        <div>
                          <Label className="text-xs font-medium">Animation</Label>
                          <Select onValueChange={setSelectedAnimation} value={selectedAnimation}>
                            <SelectTrigger className="h-7 text-xs">
                              <SelectValue placeholder="Anim" />
                            </SelectTrigger>
                            <SelectContent>
                              {PATTERN_NAMES.animations.map((animation) => (
                                <SelectItem key={animation} value={animation} className="text-xs">
                                  {animation}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div>
                          <Label className="text-xs font-medium">Speed: {selectedSpeed[0]}</Label>
                          <Slider
                            value={selectedSpeed}
                            onValueChange={setSelectedSpeed}
                            max={5}
                            min={1}
                            step={1}
                            className="w-full h-4 mt-1"
                          />
                        </div>
                      </div>

                    </div>
                  )}
                </div>
              </PopoverContent>
            </Popover>
          </div>
        </div>
      </div>
    </main>
  );
}