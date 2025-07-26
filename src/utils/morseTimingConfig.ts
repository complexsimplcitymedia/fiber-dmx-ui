/**
 * Morse Code Timing Configuration - EXACT MATHEMATICAL PRECISION
 * No delays, no probability, no approximations - exact science only
 */

export const MORSE_TIMING = {
  // Exact pulse durations (in milliseconds) - from specification
  DOT_DURATION: 200,      // Short pulse - EXACT
  DASH_DURATION: 600,     // Long pulse - EXACT
  
  // EXACT gap durations - from specification
  // NO gaps between symbols within same letter - continuous transmission
  SYMBOL_GAP: 200,        // Gap between symbols within same letter
  LETTER_GAP: 600,        // Gap between letter and digits, between digits
  CONFIRMATION_FLASH: 1000, // 1 second confirmation - EXACT
  END_TRANSMISSION_GAP: 600, // Same as letter gap - EXACT
  
  // Decoder tolerance ranges - ZERO TOLERANCE for exact matching
  DECODER_TOLERANCE: {
    DOT_MIN: 200,         // EXACT match only
    DOT_MAX: 200,         // EXACT match only
    DASH_MIN: 600,        // EXACT match only
    DASH_MAX: 600,        // EXACT match only
    SYMBOL_GAP_MIN: 200,  // EXACT match only
    SYMBOL_GAP_MAX: 200,  // EXACT match only
    LETTER_GAP_MIN: 600,  // EXACT match only
    LETTER_GAP_MAX: 600,  // EXACT match only
    END_TRANSMISSION_MIN: 600 // EXACT match only
  }
};

// Morse code patterns - EXACT mathematical mapping
export const MORSE_PATTERNS = {
  // Colors - EXACT patterns
  'R': '·−·',   // Red
  'G': '−−·',   // Green  
  'B': '−···',  // Blue
  
  // Numbers - EXACT patterns
  '0': '−−−−−',
  '1': '·−−−−',
  '2': '··−−−',
  '3': '···−−',
  '4': '····−',
  '5': '·····',
  '6': '−····',
  '7': '−−···',
  '8': '−−−··',
  '9': '−−−−·'
};

// Reverse lookup for decoder - EXACT mathematical inverse
export const PATTERN_TO_CHAR: { [pattern: string]: string } = {};
for (const [char, pattern] of Object.entries(MORSE_PATTERNS)) {
  PATTERN_TO_CHAR[pattern] = char;
}