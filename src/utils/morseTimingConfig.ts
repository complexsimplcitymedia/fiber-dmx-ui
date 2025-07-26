/**
 * Morse Code Timing Configuration - EXACT MATHEMATICAL PRECISION
 * No delays, no probability, no approximations - exact science only
 */

export const MORSE_TIMING = {
  // Exact pulse durations (in milliseconds) - from specification
  DOT_DURATION: 120,      // 12ms * 10 - EXACT
  DASH_DURATION: 360,     // 36ms * 10 - EXACT
  
  // Exact gap durations - from specification  
  SYMBOL_GAP: 120,        // 12ms * 10 - off periods between symbols
  LETTER_GAP: 840,        // 84ms * 10 - separation between letters
  CONFIRMATION_FLASH: 1000, // 1 second confirmation - EXACT
  END_TRANSMISSION_GAP: 840, // Same as letter gap - EXACT
  
  // Decoder tolerance ranges - ZERO TOLERANCE for exact matching
  DECODER_TOLERANCE: {
    DOT_MIN: 120,         // EXACT match only
    DOT_MAX: 120,         // EXACT match only
    DASH_MIN: 360,        // EXACT match only
    DASH_MAX: 360,        // EXACT match only
    SYMBOL_GAP_MIN: 120,  // EXACT match only
    SYMBOL_GAP_MAX: 120,  // EXACT match only
    LETTER_GAP_MIN: 840,  // EXACT match only
    LETTER_GAP_MAX: 840,  // EXACT match only
    END_TRANSMISSION_MIN: 840 // EXACT match only
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