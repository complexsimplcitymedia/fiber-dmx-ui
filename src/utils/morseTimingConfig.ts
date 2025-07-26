/**
 * Morse Code Timing Configuration
 * Shared constants between transmitter and decoder to ensure perfect synchronization
 */

export const MORSE_TIMING = {
  // Basic pulse durations (in milliseconds)
  DOT_DURATION: 120,    // 12ms * 10
  DASH_DURATION: 360,   // 36ms * 10
  
  // Gap durations
  SYMBOL_GAP: 120,         // 12ms * 10 - "off" periods
  LETTER_GAP: 840,         // 84ms * 10 - "separation" 
  CONFIRMATION_FLASH: 1000, // 1 second confirmation
  END_TRANSMISSION_GAP: 2000, // 2 second end gap
  
  // Decoder tolerance ranges (based on timing constants above)
  DECODER_TOLERANCE: {
    DOT_MIN: 80,          // DOT_DURATION - 40ms tolerance
    DOT_MAX: 160,         // DOT_DURATION + 40ms tolerance
    DASH_MIN: 280,        // DASH_DURATION - 80ms tolerance  
    DASH_MAX: 440,        // DASH_DURATION + 80ms tolerance
    SYMBOL_GAP_MIN: 80,   // SYMBOL_GAP - 40ms tolerance
    SYMBOL_GAP_MAX: 160,  // SYMBOL_GAP + 40ms tolerance
    LETTER_GAP_MIN: 640,  // LETTER_GAP - 200ms tolerance
    LETTER_GAP_MAX: 1040, // LETTER_GAP + 200ms tolerance
    END_TRANSMISSION_MIN: 1500 // Minimum gap to detect transmission end
  }
};

// Morse code patterns (shared between transmitter and decoder)
export const MORSE_PATTERNS = {
  // Colors
  'R': '·−·',   // Red
  'G': '−−·',   // Green  
  'B': '−···',  // Blue
  
  // Numbers
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

// Reverse lookup for decoder
export const PATTERN_TO_CHAR: { [pattern: string]: string } = {};
for (const [char, pattern] of Object.entries(MORSE_PATTERNS)) {
  PATTERN_TO_CHAR[pattern] = char;
}