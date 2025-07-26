/**
 * Morse Code Timing Configuration - EXACT MATHEMATICAL PRECISION
 * No delays, no probability, no approximations - exact science only
 */

export const MORSE_TIMING = {
  // EXACT user-specified timings
  DOT_DURATION: 60,       // Short pulse - 60ms
  DASH_DURATION: 180,     // Long pulse - 180ms (3x dot)
  
  // EXACT gap durations - user specified
  SYMBOL_GAP: 60,         // Gap between symbols within same letter - 60ms
  LETTER_GAP: 420,        // Gap between letter and digits, between digits - 420ms (7x dot)
  CONFIRMATION_FLASH: 1000, // 1 second confirmation - EXACT
  END_TRANSMISSION_GAP: 420, // Same as letter gap - EXACT
  
  // Decoder tolerance ranges - using exact timings
  DECODER_TOLERANCE: {
    DOT_MIN: 60,          // EXACT match only
    DOT_MAX: 60,          // EXACT match only
    DASH_MIN: 180,        // EXACT match only
    DASH_MAX: 180,        // EXACT match only
    SYMBOL_GAP_MIN: 60,   // EXACT match only
    SYMBOL_GAP_MAX: 60,   // EXACT match only
    LETTER_GAP_MIN: 420,  // EXACT match only
    LETTER_GAP_MAX: 420,  // EXACT match only
    END_TRANSMISSION_MIN: 420 // EXACT match only
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