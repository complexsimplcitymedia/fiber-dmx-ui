/**
 * Morse Code Timing Configuration - ZERO TOLERANCE PRECISION
 * GPS-disciplined oscillators maintain atomic-level accuracy
 * Any deviation from these exact values = system failure
 */

// ZERO TOLERANCE TIMING - Atomic precision required
export const MORSE_TIMING = {
  // Core Morse timing - mathematically exact
  DOT_DURATION: 120,           // 120ms exactly - no tolerance
  DASH_DURATION: 360,          // 360ms exactly - no tolerance  
  SYMBOL_GAP: 120,             // 120ms exactly - no tolerance
  LETTER_GAP: 840,             // 840ms exactly - no tolerance
  CONFIRMATION_FLASH: 1000,    // 1000ms exactly - no tolerance
  END_TRANSMISSION_GAP: 2000,  // 2000ms exactly - no tolerance
  
  // Decoder tolerance - ZERO drift acceptable
  DECODER_TOLERANCE: {
    DOT_MIN: 120,              // Exact match required
    DOT_MAX: 120,              // Zero tolerance
    DASH_MIN: 360,             // Exact match required  
    DASH_MAX: 360,             // Zero tolerance
    SYMBOL_GAP_MIN: 120,       // Exact match required
    SYMBOL_GAP_MAX: 120,       // Zero tolerance
    LETTER_GAP_MIN: 840,       // Exact match required
    LETTER_GAP_MAX: 840,       // Zero tolerance
    END_TRANSMISSION_MIN: 2000, // Exact match required
    END_TRANSMISSION_MAX: 2000  // Zero tolerance
  }
};

// Morse code patterns - International standard
export const MORSE_PATTERNS: { [key: string]: string } = {
  // Colors
  'R': '·−·',    // Red
  'G': '−−·',    // Green  
  'B': '−···',   // Blue
  
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

// Pattern to character lookup - reverse mapping
export const PATTERN_TO_CHAR: { [key: string]: string } = {
  '·−·': 'R',
  '−−·': 'G', 
  '−···': 'B',
  '−−−−−': '0',
  '·−−−−': '1',
  '··−−−': '2',
  '···−−': '3',
  '····−': '4',
  '·····': '5',
  '−····': '6',
  '−−···': '7',
  '−−−··': '8',
  '−−−−·': '9'
};

// GPS-disciplined timekeeping constants
export const TIMEKEEPING_PRECISION = {
  GPS_REFERENCE: true,           // GPS atomic time reference
  DRIFT_TOLERANCE: 0,            // Zero drift acceptable
  SYNC_ACCURACY: 'nanosecond',   // Nanosecond-level precision
  OSCILLATOR_TYPE: 'GPS-disciplined', // Professional grade
  TEMPERATURE_COMPENSATION: true, // TCXO required
  AGING_COMPENSATION: true       // Long-term stability
};