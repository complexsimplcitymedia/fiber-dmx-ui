/**
 * Morse Code Timing Configuration - ABSOLUTE CORNERSTONE TIMINGS
 * These timings are IMMUTABLE - no flex, no changes, no approximations
 * USER-SPECIFIED EXACT VALUES - DO NOT MODIFY
 */

export const MORSE_TIMING = {
  // ABSOLUTE CORNERSTONE TIMINGS - NO FLEX
  DOT_DURATION: 60,       // Short pulse - 60ms
  DASH_DURATION: 180,     // Long pulse - 180ms (3x dot)
  
  // ABSOLUTE GAP DURATIONS - IMMUTABLE
  SYMBOL_GAP: 60,         // Gap between symbols within same letter - 60ms
  LETTER_GAP: 420,        // Gap between letter and digits, between digits - 420ms (7x dot)
  CONFIRMATION_FLASH: 1000, // 1 second confirmation - EXACT
  END_TRANSMISSION_GAP: 420, // Same as letter gap - EXACT
  
  // DECODER TOLERANCE - EXACT MATCH ONLY
  DECODER_TOLERANCE: {
    DOT_MIN: 60,          // CORNERSTONE - NO FLEX
    DOT_MAX: 60,          // CORNERSTONE - NO FLEX
    DASH_MIN: 180,        // CORNERSTONE - NO FLEX
    DASH_MAX: 180,        // CORNERSTONE - NO FLEX
    SYMBOL_GAP_MIN: 60,   // CORNERSTONE - NO FLEX
    SYMBOL_GAP_MAX: 60,   // CORNERSTONE - NO FLEX
    LETTER_GAP_MIN: 420,  // CORNERSTONE - NO FLEX
    LETTER_GAP_MAX: 420,  // CORNERSTONE - NO FLEX
    END_TRANSMISSION_MIN: 420 // CORNERSTONE - NO FLEX
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