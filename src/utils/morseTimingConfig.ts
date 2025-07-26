/**
 * Morse Code Timing Configuration - ABSOLUTE CORNERSTONE TIMINGS
 * These timings are IMMUTABLE - no flex, no changes, no approximations
 * USER-SPECIFIED EXACT VALUES - DO NOT MODIFY
 */

export const MORSE_TIMING = {
  // ABSOLUTE CORNERSTONE TIMINGS - NO FLEX
  DOT_DURATION: 120,      // Short pulse - 120ms (0.12s from spreadsheet)
  DASH_DURATION: 360,     // Long pulse - 360ms (0.36s from spreadsheet, 3x dot)
  
  // ABSOLUTE GAP DURATIONS - IMMUTABLE
  SYMBOL_GAP: 120,        // Gap between symbols within same letter - 120ms (same as dot)
  LETTER_GAP: 840,        // Gap between letter and digits, between digits - 840ms (7x dot)
  CONFIRMATION_FLASH: 1000, // 1 second confirmation - EXACT
  END_TRANSMISSION_GAP: 840, // Same as letter gap - EXACT
  
  // DECODER TOLERANCE - EXACT MATCH ONLY
  DECODER_TOLERANCE: {
    DOT_MIN: 120,         // CORNERSTONE - NO FLEX
    DOT_MAX: 120,         // CORNERSTONE - NO FLEX
    DASH_MIN: 360,        // CORNERSTONE - NO FLEX
    DASH_MAX: 360,        // CORNERSTONE - NO FLEX
    SYMBOL_GAP_MIN: 120,  // CORNERSTONE - NO FLEX
    SYMBOL_GAP_MAX: 120,  // CORNERSTONE - NO FLEX
    LETTER_GAP_MIN: 840,  // CORNERSTONE - NO FLEX
    LETTER_GAP_MAX: 840,  // CORNERSTONE - NO FLEX
    END_TRANSMISSION_MIN: 840 // CORNERSTONE - NO FLEX
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