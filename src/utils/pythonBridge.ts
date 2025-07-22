/**
 * Python Bridge - Interface between React frontend and Python backend
 * Handles communication with the Python fiber tester logic
 */

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
   * Execute Python command and return parsed result
   */
  private async executePythonCommand(command: string, args: string[] = []): Promise<PythonResponse> {
    try {
      // In a real environment, this would call the Python script
      // For WebContainer, we'll simulate the Python logic in TypeScript
      return await this.simulatePythonLogic(command, args);
    } catch (error) {
      return {
        success: false,
        message: `Python execution error: ${error}`,
        status: 'error'
      };
    }
  }
  
  /**
   * Simulate Python logic in TypeScript for WebContainer compatibility
   */
  private async simulatePythonLogic(command: string, args: string[]): Promise<PythonResponse> {
    // This simulates the Python FiberTesterController logic
    const morseCode: { [key: string]: string } = {
      'R': '·−·',
      'G': '−−·',
      'B': '−···',
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
    
    const DOT_DURATION = 100;
    const DASH_DURATION = 300;
    const SYMBOL_GAP = 100;
    const LETTER_GAP = 300;
    const CONFIRMATION_FLASH = 500;
    
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
        
        // Generate transmission sequence
        const sequence: TransmissionStep[] = [];
        
        // Add color transmission
        const colorLetter = selectedColor[0].toUpperCase();
        const colorPattern = morseCode[colorLetter];
        sequence.push(...this.patternToSequence(colorPattern, 'color', colorLetter, DOT_DURATION, DASH_DURATION, SYMBOL_GAP));
        sequence.push({
          type: 'gap',
          duration: LETTER_GAP,
          description: 'Letter gap'
        });
        
        // Add number transmission
        for (const digit of selectedNumber) {
          const digitPattern = morseCode[digit];
          sequence.push(...this.patternToSequence(digitPattern, 'digit', digit, DOT_DURATION, DASH_DURATION, SYMBOL_GAP));
          sequence.push({
            type: 'gap',
            duration: LETTER_GAP,
            description: `Gap after digit ${digit}`
          });
        }
        
        // Add confirmation flash
        sequence.push({
          type: 'confirmation',
          duration: CONFIRMATION_FLASH,
          description: 'Confirmation flash'
        });
        
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
      
      // Add symbol gap (except after last symbol)
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
  
  /**
   * Set the selected color
   */
  public async setColor(color: string): Promise<PythonResponse> {
    return await this.executePythonCommand('set_color', [color]);
  }
  
  /**
   * Set the number for transmission
   */
  public async setNumber(number: string): Promise<PythonResponse> {
    return await this.executePythonCommand('set_number', [number]);
  }
  
  /**
   * Prepare transmission and get sequence
   */
  public async prepareTransmission(color: string, number: string): Promise<PythonResponse> {
    return await this.executePythonCommand('prepare', [color, number]);
  }
  
  /**
   * Complete transmission
   */
  public async completeTransmission(color: string, number: string): Promise<PythonResponse> {
    return await this.executePythonCommand('complete', [color, number]);
  }
  
  /**
   * Clear current selection
   */
  public async clearSelection(): Promise<PythonResponse> {
    return await this.executePythonCommand('clear');
  }
  
  /**
   * Get current system status
   */
  public async getStatus(): Promise<PythonResponse> {
    return await this.executePythonCommand('status');
  }
}

export default PythonBridge;