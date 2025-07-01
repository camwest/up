"use client";

import { useState, useEffect, useCallback } from "react";
import { generateUniquePattern, createTrueCustomPattern, generateColorblindFriendlyPattern, type Pattern, PATTERN_NAMES, COLORBLIND_FRIENDLY } from "@/lib/patterns";
import { PatternPreview, PatternInfo } from "@/components/pattern-preview";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Copy, Shuffle, Share2 } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

export default function CreatePattern() {
  const [generatedPattern, setGeneratedPattern] = useState<{pattern: Pattern, name: string} | null>(null);
  const [shareUrl, setShareUrl] = useState<string>("");
  const [copySuccess, setCopySuccess] = useState(false);
  
  // WYSIWYG customization state
  const [selectedColor, setSelectedColor] = useState<string>("NEON");
  const [selectedSecondaryColor, setSelectedSecondaryColor] = useState<string>("none");
  const [selectedAnimation, setSelectedAnimation] = useState<string>("PULSE");
  const [selectedSpeed, setSelectedSpeed] = useState<number[]>([3]);
  

  const generatePattern = useCallback(() => {
    // Use random variations from the same color family for pattern names
    const primaryVariant = getRandomColorFromFamily(selectedColor);
    const secondaryVariant = selectedSecondaryColor === "none" ? "" : getRandomColorFromFamily(selectedSecondaryColor);
    const result = createTrueCustomPattern(primaryVariant, secondaryVariant, selectedAnimation, selectedSpeed[0]);
    
    setGeneratedPattern(result);
    setShareUrl(`${window.location.origin}/p/${result.name}`);
  }, [selectedColor, selectedSecondaryColor, selectedAnimation, selectedSpeed]);

  const randomizeInputs = useCallback(() => {
    // Randomize all the form inputs using unique colors
    const randomColor = uniqueColors[Math.floor(Math.random() * uniqueColors.length)].name;
    const randomSecondary = Math.random() < 0.3 ? uniqueColors[Math.floor(Math.random() * uniqueColors.length)].name : "none";
    const randomAnimation = PATTERN_NAMES.animations[Math.floor(Math.random() * PATTERN_NAMES.animations.length)];
    const randomSpeed = Math.floor(Math.random() * 5) + 1;
    
    setSelectedColor(randomColor);
    setSelectedSecondaryColor(randomSecondary);
    setSelectedAnimation(randomAnimation);
    setSelectedSpeed([randomSpeed]);
  }, []);

  const applyAccessibilityMode = useCallback((mode: keyof typeof COLORBLIND_FRIENDLY) => {
    // Set form inputs based on accessibility mode
    const config = COLORBLIND_FRIENDLY[mode];
    const availableColors = config.colors;
    
    // Pick primary and secondary from available colors
    const randomPrimary = availableColors[Math.floor(Math.random() * availableColors.length)];
    const randomSecondary = Math.random() < 0.3 ? availableColors[Math.floor(Math.random() * availableColors.length)] : "none";
    const randomAnimation = PATTERN_NAMES.animations[Math.floor(Math.random() * PATTERN_NAMES.animations.length)];
    const randomSpeed = Math.floor(Math.random() * 5) + 1;
    
    setSelectedColor(randomPrimary);
    setSelectedSecondaryColor(randomSecondary);
    setSelectedAnimation(randomAnimation);
    setSelectedSpeed([randomSpeed]);
  }, []);

  // Simplified unique colors (one per actual color family)
  const uniqueColors = [
    { name: 'NEON', color: '#FF008C' },   // Magenta family
    { name: 'TRON', color: '#00F9FF' },   // Cyan family  
    { name: 'ACID', color: '#B4FF11' },   // Lime family
    { name: 'GOLD', color: '#FFBF00' },   // Amber family
    { name: 'VOID', color: '#8B00FF' }    // Violet family
  ];

  // Helper function to get hex color from color name
  const getColorHex = (colorName: string): string => {
    const found = uniqueColors.find(c => c.name === colorName);
    return found?.color || '#FF008C';
  };

  // Function to pick a random color name from the same family for pattern generation
  const getRandomColorFromFamily = (colorName: string): string => {
    const familyMap: Record<string, string[]> = {
      'NEON': ['NEON', 'VOLT', 'FIRE'],
      'TRON': ['TRON', 'AQUA', 'SYNC'], 
      'ACID': ['ACID', 'BEAM', 'BUZZ'],
      'GOLD': ['GOLD'],
      'VOID': ['VOID']
    };
    const family = familyMap[colorName] || ['NEON'];
    return family[Math.floor(Math.random() * family.length)];
  };

  useEffect(() => {
    // Generate initial pattern on load
    generatePattern();
  }, [generatePattern]);

  // Regenerate pattern whenever form inputs change (WYSIWYG)
  useEffect(() => {
    generatePattern();
  }, [selectedColor, selectedSecondaryColor, selectedAnimation, selectedSpeed, generatePattern]);

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
        <div className="flex items-center p-2 w-full">
          {shareUrl && generatedPattern && (
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="ghost" className="text-foreground/80 hover:text-foreground ml-auto">
                  <Share2 className="w-4 h-4 mr-2" />
                  Share
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[calc(100vw-2rem)] max-w-80 border border-foreground/20 bg-glass backdrop-blur" align="end">
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
                  
                </div>
              </PopoverContent>
            </Popover>
          )}
        </div>
        
        {/* Center Content - WYSIWYG Custom Form */}
        <div className="flex-1 flex items-center justify-center px-2">
          <div className="w-full">
            <div className="border border-foreground/20 bg-glass backdrop-blur p-6 font-body text-sm text-foreground space-y-6">
              
              
              {/* Color Selection */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-xs font-medium">Primary</Label>
                  <Select value={selectedColor} onValueChange={(value) => { setSelectedColor(value); }}>
                    <SelectTrigger className="h-10">
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-5 h-5 border border-border"
                          style={{ backgroundColor: getColorHex(selectedColor) }}
                        />
                        <span>{selectedColor}</span>
                      </div>
                    </SelectTrigger>
                    <SelectContent>
                      {uniqueColors.map((colorObj) => (
                        <SelectItem key={colorObj.name} value={colorObj.name}>
                          <div 
                            className="w-8 h-8 border border-border rounded-sm"
                            style={{ backgroundColor: colorObj.color }}
                          />
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-xs font-medium">Secondary</Label>
                  <Select value={selectedSecondaryColor} onValueChange={(value) => { setSelectedSecondaryColor(value); }}>
                    <SelectTrigger className="h-10">
                      <div className="flex items-center gap-2">
                        {selectedSecondaryColor !== "none" && (
                          <div 
                            className="w-5 h-5 border border-border"
                            style={{ backgroundColor: getColorHex(selectedSecondaryColor) }}
                          />
                        )}
                        <span>{selectedSecondaryColor === "none" ? "None" : selectedSecondaryColor}</span>
                      </div>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">
                        <span className="text-xs text-muted-foreground">None</span>
                      </SelectItem>
                      {uniqueColors.map((colorObj) => (
                        <SelectItem key={colorObj.name} value={colorObj.name}>
                          <div 
                            className="w-8 h-8 border border-border rounded-sm"
                            style={{ backgroundColor: colorObj.color }}
                          />
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Animation & Speed */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-xs font-medium">Animation</Label>
                  <Select value={selectedAnimation} onValueChange={(value) => { setSelectedAnimation(value); }}>
                    <SelectTrigger className="h-10">
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-4 h-4"
                          style={{ 
                            backgroundColor: '#FF008C',
                            animation: selectedAnimation === 'PULSE' ? 'pulse8 600ms steps(4, end) infinite' :
                                     selectedAnimation === 'STROBE' ? 'strobe8 200ms steps(2, end) infinite' :
                                     selectedAnimation === 'WAVE' ? 'wave8 1000ms steps(6, end) infinite' :
                                     selectedAnimation === 'FADE' ? 'pulse8 600ms steps(4, end) infinite' :
                                     'pulse8 600ms steps(4, end) infinite'
                          }}
                        />
                        <span>{selectedAnimation}</span>
                      </div>
                    </SelectTrigger>
                    <SelectContent>
                      {PATTERN_NAMES.animations.map((animation) => (
                        <SelectItem key={animation} value={animation}>
                          <div className="flex items-center gap-2">
                            <div 
                              className="w-4 h-4"
                              style={{ 
                                backgroundColor: '#FF008C',
                                animation: animation === 'PULSE' ? 'pulse8 600ms steps(4, end) infinite' :
                                         animation === 'STROBE' ? 'strobe8 200ms steps(2, end) infinite' :
                                         animation === 'WAVE' ? 'wave8 1000ms steps(6, end) infinite' :
                                         animation === 'FADE' ? 'pulse8 600ms steps(4, end) infinite' :
                                         'pulse8 600ms steps(4, end) infinite'
                              }}
                            />
                            <span>{animation}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-xs font-medium">Speed: {selectedSpeed[0]}</Label>
                  <Slider
                    value={selectedSpeed}
                    onValueChange={setSelectedSpeed}
                    max={5}
                    min={1}
                    step={1}
                    className="w-full"
                  />
                </div>
              </div>
              
              
            </div>
          </div>
        </div>
        
        {/* Bottom Floating Controls */}
        <div className="p-2 space-y-4">
          {/* Quick Actions */}
          <div className="flex gap-3 justify-center">
            <Button 
              onClick={randomizeInputs}
              variant="ghost"
              className="font-headline border border-foreground/20 bg-glass backdrop-blur h-[42px] px-2"
            >
              <Shuffle className="w-4 h-4 mr-2" />
              Randomize
            </Button>
            
            <Select onValueChange={(value) => {
              if (value !== "none") {
                applyAccessibilityMode(value as keyof typeof COLORBLIND_FRIENDLY);
              }
            }}>
              <SelectTrigger className="border border-foreground/20 bg-glass backdrop-blur font-headline h-[42px] px-2">
                <SelectValue placeholder="Accessibility" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(COLORBLIND_FRIENDLY).map(([type, config]) => (
                  <SelectItem key={type} value={type}>
                    {config.description.replace("Optimized for ", "").replace(" users", "")}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
    </main>
  );
}