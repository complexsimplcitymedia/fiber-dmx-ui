/**
 * Morse Code Timing Configuration
 * Shared constants between transmitter and decoder to ensure perfect synchronization
 */

export const MORSE_TIMING = {
  // Basic pulse durations (in milliseconds)
  DOT_DURATION: 120,
  DASH_DURATION: 360,
  
  // Gap durations
  SYMBOL_GAP: 33,        // Gap between dots/dashes within a letter
  LETTER_GAP: 100,       // Gap between letters
  CONFIRMATION_FLASH: 167, // Duration of confirmation pulse
  END_TRANSMISSION_GAP: 600, // Gap that signals end of complete transmission
  
  // Decoder tolerance ranges (based on timing constants above)
  DECODER_TOLERANCE: {
    DOT_MIN: 80,         // DOT_DURATION - 40ms tolerance
    DOT_MAX: 160,        // DOT_DURATION + 40ms tolerance
    DASH_MIN: 280,       // DASH_DURATION - 80ms tolerance  
    DASH_MAX: 440,       // DASH_DURATION + 80ms tolerance
    SYMBOL_GAP_MIN: 20,  // SYMBOL_GAP - 13ms tolerance
    SYMBOL_GAP_MAX: 60,  // SYMBOL_GAP + 27ms tolerance
    LETTER_GAP_MIN: 80,  // LETTER_GAP - 20ms tolerance
    LETTER_GAP_MAX: 140, // LETTER_GAP + 40ms tolerance
    END_TRANSMISSION_MIN: 500 // Minimum gap to detect transmission end
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