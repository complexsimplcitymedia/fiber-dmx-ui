/**
 * Signal Decoder - Decodes Morse code transmissions back to color/number pairs
 * Handles timing analysis and pattern matching for fiber optic signals
 */
import { MORSE_TIMING, PATTERN_TO_CHAR } from './morseTimingConfig';

export interface DecodedSignal {
  color?: string;
  number?: string;
  confidence: number;
  rawPattern: string;
  timestamp: number;
  decodingSteps: DecodingStep[];
}

export interface DecodingStep {
  step: string;
  pattern: string;
  interpretation: string;
  confidence: number;
}

export interface SignalPulse {
  type: 'pulse' | 'gap';
  duration: number;
  timestamp: number;
}

class SignalDecoder {
  private static instance: SignalDecoder;
  
  // Use shared timing constants for perfect sync
  private readonly timing = MORSE_TIMING;
  private readonly tolerance = MORSE_TIMING.DECODER_TOLERANCE;
  private readonly morseToChar = PATTERN_TO_CHAR;
  
  private pulseBuffer: SignalPulse[] = [];
  private isDecoding = false;
  private decodingTimeout: NodeJS.Timeout | null = null;
  private latestDecoded: DecodedSignal | null = null;
  private lastPulseTime = 0;
  private readonly TRANSMISSION_END_GAP = this.tolerance.END_TRANSMISSION_MIN;
  
  private constructor() {}
  
  public static getInstance(): SignalDecoder {
    if (!SignalDecoder.instance) {
      SignalDecoder.instance = new SignalDecoder();
    }
    return SignalDecoder.instance;
  }
  
  /**
   * Process incoming signal pulse
   */
  public processPulse(duration: number): void {
    this.lastPulseTime = Date.now();
    const pulse: SignalPulse = {
      type: 'pulse',
      duration,
      timestamp: Date.now()
    };
    
    this.pulseBuffer.push(pulse);
    // Don't decode immediately - wait for end of transmission signal
  }
  
  /**
   * Process gap between pulses
   */
  public processGap(duration: number): void {
    this.lastPulseTime = Date.now();
    const gap: SignalPulse = {
      type: 'gap',
      duration,
      timestamp: Date.now()
    };
    
    this.pulseBuffer.push(gap);
    
    // Check if this is an end-of-transmission gap
    if (duration >= this.tolerance.END_TRANSMISSION_MIN) {
      // Wait for a clear "end of pattern" signal (like a long pause or special marker)
      // Only decode and update the UI after this end signal is detected
      this.attemptDecoding();
    }
  }
  
  /**
   * Check for transmission end based on time gap
   */
  public checkForTransmissionEnd(): void {
    const now = Date.now();
    const timeSinceLastPulse = now - this.lastPulseTime;
    
    // If enough time has passed since last pulse, consider transmission complete
    if (timeSinceLastPulse >= this.tolerance.END_TRANSMISSION_MIN && this.pulseBuffer.length > 0) {
      // Wait for a clear "end of pattern" signal (like a long pause or special marker)
      // Only decode and update the UI after this end signal is detected
      this.attemptDecoding();
    }
  }
  
  /**
   * Attempt to decode the current pulse buffer
   */
  private attemptDecoding(): void {
    if (this.pulseBuffer.length === 0) return null;
    
    console.log('=== PROFESSIONAL DECODE - 100% RELIABILITY REQUIRED ===');
    console.log('Buffer contains:', this.pulseBuffer.length, 'elements');
    
    const decodingSteps: DecodingStep[] = [];
    
    // CRITICAL: Professional equipment requires 100% confidence or FAILURE
    // No guessing, no "maybe" - either we know for certain or we reject
    
    // Step 1: Convert pulses to morse pattern
    const { pattern, isValid } = this.pulsesToMorsePattern(this.pulseBuffer);
    
    if (!isValid) {
      console.log('DECODE REJECTED: Invalid pulse timing detected');
      this.pulseBuffer = [];
      return; // Reject completely - don't show anything
    }
    
    decodingSteps.push({
      step: 'Pulse Analysis',
      pattern: pattern,
      interpretation: `VALID: Converted ${this.pulseBuffer.length} pulses to morse pattern`,
      confidence: 1.0
    });
    
    // Step 2: Split pattern into segments (color + digits)
    const segments = this.splitMorsePattern(pattern);
    
    if (segments.length === 0) {
      console.log('DECODE REJECTED: No valid morse segments found');
      this.pulseBuffer = [];
      return; // Reject completely
    }
    
    decodingSteps.push({
      step: 'Pattern Segmentation',
      pattern: segments.join(' | '),
      interpretation: `VALID: Identified ${segments.length} morse segments`,
      confidence: 1.0
    });
    
    // Step 3: Decode segments
    const decoded = this.decodeSegmentsProfessional(segments);
    
    if (!decoded.isValid) {
      console.log('DECODE REJECTED: Could not decode all segments with 100% confidence');
      this.pulseBuffer = [];
      return; // Reject completely
    }
    
    decodingSteps.push({
      step: 'Character Decoding',
      pattern: decoded.chars.join(''),
      interpretation: `VALID: Decoded to: ${decoded.chars.join('')}`,
      confidence: 1.0
    });
    
    // Step 4: Interpret as color + number
    const interpretation = this.interpretMessageProfessional(decoded.chars);
    
    if (!interpretation.isValid) {
      console.log('DECODE REJECTED: Could not interpret as valid color/number combination');
      this.pulseBuffer = [];
      return; // Reject completely
    }
    
    decodingSteps.push({
      step: 'Message Interpretation',
      pattern: interpretation.color + ' ' + interpretation.number,
      interpretation: `VALID: Color: ${interpretation.color}, Number: ${interpretation.number}`,
      confidence: 1.0
    });
    
    // If we get here, we have 100% confidence in the result
    console.log('DECODE SUCCESS: 100% confidence result');
    
    const result: DecodedSignal = {
      color: interpretation.color,
      number: interpretation.number,
      confidence: 1.0, // Always 100% or we don't show it
      rawPattern: pattern,
      timestamp: Date.now(),
      decodingSteps
    };
    
    // Clear buffer after decoding
    this.pulseBuffer = [];
    
    // Emit the decoded result immediately
    this.emitDecodedSignal(result);
  }
  
  /**
   * Emit decoded signal to listeners
   */
  private emitDecodedSignal(signal: DecodedSignal): void {
    // For now, store in a results array that the UI can poll
    // In a real system, this would be an event emitter
    this.latestDecoded = signal;
  }
  
  /**
   * Convert pulse sequence to morse pattern
   */
  private pulsesToMorsePattern(pulses: SignalPulse[]): { pattern: string; isValid: boolean } {
    let pattern = '';
    let isValid = true;
    
    console.log('=== DECODER ANALYSIS ===');
    console.log('Processing pulses:', pulses.map(p => `${p.type}(${p.duration}ms)`).join(' -> '));
    
    for (const pulse of pulses) {
      if (pulse.type === 'pulse') {
        // STRICT timing requirements - no fuzzy matching
        if (pulse.duration >= this.tolerance.DOT_MIN && pulse.duration <= this.tolerance.DOT_MAX) {
          console.log(`  ${pulse.duration}ms -> DOT (range: ${this.tolerance.DOT_MIN}-${this.tolerance.DOT_MAX})`);
          pattern += '·';
        } else if (pulse.duration >= this.tolerance.DASH_MIN && pulse.duration <= this.tolerance.DASH_MAX) {
          console.log(`  ${pulse.duration}ms -> DASH (range: ${this.tolerance.DASH_MIN}-${this.tolerance.DASH_MAX})`);
          pattern += '−';
        } else {
          // REJECT: Timing outside acceptable range
          console.log(`  ${pulse.duration}ms -> INVALID TIMING - REJECTING ENTIRE SIGNAL`);
          isValid = false;
          break;
        }
      } else if (pulse.type === 'gap') {
        if (pulse.duration >= this.tolerance.LETTER_GAP_MIN && pulse.duration <= this.tolerance.LETTER_GAP_MAX) {
          console.log(`  ${pulse.duration}ms -> LETTER_GAP (range: ${this.tolerance.LETTER_GAP_MIN}-${this.tolerance.LETTER_GAP_MAX})`);
          pattern += ' '; // Letter separator
        } else if (pulse.duration >= this.tolerance.END_TRANSMISSION_MIN) {
          console.log(`  ${pulse.duration}ms -> END_TRANSMISSION_GAP`);
          // This is expected - don't add to pattern
        } else if (pulse.duration >= this.tolerance.SYMBOL_GAP_MIN && pulse.duration <= this.tolerance.SYMBOL_GAP_MAX) {
          console.log(`  ${pulse.duration}ms -> SYMBOL_GAP (ignored in pattern)`);
          // Symbol gaps are ignored in pattern
        } else {
          // REJECT: Gap timing outside acceptable range
          console.log(`  ${pulse.duration}ms -> INVALID GAP TIMING - REJECTING ENTIRE SIGNAL`);
          isValid = false;
          break;
        }
      }
    }
    
    console.log(`Final decoded pattern: "${pattern}"`);
    console.log(`Pattern validity: ${isValid ? 'VALID' : 'INVALID'}`);
    
    return { 
      pattern, 
      isValid
    };
  }
  
  /**
   * Split morse pattern into individual character segments
   */
  private splitMorsePattern(pattern: string): string[] {
    return pattern.split(' ').filter(segment => segment.length > 0);
  }
  
  /**
   * Decode morse segments to characters - PROFESSIONAL VERSION (100% or reject)
   */
  private decodeSegmentsProfessional(segments: string[]): { chars: string[]; isValid: boolean } {
    const chars: string[] = [];
    let isValid = true;
    
    for (const segment of segments) {
      const char = this.morseToChar[segment];
      if (char) {
        chars.push(char);
        console.log(`  Segment "${segment}" -> "${char}" (EXACT MATCH)`);
      } else {
        // NO FUZZY MATCHING - either exact match or reject
        console.log(`  Segment "${segment}" -> NO EXACT MATCH - REJECTING`);
        isValid = false;
        break;
      }
    }
    
    return {
      chars,
      isValid
    };
  }
  
  /**
   * Fuzzy matching for corrupted morse patterns
   */
  private fuzzyMorseMatch(pattern: string): { char: string; confidence: number } | null {
    let bestMatch: { char: string; confidence: number } | null = null;
    
    for (const [morsePattern, char] of Object.entries(this.morseToChar)) {
      const similarity = this.calculateSimilarity(pattern, morsePattern);
      if (similarity > 0.6 && (!bestMatch || similarity > bestMatch.confidence)) {
        bestMatch = { char, confidence: similarity * 0.8 }; // Reduce confidence for fuzzy matches
      }
    }
    
    return bestMatch;
  }
  
  /**
   * Calculate similarity between two morse patterns
   */
  private calculateSimilarity(pattern1: string, pattern2: string): number {
    if (pattern1 === pattern2) return 1.0;
    
    const maxLength = Math.max(pattern1.length, pattern2.length);
    if (maxLength === 0) return 1.0;
    
    let matches = 0;
    const minLength = Math.min(pattern1.length, pattern2.length);
    
    for (let i = 0; i < minLength; i++) {
      if (pattern1[i] === pattern2[i]) {
        matches++;
      }
    }
    
    return matches / maxLength;
  }
  
  /**
   * Interpret decoded characters as color + number message - PROFESSIONAL VERSION
   */
  private interpretMessageProfessional(chars: string[]): { color?: string; number?: string; isValid: boolean } {
    if (chars.length === 0) {
      return { isValid: false };
    }
    
    let color: string | undefined;
    let number: string | undefined;
    let isValid = true;
    
    // First character MUST be color - CRITICAL for technicians
    const firstChar = chars[0];
    
    // ONLY exact matches allowed
    if (firstChar === 'R') {
      color = 'Red';
      console.log(`  Color: R -> Red (EXACT MATCH)`);
    } else if (firstChar === 'G') {
      color = 'Green';
      console.log(`  Color: G -> Green (EXACT MATCH)`);
    } else if (firstChar === 'B') {
      color = 'Blue';
      console.log(`  Color: B -> Blue (EXACT MATCH)`);
    } else {
      // NO GUESSING - color must be exact or reject
      console.log(`  Color: ${firstChar} -> INVALID COLOR - REJECTING`);
      isValid = false;
    }
    
    // Remaining characters MUST be valid digits
    const numberChars = chars.slice(1);
    if (numberChars.length > 0) {
      const numberStr = numberChars.join('');
      const isValidNumber = /^[0-9]+$/.test(numberStr);
      
      if (isValidNumber) {
        const num = parseInt(numberStr);
        if (num >= 0 && num <= 100) {
          number = numberStr;
          console.log(`  Number: ${numberStr} -> VALID (0-100 range)`);
        } else {
          console.log(`  Number: ${numberStr} -> OUT OF RANGE (0-100) - REJECTING`);
          isValid = false;
        }
      } else {
        console.log(`  Number: ${numberStr} -> NON-NUMERIC - REJECTING`);
        isValid = false;
      }
    } else {
      console.log(`  Number: MISSING - REJECTING`);
      isValid = false;
    }
    
    return { color, number, isValid };
  }
  
  /**
   * Force decode a morse pattern as a color (R, G, or B) with fuzzy matching
   */
  private forceDecodeAsColor(morsePattern: string): { color: string; confidence: number } | null {
    const colorPatterns = {
      '·−·': { color: 'Red', char: 'R' },     // R = dot-dash-dot
      '−−·': { color: 'Green', char: 'G' },   // G = dash-dash-dot  
      '−···': { color: 'Blue', char: 'B' }    // B = dash-dot-dot-dot
    };
    
    // Try exact match first
    if (colorPatterns[morsePattern]) {
      return { color: colorPatterns[morsePattern].color, confidence: 0.95 };
    }
    
    // Try fuzzy matching with higher tolerance for colors
    let bestMatch: { color: string; confidence: number } | null = null;
    
    for (const [pattern, info] of Object.entries(colorPatterns)) {
      const similarity = this.calculateSimilarity(morsePattern, pattern);
      
      // Be more lenient with color matching - even 50% similarity is acceptable
      if (similarity > 0.5 && (!bestMatch || similarity > bestMatch.confidence)) {
        bestMatch = { 
          color: info.color, 
          confidence: similarity * 0.8 // Reduce confidence but still accept it
        };
      }
    }
    
    return bestMatch;
  }
  
  /**
   * Get the original morse pattern that produced a character (for debugging)
   */
  private getOriginalMorseForChar(char: string): string {
    // Reverse lookup in morse table
    for (const [pattern, decodedChar] of Object.entries(this.morseToChar)) {
      if (decodedChar === char) {
        return pattern;
      }
    }
    return '';
  }
  
  /**
   * Simulate receiving a transmission (for testing)
   */
  public simulateTransmission(color: string, number: string): DecodedSignal | null {
    // Clear any existing buffer
    this.pulseBuffer = [];
    this.latestDecoded = null;
    
    // Generate the expected pulse sequence
    const colorLetter = color[0].toUpperCase();
    
    // Add color pattern
    const colorPattern = PATTERN_TO_CHAR[colorLetter] ? Object.keys(PATTERN_TO_CHAR).find(k => PATTERN_TO_CHAR[k] === colorLetter) : undefined;
    if (colorPattern) {
      this.addPatternToPulseBuffer(colorPattern);
      this.processGap(100); // Letter gap
    }
    
    // Add number patterns
    for (const digit of number) {
      const digitPattern = Object.keys(PATTERN_TO_CHAR).find(k => PATTERN_TO_CHAR[k] === digit);
      if (digitPattern) {
        this.addPatternToPulseBuffer(digitPattern);
        this.processGap(100); // Letter gap
      }
    }
    
    // Process confirmation flash
    this.processPulse(this.timing.CONFIRMATION_FLASH);
    
    // Add end-of-transmission gap to trigger decoding
    this.processGap(this.timing.END_TRANSMISSION_GAP);
    
    // Return the latest decoded result
    return this.latestDecoded;
  }
  
  /**
   * Get the latest decoded signal (for polling)
   */
  public getLatestDecoded(): DecodedSignal | null {
    const result = this.latestDecoded;
    this.latestDecoded = null; // Clear after reading
    return result;
  }
  
  /**
   * Helper to add morse pattern to pulse buffer
   */
  private addPatternToPulseBuffer(pattern: string): void {
    for (let i = 0; i < pattern.length; i++) {
      const symbol = pattern[i];
      
      if (symbol === '·') {
        this.processPulse(this.timing.DOT_DURATION);
      } else if (symbol === '−') {
        this.processPulse(this.timing.DASH_DURATION);
      }
      
      // Add symbol gap (except after last symbol)
      if (i < pattern.length - 1) {
        this.processGap(this.timing.SYMBOL_GAP);
      }
    }
  }
  
  /**
   * Get current decoding status
   */
  public getStatus(): { isDecoding: boolean; bufferSize: number } {
    return {
      isDecoding: this.isDecoding,
      bufferSize: this.pulseBuffer.length
    };
  }
  
  /**
   * Clear the pulse buffer
   */
  public clearBuffer(): void {
    this.pulseBuffer = [];
    if (this.decodingTimeout) {
      clearTimeout(this.decodingTimeout);
      this.decodingTimeout = null;
    }
  }
}

export default SignalDecoder;