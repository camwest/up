/**
 * Concert Finder Pattern Generation System
 * Creates unique, visually distinct patterns for crowd identification
 */

// Core pattern interface matching our aesthetic
export interface Pattern {
  primary: string;      // hex color (without #)
  secondary?: string;   // optional hex color (without #) 
  animation: 'pulse' | 'strobe' | 'wave' | 'fade';
  speed: number;        // 1-5 scale (1=slow, 5=fast)
}

// Aesthetic pattern name vocabulary 
export const PATTERN_NAMES = {
  colors: [
    'NEON',   // Magenta family
    'VOLT',   // Magenta family  
    'FIRE',   // Magenta family
    'TRON',   // Cyan family
    'AQUA',   // Cyan family
    'SYNC',   // Cyan family
    'ACID',   // Lime family
    'BEAM',   // Lime family
    'BUZZ',   // Lime family
    'GOLD',   // Amber family
    'VOID'    // Violet family
  ],
  animations: ['PULSE', 'STROBE', 'WAVE', 'FADE'],
  maxNumber: 99
} as const;

// Color mappings for our aesthetic palette
const COLOR_PALETTE = {
  'NEON': { h: 329, s: 100, l: 50 },  // Magenta #FF008C
  'VOLT': { h: 335, s: 100, l: 45 },  // Magenta variant
  'FIRE': { h: 320, s: 100, l: 55 },  // Magenta variant
  'TRON': { h: 186, s: 100, l: 50 },  // Cyan #00F9FF
  'AQUA': { h: 180, s: 100, l: 45 },  // Cyan variant
  'SYNC': { h: 190, s: 100, l: 55 },  // Cyan variant
  'ACID': { h: 79, s: 100, l: 53 },   // Lime #B4FF11
  'BEAM': { h: 75, s: 100, l: 48 },   // Lime variant
  'BUZZ': { h: 85, s: 100, l: 58 },   // Lime variant
  'GOLD': { h: 45, s: 100, l: 50 },   // Amber #FFBF00
  'VOID': { h: 271, s: 100, l: 50 }   // Violet #8B00FF
} as const;

// Animation speed mappings (CSS duration in ms)
const SPEED_MAP = {
  1: 1200,  // Very slow
  2: 900,   // Slow
  3: 600,   // Medium (default)
  4: 400,   // Fast
  5: 200    // Very fast
} as const;

/**
 * Generate a random unique pattern
 */
export function generateUniquePattern(): { pattern: Pattern; name: string } {
  // Create random seed (location-based generation deferred to Issue #4)
  const seed = Math.floor(Math.random() * 1000000);
  
  // Generate pattern components
  const colorIndex = seed % PATTERN_NAMES.colors.length;
  const animIndex = (seed >> 3) % PATTERN_NAMES.animations.length;
  const number = (seed % PATTERN_NAMES.maxNumber) + 1;
  const speed = ((seed >> 6) % 5) + 1;
  
  const colorName = PATTERN_NAMES.colors[colorIndex];
  const animation = PATTERN_NAMES.animations[animIndex];
  
  // Get primary color from palette
  const colorData = COLOR_PALETTE[colorName];
  const primary = hslToHex(colorData.h, colorData.s, colorData.l);
  
  // Generate complementary secondary color (30% chance)
  let secondary: string | undefined;
  if (seed % 10 < 3) {
    const complementH = (colorData.h + 180) % 360;
    secondary = hslToHex(complementH, colorData.s * 0.8, colorData.l * 0.9);
  }
  
  const pattern: Pattern = {
    primary,
    secondary,
    animation: animation.toLowerCase() as Pattern['animation'],
    speed
  };
  
  const name = `${colorName}-${animation}-${number.toString().padStart(2, '0')}`;
  
  return { pattern, name };
}

/**
 * Create a custom pattern from user selections
 */
export function createCustomPattern(
  colorName: string,
  animation: string,
  speed: number
): { pattern: Pattern; name: string } {
  // Validate inputs
  if (!PATTERN_NAMES.colors.includes(colorName as any)) {
    throw new Error(`Invalid color name: ${colorName}`);
  }
  if (!PATTERN_NAMES.animations.includes(animation.toUpperCase() as any)) {
    throw new Error(`Invalid animation: ${animation}`);
  }
  if (speed < 1 || speed > 5) {
    throw new Error(`Invalid speed: ${speed}. Must be 1-5`);
  }

  // Get color from palette
  const colorData = COLOR_PALETTE[colorName as keyof typeof COLOR_PALETTE];
  const primary = hslToHex(colorData.h, colorData.s, colorData.l);
  
  // Generate secondary color (30% chance)
  let secondary: string | undefined;
  if (Math.random() < 0.3) {
    const complementH = (colorData.h + 180) % 360;
    secondary = hslToHex(complementH, colorData.s * 0.8, colorData.l * 0.9);
  }
  
  const pattern: Pattern = {
    primary,
    secondary,
    animation: animation.toLowerCase() as Pattern['animation'],
    speed
  };
  
  // Generate name with custom number
  const number = Math.floor(Math.random() * PATTERN_NAMES.maxNumber) + 1;
  const name = `${colorName}-${animation.toUpperCase()}-${number.toString().padStart(2, '0')}`;
  
  return { pattern, name };
}

/**
 * Encode a pattern into an aesthetic URL name
 */
export function encodePattern(pattern: Pattern): string {
  // Find matching color name by comparing hex values
  const colorName = findColorName(pattern.primary);
  const animName = pattern.animation.toUpperCase();
  
  // Create deterministic number from pattern properties
  const primaryNum = parseInt(pattern.primary.slice(0, 2), 16);
  const secondaryNum = pattern.secondary 
    ? parseInt(pattern.secondary.slice(0, 2), 16) 
    : 0;
  const number = ((primaryNum + secondaryNum + pattern.speed) % PATTERN_NAMES.maxNumber) + 1;
  
  return `${colorName}-${animName}-${number.toString().padStart(2, '0')}`;
}

/**
 * Decode an aesthetic URL name back to a pattern
 */
export function parsePatternName(name: string): Pattern | null {
  const parts = name.toUpperCase().split('-');
  if (parts.length !== 3) return null;
  
  const [colorName, animName, numberStr] = parts;
  
  // Validate components
  if (!PATTERN_NAMES.colors.includes(colorName as any)) return null;
  if (!PATTERN_NAMES.animations.includes(animName as any)) return null;
  
  const number = parseInt(numberStr, 10);
  if (isNaN(number) || number < 1 || number > PATTERN_NAMES.maxNumber) return null;
  
  // Reconstruct pattern
  const colorData = COLOR_PALETTE[colorName as keyof typeof COLOR_PALETTE];
  const primary = hslToHex(colorData.h, colorData.s, colorData.l);
  
  // Generate secondary color if needed (based on number)
  let secondary: string | undefined;
  if (number % 10 < 3) {
    const complementH = (colorData.h + 180) % 360;
    secondary = hslToHex(complementH, colorData.s * 0.8, colorData.l * 0.9);
  }
  
  const speed = ((number % 5) + 1);
  
  return {
    primary,
    secondary,
    animation: animName.toLowerCase() as Pattern['animation'],
    speed
  };
}

/**
 * Get animation duration in milliseconds for CSS
 */
export function getAnimationDuration(speed: number): number {
  return SPEED_MAP[speed as keyof typeof SPEED_MAP] || SPEED_MAP[3];
}

/**
 * Calculate contrast ratio between two colors
 */
export function getContrastRatio(color1: string, color2: string): number {
  const lum1 = getLuminance(color1);
  const lum2 = getLuminance(color2);
  const brightest = Math.max(lum1, lum2);
  const darkest = Math.min(lum1, lum2);
  return (brightest + 0.05) / (darkest + 0.05);
}

/**
 * Check if pattern has good visibility (contrast > 4.5)
 */
export function hasGoodContrast(pattern: Pattern): boolean {
  const bgContrast = getContrastRatio(pattern.primary, '050505'); // Against our black bg
  return bgContrast >= 4.5;
}

/**
 * Colorblind-friendly pattern alternatives
 */
export const COLORBLIND_FRIENDLY = {
  protanopia: {
    // Red-blind friendly (avoid red/green confusion)
    colors: ['TRON', 'AQUA', 'SYNC', 'GOLD', 'VOID'], // Blue, cyan, amber, violet
    description: 'Optimized for red-blind (protanopia) users'
  },
  deuteranopia: {
    // Green-blind friendly  
    colors: ['TRON', 'AQUA', 'SYNC', 'GOLD', 'VOID'], // Blue, cyan, amber, violet
    description: 'Optimized for green-blind (deuteranopia) users'
  },
  tritanopia: {
    // Blue-blind friendly (avoid blue/yellow confusion)
    colors: ['NEON', 'VOLT', 'FIRE', 'ACID', 'BEAM'], // Magenta, lime variants
    description: 'Optimized for blue-blind (tritanopia) users'
  }
} as const;

/**
 * Generate a colorblind-friendly pattern
 */
export function generateColorblindFriendlyPattern(
  type: keyof typeof COLORBLIND_FRIENDLY
): { pattern: Pattern; name: string } {
  const friendlyColors = COLORBLIND_FRIENDLY[type].colors;
  
  // Use same generation logic but restrict to safe colors
  const seed = Math.floor(Math.random() * 1000000);
  const colorIndex = seed % friendlyColors.length;
  const animIndex = (seed >> 3) % PATTERN_NAMES.animations.length;
  const number = (seed % PATTERN_NAMES.maxNumber) + 1;
  const speed = ((seed >> 6) % 5) + 1;
  
  const colorName = friendlyColors[colorIndex];
  const animation = PATTERN_NAMES.animations[animIndex];
  
  // Get primary color from palette
  const colorData = COLOR_PALETTE[colorName];
  const primary = hslToHex(colorData.h, colorData.s, colorData.l);
  
  // No secondary color for colorblind patterns (reduce confusion)
  const pattern: Pattern = {
    primary,
    animation: animation.toLowerCase() as Pattern['animation'],
    speed
  };
  
  const name = `${colorName}-${animation}-${number.toString().padStart(2, '0')}`;
  
  return { pattern, name };
}

/**
 * Check if a color is colorblind-friendly for a specific type
 */
export function isColorblindFriendly(
  colorName: string, 
  type: keyof typeof COLORBLIND_FRIENDLY
): boolean {
  return COLORBLIND_FRIENDLY[type].colors.includes(colorName as any);
}

// Utility functions
function hslToHex(h: number, s: number, l: number): string {
  const sNorm = s / 100;
  const lNorm = l / 100;
  
  const c = (1 - Math.abs(2 * lNorm - 1)) * sNorm;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = lNorm - c / 2;
  
  let r = 0, g = 0, b = 0;
  
  if (0 <= h && h < 60) {
    r = c; g = x; b = 0;
  } else if (60 <= h && h < 120) {
    r = x; g = c; b = 0;
  } else if (120 <= h && h < 180) {
    r = 0; g = c; b = x;
  } else if (180 <= h && h < 240) {
    r = 0; g = x; b = c;
  } else if (240 <= h && h < 300) {
    r = x; g = 0; b = c;
  } else if (300 <= h && h < 360) {
    r = c; g = 0; b = x;
  }
  
  const rHex = Math.round((r + m) * 255).toString(16).padStart(2, '0');
  const gHex = Math.round((g + m) * 255).toString(16).padStart(2, '0');
  const bHex = Math.round((b + m) * 255).toString(16).padStart(2, '0');
  
  return `${rHex}${gHex}${bHex}`.toUpperCase();
}

function findColorName(hex: string): string {
  // Convert hex to HSL and find closest color name
  const { h } = hexToHsl(hex);
  
  let closestName = 'NEON';
  let closestDistance = Infinity;
  
  for (const [name, color] of Object.entries(COLOR_PALETTE)) {
    const distance = Math.abs(h - color.h);
    if (distance < closestDistance) {
      closestDistance = distance;
      closestName = name;
    }
  }
  
  return closestName;
}

function hexToHsl(hex: string): { h: number; s: number; l: number } {
  const r = parseInt(hex.slice(0, 2), 16) / 255;
  const g = parseInt(hex.slice(2, 4), 16) / 255;
  const b = parseInt(hex.slice(4, 6), 16) / 255;
  
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0, s = 0, l = (max + min) / 2;
  
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h /= 6;
  }
  
  return { h: h * 360, s: s * 100, l: l * 100 };
}

function getLuminance(hex: string): number {
  const r = parseInt(hex.slice(0, 2), 16) / 255;
  const g = parseInt(hex.slice(2, 4), 16) / 255;
  const b = parseInt(hex.slice(4, 6), 16) / 255;
  
  const toLinear = (c: number) => c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  
  return 0.2126 * toLinear(r) + 0.7152 * toLinear(g) + 0.0722 * toLinear(b);
}