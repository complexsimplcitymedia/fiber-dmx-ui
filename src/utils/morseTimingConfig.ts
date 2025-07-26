/**
 * Morse Code Timing Configuration
 * Shared constants between transmitter and decoder to ensure perfect synchronization
 */

export const MORSE_TIMING = {
  // Basic pulse durations (in milliseconds)
  DOT_DURATION: 1200,
  DASH_DURATION: 3600,
  
  // Gap durations
  SYMBOL_GAP: 330,        // Gap between dots/dashes within a letter
  LETTER_GAP: 1000,       // Gap between letters
  CONFIRMATION_FLASH: 1670, // Duration of confirmation pulse
  END_TRANSMISSION_GAP: 6000, // Gap that signals end of complete transmission
  
  // Decoder tolerance ranges (based on timing constants above)
  DECODER_TOLERANCE: {
    DOT_MIN: 800,         // DOT_DURATION - 400ms tolerance
    DOT_MAX: 1600,        // DOT_DURATION + 400ms tolerance
    DASH_MIN: 2800,       // DASH_DURATION - 800ms tolerance  
    DASH_MAX: 4400,       // DASH_DURATION + 800ms tolerance
    SYMBOL_GAP_MIN: 200,  // SYMBOL_GAP - 130ms tolerance
    SYMBOL_GAP_MAX: 600,  // SYMBOL_GAP + 270ms tolerance
    LETTER_GAP_MIN: 800,  // LETTER_GAP - 200ms tolerance
    LETTER_GAP_MAX: 1400, // LETTER_GAP + 400ms tolerance
    END_TRANSMISSION_MIN: 5000 // Minimum gap to detect transmission end
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