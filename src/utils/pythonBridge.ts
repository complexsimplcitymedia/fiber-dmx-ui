/**
 * Python Bridge - EXACT MATHEMATICAL INTERFACE
 * Zero delays, zero probability, exact science only
 */
import { MORSE_TIMING, MORSE_PATTERNS } from './morseTimingConfig';

export interface PythonResponse {
  success: boolean;
  message: string;
  status: string;
  color?: string;
  number?: string;
  sequence?: TransmissionStep[];
  total_duration?: number;
  history?: string[];
  ready_to_send?: boolean;
  is_transmitting?: boolean;
}

export interface TransmissionStep {
  type: 'dot' | 'dash' | 'gap' | 'confirmation';
  duration: number;
  sequence_type?: string;
  value?: string;
  description: string;
}

class PythonBridge {
  private static instance: PythonBridge;
  
  private constructor() {}
  
  public static getInstance(): PythonBridge {
    if (!PythonBridge.instance) {
      PythonBridge.instance = new PythonBridge();
    }
    return PythonBridge.instance;
  }
  
  /**
   * Execute Python command - EXACT MATHEMATICAL LOGIC
   */
  private async executePythonCommand(command: string, args: string[] = []): Promise<PythonResponse> {
    // EXACT simulation - no delays, no errors, mathematical precision
    return this.simulatePythonLogic(command, args);
  }
  
  /**
   * Simulate Python logic - EXACT MATHEMATICAL IMPLEMENTATION
   */
  private simulatePythonLogic(command: string, args: string[]): PythonResponse {
    const { DOT_DURATION, DASH_DURATION, SYMBOL_GAP, LETTER_GAP, CONFIRMATION_FLASH, END_TRANSMISSION_GAP } = MORSE_TIMING;
    
    switch (command) {
      case 'set_color':
        const color = args[0];
        if (!['Red', 'Green', 'Blue'].includes(color)) {
          return {
            success: false,
            message: `Invalid color: ${color}. Must be Red, Green, or Blue.`,
            status: 'error'
          };
        }
        return {
          success: true,
          message: `${color} selected - Enter number`,
          status: 'color_selected',
          color: color
        };
        
      case 'set_number':
        const number = args[0];
        const num = parseInt(number);
        if (isNaN(num) || num < 0 || num > 100) {
          return {
            success: false,
            message: `Invalid number: ${number}. Must be 0-100.`,
            status: 'error'
          };
        }
        return {
          success: true,
          message: `Number ${number} set`,
          status: 'number_set',
          number: number
        };
        
      case 'prepare':
        const selectedColor = args[0];
        const selectedNumber = args[1];
        
        if (!selectedColor || !selectedNumber) {
          return {
            success: false,
            message: 'Color and number required',
            status: 'error'
          };
        }
        
        // Generate EXACT transmission sequence - mathematical precision
        const sequence: TransmissionStep[] = [];
        
        // Add color transmission - EXACT
        const colorLetter = selectedColor[0].toUpperCase();
        const colorPattern = MORSE_PATTERNS[colorLetter];
        sequence.push(...this.patternToSequence(colorPattern, 'color', colorLetter, DOT_DURATION, DASH_DURATION, SYMBOL_GAP));
        sequence.push({
          type: 'gap',
          duration: LETTER_GAP,
          description: 'Letter gap'
        });
        
        // Add number transmission - EXACT
        for (const digit of selectedNumber) {
          const digitPattern = MORSE_PATTERNS[digit];
          sequence.push(...this.patternToSequence(digitPattern, 'digit', digit, DOT_DURATION, DASH_DURATION, SYMBOL_GAP));
          sequence.push({
            type: 'gap',
            duration: LETTER_GAP,
            description: `Gap after digit ${digit}`
          });
        }
        
        // Add confirmation flash - EXACT
        sequence.push({
          type: 'confirmation',
          duration: CONFIRMATION_FLASH,
          description: 'Confirmation flash'
        });
        
        // Add end-of-transmission gap - EXACT
        sequence.push({
          type: 'gap',
          duration: END_TRANSMISSION_GAP,
          description: 'End of transmission'
        });
        
        // EXACT mathematical calculation - no approximation
        const totalDuration = sequence.reduce((sum, step) => sum + step.duration, 0);
        
        return {
          success: true,
          message: `Transmitting ${selectedColor} ${selectedNumber}...`,
          status: 'transmitting',
          color: selectedColor,
          number: selectedNumber,
          sequence: sequence,
          total_duration: totalDuration
        };
        
      case 'complete':
        return {
          success: true,
          message: `${args[0]} ${args[1]} sent`,
          status: 'completed',
          history: [`${args[0]} ${args[1]} sent`]
        };
        
      case 'clear':
        return {
          success: true,
          message: 'Select color and number',
          status: 'cleared'
        };
        
      default:
        return {
          success: false,
          message: `Unknown command: ${command}`,
          status: 'error'
        };
    }
  }
  
  /**
   * Convert pattern to sequence - EXACT MATHEMATICAL CONVERSION
   */
  private patternToSequence(
    pattern: string, 
    seqType: string, 
    value: string,
    dotDuration: number,
    dashDuration: number,
    symbolGap: number
  ): TransmissionStep[] {
    const sequence: TransmissionStep[] = [];
    
    for (let i = 0; i < pattern.length; i++) {
      const symbol = pattern[i];
      
      if (symbol === '·') {
        sequence.push({
          type: 'dot',
          duration: dotDuration,
          sequence_type: seqType,
          value: value,
          description: `Dot (${seqType})`
        });
      } else if (symbol === '−') {
        sequence.push({
          type: 'dash',
          duration: dashDuration,
          sequence_type: seqType,
          value: value,
          description: `Dash (${seqType})`
        });
      }
      
      // Add symbol gap - EXACT (except after last symbol)
      if (i < pattern.length - 1) {
        sequence.push({
          type: 'gap',
          duration: symbolGap,
          description: 'Symbol gap'
        });
      }
    }
    
    return sequence;
  }
  
  // Public interface methods - EXACT
  public async setColor(color: string): Promise<PythonResponse> {
    return this.executePythonCommand('set_color', [color]);
  }
  
  public async setNumber(number: string): Promise<PythonResponse> {
    return this.executePythonCommand('set_number', [number]);
  }
  
  public async prepareTransmission(color: string, number: string): Promise<PythonResponse> {
    return this.executePythonCommand('prepare', [color, number]);
  }
  
  public async completeTransmission(color: string, number: string): Promise<PythonResponse> {
    return this.executePythonCommand('complete', [color, number]);
  }
  
  public async clearSelection(): Promise<PythonResponse> {
    return this.executePythonCommand('clear');
  }
  
  public async getStatus(): Promise<PythonResponse> {
    return this.executePythonCommand('status');
  }
}

export default PythonBridge;