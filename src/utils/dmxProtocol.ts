/**
 * DMX-512 Protocol Implementation Over Fiber Optic
 * Professional lighting control standard at gigabit fiber speeds
 * 
 * DMX-512 Frame Structure:
 * - Break: 88μs minimum (low signal)
 * - Mark After Break (MAB): 8μs minimum (high signal)  
 * - Start Code: 8 bits (usually 0x00)
 * - Data: 512 channels × 8 bits each
 * - Mark Time Between Frames (MTBF): 0-1 second
 * 
 * At 1 Gbps fiber speed: 1 bit = 1 nanosecond
 */

export interface DMXFrame {
  startCode: number;
  channels: number[]; // 512 channels, 0-255 each
  timestamp: number;
  frameNumber: number;
}

export interface DMXTiming {
  // DMX-512 Standard Timings (converted to nanoseconds for 1Gbps)
  BREAK_TIME: number;           // 88μs = 88,000ns
  MAB_TIME: number;             // 8μs = 8,000ns  
  BIT_TIME: number;             // 4μs = 4,000ns (250kbps DMX rate)
  BYTE_TIME: number;            // 44μs = 44,000ns (11 bits: start + 8 data + 2 stop)
  FRAME_TIME: number;           // ~23ms for full 512-channel frame
  MTBF_MIN: number;             // 0ns (can be continuous)
  MTBF_MAX: number;             // 1,000,000,000ns (1 second max)
  
  // Fiber Optic Speeds
  FIBER_BIT_TIME: number;       // 1ns at 1Gbps
  LIGHT_SPEED_FIBER: number;    // ~200,000 km/s in fiber (2/3 of c)
}

export const DMX_TIMING: DMXTiming = {
  BREAK_TIME: 88000,      // 88μs
  MAB_TIME: 8000,         // 8μs
  BIT_TIME: 4000,         // 4μs per bit
  BYTE_TIME: 44000,       // 44μs per byte
  FRAME_TIME: 23000000,   // ~23ms full frame
  MTBF_MIN: 0,
  MTBF_MAX: 1000000000,   // 1 second
  FIBER_BIT_TIME: 1,      // 1ns at 1Gbps
  LIGHT_SPEED_FIBER: 200000000 // 200,000 km/s
};

export class DMXController {
  private static instance: DMXController;
  private frameCounter: number = 0;
  private isTransmitting: boolean = false;
  private currentFrame: DMXFrame | null = null;
  private transmissionCallbacks: ((frame: DMXFrame) => void)[] = [];
  
  private constructor() {}
  
  public static getInstance(): DMXController {
    if (!DMXController.instance) {
      DMXController.instance = new DMXController();
    }
    return DMXController.instance;
  }
  
  /**
   * Create DMX frame for color/number transmission
   * Channel 1: Red (0-255)
   * Channel 2: Green (0-255) 
   * Channel 3: Blue (0-255)
   * Channel 4: Number tens digit (0-9 mapped to 0-90)
   * Channel 5: Number ones digit (0-9 mapped to 0-90)
   */
  public createColorNumberFrame(color: string, number: string): DMXFrame {
    const channels = new Array(512).fill(0);
    
    // Set color channels (full intensity = 255)
    switch (color) {
      case 'Red':
        channels[0] = 255; // Channel 1: Red
        channels[1] = 0;   // Channel 2: Green
        channels[2] = 0;   // Channel 3: Blue
        break;
      case 'Green':
        channels[0] = 0;   // Channel 1: Red
        channels[1] = 255; // Channel 2: Green
        channels[2] = 0;   // Channel 3: Blue
        break;
      case 'Blue':
        channels[0] = 0;   // Channel 1: Red
        channels[1] = 0;   // Channel 2: Green
        channels[2] = 255; // Channel 3: Blue
        break;
    }
    
    // Set number channels
    const num = parseInt(number);
    const tens = Math.floor(num / 10);
    const ones = num % 10;
    
    channels[3] = tens * 25.5; // Channel 4: Tens (0-9 → 0-255)
    channels[4] = ones * 25.5; // Channel 5: Ones (0-9 → 0-255)
    
    return {
      startCode: 0x00,
      channels: channels,
      timestamp: Date.now(),
      frameNumber: ++this.frameCounter
    };
  }
  
  /**
   * Transmit DMX frame over fiber optic at light speed
   */
  public async transmitFrame(frame: DMXFrame): Promise<void> {
    this.isTransmitting = true;
    this.currentFrame = frame;
    
    console.log(`🚀 DMX-512 Transmission Start - Frame ${frame.frameNumber}`);
    console.log(`📡 Fiber Optic Speed: 1 Gbps (1ns per bit)`);
    console.log(`💡 Light Speed in Fiber: ${DMX_TIMING.LIGHT_SPEED_FIBER.toLocaleString()} km/s`);
    
    // DMX Break - 88μs low signal
    console.log(`⬇️ BREAK: ${DMX_TIMING.BREAK_TIME}ns (${DMX_TIMING.BREAK_TIME/1000}μs)`);
    await this.fiberDelay(DMX_TIMING.BREAK_TIME);
    
    // Mark After Break - 8μs high signal  
    console.log(`⬆️ MAB: ${DMX_TIMING.MAB_TIME}ns (${DMX_TIMING.MAB_TIME/1000}μs)`);
    await this.fiberDelay(DMX_TIMING.MAB_TIME);
    
    // Start Code - 8 bits
    console.log(`🏁 START CODE: 0x${frame.startCode.toString(16).padStart(2, '0')}`);
    await this.transmitByte(frame.startCode);
    
    // Channel Data - 512 bytes
    console.log(`📊 CHANNEL DATA: 512 channels`);
    for (let i = 0; i < 512; i++) {
      await this.transmitByte(frame.channels[i]);
      
      // Log significant channels
      if (i < 5 && frame.channels[i] > 0) {
        console.log(`   Channel ${i + 1}: ${frame.channels[i]} (${(frame.channels[i]/255*100).toFixed(1)}%)`);
      }
    }
    
    console.log(`✅ DMX Frame Complete - ${DMX_TIMING.FRAME_TIME}ns total`);
    console.log(`🔬 Fiber Distance: ${this.calculateFiberDistance()}m`);
    
    // Notify callbacks
    this.transmissionCallbacks.forEach(callback => callback(frame));
    
    this.isTransmitting = false;
  }
  
  /**
   * Transmit single byte (11 bits: start + 8 data + 2 stop)
   */
  private async transmitByte(value: number): Promise<void> {
    // Start bit (0)
    await this.fiberDelay(DMX_TIMING.BIT_TIME);
    
    // 8 data bits (LSB first)
    for (let bit = 0; bit < 8; bit++) {
      const bitValue = (value >> bit) & 1;
      await this.fiberDelay(DMX_TIMING.BIT_TIME);
    }
    
    // 2 stop bits (1, 1)
    await this.fiberDelay(DMX_TIMING.BIT_TIME);
    await this.fiberDelay(DMX_TIMING.BIT_TIME);
  }
  
  /**
   * Simulate fiber optic transmission delay
   * At 1 Gbps: 1 bit = 1 nanosecond
   */
  private async fiberDelay(nanoseconds: number): Promise<void> {
    // Convert nanoseconds to milliseconds for setTimeout
    const milliseconds = nanoseconds / 1000000;
    
    if (milliseconds >= 1) {
      await new Promise(resolve => setTimeout(resolve, milliseconds));
    }
    // For sub-millisecond delays, we simulate instantaneous at this scale
  }
  
  /**
   * Calculate fiber distance based on transmission time
   */
  private calculateFiberDistance(): number {
    const transmissionTimeNs = DMX_TIMING.FRAME_TIME;
    const transmissionTimeS = transmissionTimeNs / 1000000000;
    const distance = DMX_TIMING.LIGHT_SPEED_FIBER * transmissionTimeS;
    return Math.round(distance * 1000); // Convert km to meters
  }
  
  /**
   * Subscribe to transmission events
   */
  public onTransmission(callback: (frame: DMXFrame) => void): void {
    this.transmissionCallbacks.push(callback);
  }
  
  /**
   * Get current transmission status
   */
  public getStatus(): { isTransmitting: boolean; currentFrame: DMXFrame | null; frameCount: number } {
    return {
      isTransmitting: this.isTransmitting,
      currentFrame: this.currentFrame,
      frameCount: this.frameCounter
    };
  }
  
  /**
   * Reset frame counter
   */
  public reset(): void {
    this.frameCounter = 0;
    this.currentFrame = null;
    this.isTransmitting = false;
  }
}

export default DMXController;