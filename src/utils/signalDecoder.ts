/**
 * Signal Decoder - EXACT MATHEMATICAL DECODING
 * Zero tolerance, zero probability, exact science only
 */
import { MORSE_TIMING, PATTERN_TO_CHAR } from './morseTimingConfig';

export interface DecodedSignal {
  color: string;
  number: string;
  confidence: 1.0; // Always 1.0 - exact match or rejection
  rawPattern: string;
  timestamp: number;
  decodingSteps: DecodingStep[];
}

export interface DecodingStep {
  step: string;
  pattern: string;
  interpretation: string;
  confidence: 1.0; // Always 1.0 - exact match or rejection
}

export interface SignalPulse {
  type: 'pulse' | 'gap';
  duration: number;
  timestamp: number;
}

class SignalDecoder {
  private static instance: SignalDecoder;
  
  // EXACT timing constants - zero tolerance
  private readonly timing = MORSE_TIMING;
  private readonly tolerance = MORSE_TIMING.DECODER_TOLERANCE;
  private readonly morseToChar = PATTERN_TO_CHAR;
  
  private pulseBuffer: SignalPulse[] = [];
  private latestDecoded: DecodedSignal | null = null;
  private lastPulseTime = 0;
  
  private constructor() {}
  
  public static getInstance(): SignalDecoder {
    if (!SignalDecoder.instance) {
      SignalDecoder.instance = new SignalDecoder();
    }
    return SignalDecoder.instance;
  }
  
  /**
   * Process incoming signal pulse - EXACT TIMING ONLY
   */
  public processPulse(duration: number): void {
    this.lastPulseTime = Date.now();
    const pulse: SignalPulse = {
      type: 'pulse',
      duration,
      timestamp: Date.now()
    };
    
    this.pulseBuffer.push(pulse);
  }
  
  /**
   * Process gap between pulses - EXACT TIMING ONLY
   */
  public processGap(duration: number): void {
    this.lastPulseTime = Date.now();
    const gap: SignalPulse = {
      type: 'gap',
      duration,
      timestamp: Date.now()
    };
    
    this.pulseBuffer.push(gap);
    
    // Check for end-of-transmission - EXACT match only
    if (duration === this.tolerance.END_TRANSMISSION_MIN) {
      this.attemptDecoding();
    }
  }
  
  /**
   * Check for transmission end - EXACT TIMING
   */
  public checkForTransmissionEnd(): void {
    const now = Date.now();
    const timeSinceLastPulse = now - this.lastPulseTime;
    
    // EXACT timing check - no approximation
    if (timeSinceLastPulse >= this.tolerance.END_TRANSMISSION_MIN && this.pulseBuffer.length > 0) {
      this.attemptDecoding();
    }
  }
  
  /**
   * Attempt decoding - EXACT MATHEMATICAL PRECISION REQUIRED
   */
  private attemptDecoding(): void {
    if (this.pulseBuffer.length === 0) return;
    
    const decodingSteps: DecodingStep[] = [];
    
    // Step 1: Convert pulses to morse pattern - EXACT ONLY
    const { pattern, isValid } = this.pulsesToMorsePattern(this.pulseBuffer);
    
    if (!isValid) {
      this.pulseBuffer = [];
      return; // REJECT - not exact match
    }
    
    decodingSteps.push({
      step: 'Pulse Analysis',
      pattern: pattern,
      interpretation: `EXACT: Converted ${this.pulseBuffer.length} pulses to morse pattern`,
      confidence: 1.0
    });
    
    // Step 2: Split pattern into segments - EXACT
    const segments = this.splitMorsePattern(pattern);
    
    if (segments.length === 0) {
      this.pulseBuffer = [];
      return; // REJECT
    }
    
    decodingSteps.push({
      step: 'Pattern Segmentation',
      pattern: segments.join(' | '),
      interpretation: `EXACT: Identified ${segments.length} morse segments`,
      confidence: 1.0
    });
    
    // Step 3: Decode segments - EXACT ONLY
    const decoded = this.decodeSegmentsExact(segments);
    
    if (!decoded.isValid) {
      this.pulseBuffer = [];
      return; // REJECT
    }
    
    decodingSteps.push({
      step: 'Character Decoding',
      pattern: decoded.chars.join(''),
      interpretation: `EXACT: Decoded to: ${decoded.chars.join('')}`,
      confidence: 1.0
    });
    
    // Step 4: Interpret as color + number - EXACT ONLY
    const interpretation = this.interpretMessageExact(decoded.chars);
    
    if (!interpretation.isValid) {
      this.pulseBuffer = [];
      return; // REJECT
    }
    
    decodingSteps.push({
      step: 'Message Interpretation',
      pattern: interpretation.color + ' ' + interpretation.number,
      interpretation: `EXACT: Color: ${interpretation.color}, Number: ${interpretation.number}`,
      confidence: 1.0
    });
    
    // EXACT result - 100% confidence or rejection
    const result: DecodedSignal = {
      color: interpretation.color!,
      number: interpretation.number!,
      confidence: 1.0, // Always exact or rejected
      rawPattern: pattern,
      timestamp: Date.now(),
      decodingSteps
    };
    
    this.pulseBuffer = [];
    this.emitDecodedSignal(result);
  }
  
  /**
   * Convert pulse sequence to morse pattern - EXACT MATCHING ONLY
   */
  private pulsesToMorsePattern(pulses: SignalPulse[]): { pattern: string; isValid: boolean } {
    let pattern = '';
    let isValid = true;
    
    for (const pulse of pulses) {
      if (pulse.type === 'pulse') {
        // EXACT timing requirements - zero tolerance
        if (pulse.duration === this.tolerance.DOT_MIN) {
          pattern += '·';
        } else if (pulse.duration === this.tolerance.DASH_MIN) {
          pattern += '−';
        } else {
          // REJECT - not exact match
          isValid = false;
          break;
        }
      } else if (pulse.type === 'gap') {
        if (pulse.duration === this.tolerance.LETTER_GAP_MIN) {
          pattern += ' '; // Letter separator
        } else if (pulse.duration === this.tolerance.END_TRANSMISSION_MIN) {
          // End transmission - expected
        } else {
          // REJECT - not exact match
          isValid = false;
          break;
        }
      }
    }
    
    return { pattern, isValid };
  }
  
  /**
   * Split morse pattern into segments
   */
  private splitMorsePattern(pattern: string): string[] {
    return pattern.split(' ').filter(segment => segment.length > 0);
  }
  
  /**
   * Decode morse segments - EXACT MATCHING ONLY
   */
  private decodeSegmentsExact(segments: string[]): { chars: string[]; isValid: boolean } {
    const chars: string[] = [];
    let isValid = true;
    
    for (const segment of segments) {
      const char = this.morseToChar[segment];
      if (char) {
        chars.push(char);
      } else {
        // REJECT - no exact match
        isValid = false;
        break;
      }
    }
    
    return { chars, isValid };
  }
  
  /**
   * Interpret decoded characters - EXACT VALIDATION ONLY
   */
  private interpretMessageExact(chars: string[]): { color?: string; number?: string; isValid: boolean } {
    if (chars.length === 0) {
      return { isValid: false };
    }
    
    let color: string | undefined;
    let number: string | undefined;
    let isValid = true;
    
    // First character MUST be exact color match
    const firstChar = chars[0];
    
    if (firstChar === 'R') {
      color = 'Red';
    } else if (firstChar === 'G') {
      color = 'Green';
    } else if (firstChar === 'B') {
      color = 'Blue';
    } else {
      // REJECT - not exact color
      isValid = false;
    }
    
    // Remaining characters MUST be exact digits
    const numberChars = chars.slice(1);
    if (numberChars.length > 0) {
      const numberStr = numberChars.join('');
      const isValidNumber = /^[0-9]+$/.test(numberStr);
      
      if (isValidNumber) {
        const num = parseInt(numberStr);
        if (num >= 0 && num <= 100) {
          number = numberStr;
        } else {
          // REJECT - out of range
          isValid = false;
        }
      } else {
        // REJECT - not numeric
        isValid = false;
      }
    } else {
      // REJECT - no number
      isValid = false;
    }
    
    return { color, number, isValid };
  }
  
  /**
   * Emit decoded signal
   */
  private emitDecodedSignal(signal: DecodedSignal): void {
    this.latestDecoded = signal;
  }
  
  /**
   * Simulate transmission - EXACT MATHEMATICAL SIMULATION
   */
  public simulateTransmission(color: string, number: string): DecodedSignal | null {
    this.pulseBuffer = [];
    this.latestDecoded = null;
    
    // Generate EXACT pulse sequence
    const colorLetter = color[0].toUpperCase();
    
    // Add color pattern - EXACT
    const colorPattern = Object.keys(PATTERN_TO_CHAR).find(k => PATTERN_TO_CHAR[k] === colorLetter);
    if (colorPattern) {
      this.addPatternToPulseBuffer(colorPattern);
      this.processGap(this.timing.LETTER_GAP);
    }
    
    // Add number patterns - EXACT
    for (const digit of number) {
      const digitPattern = Object.keys(PATTERN_TO_CHAR).find(k => PATTERN_TO_CHAR[k] === digit);
      if (digitPattern) {
        this.addPatternToPulseBuffer(digitPattern);
        this.processGap(this.timing.LETTER_GAP);
      }
    }
    
    // Process confirmation flash - EXACT
    this.processPulse(this.timing.CONFIRMATION_FLASH);
    
    // Add end-of-transmission gap - EXACT
    this.processGap(this.timing.END_TRANSMISSION_GAP);
    
    return this.latestDecoded;
  }
  
  /**
   * Get latest decoded signal
   */
  public getLatestDecoded(): DecodedSignal | null {
    const result = this.latestDecoded;
    this.latestDecoded = null;
    return result;
  }
  
  /**
   * Add morse pattern to pulse buffer - EXACT TIMING
   */
  private addPatternToPulseBuffer(pattern: string): void {
    for (let i = 0; i < pattern.length; i++) {
      const symbol = pattern[i];
      
      if (symbol === '·') {
        this.processPulse(this.timing.DOT_DURATION);
      } else if (symbol === '−') {
        this.processPulse(this.timing.DASH_DURATION);
      }
      // NO gaps between symbols within same letter - continuous transmission
    }
  }
  
  /**
   * Get current status
   */
  public getStatus(): { isDecoding: boolean; bufferSize: number } {
    return {
      isDecoding: false,
      bufferSize: this.pulseBuffer.length
    };
  }
  
  /**
   * Clear buffer
   */
  public clearBuffer(): void {
    this.pulseBuffer = [];
  }
}

export default SignalDecoder;