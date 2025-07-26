/**
 * DMX-512 Decoder - Receives and decodes DMX frames over fiber optic
 * Professional lighting control protocol decoder
 */

import { DMXFrame, DMX_TIMING } from './dmxProtocol';

export interface DecodedDMXSignal {
  color: string;
  number: string;
  confidence: number;
  frameNumber: number;
  channels: {
    red: number;
    green: number;
    blue: number;
    tens: number;
    ones: number;
  };
  timestamp: number;
  fiberLatency: number; // nanoseconds
}

export class DMXDecoder {
  private static instance: DMXDecoder;
  private receivedFrames: DMXFrame[] = [];
  private decodedSignals: DecodedDMXSignal[] = [];
  private isListening: boolean = true;
  
  private constructor() {}
  
  public static getInstance(): DMXDecoder {
    if (!DMXDecoder.instance) {
      DMXDecoder.instance = new DMXDecoder();
    }
    return DMXDecoder.instance;
  }
  
  /**
   * Receive DMX frame over fiber optic
   */
  public receiveFrame(frame: DMXFrame): DecodedDMXSignal | null {
    if (!this.isListening) return null;
    
    console.log(`📡 DMX Frame Received - Frame ${frame.frameNumber}`);
    console.log(`🔬 Fiber Latency: ${this.calculateFiberLatency()}ns`);
    
    this.receivedFrames.push(frame);
    
    // Decode the frame
    const decoded = this.decodeFrame(frame);
    
    if (decoded) {
      this.decodedSignals.unshift(decoded);
      // Keep only last 10 signals
      if (this.decodedSignals.length > 10) {
        this.decodedSignals = this.decodedSignals.slice(0, 10);
      }
      
      console.log(`✅ DMX Decoded: ${decoded.color} ${decoded.number} (${decoded.confidence}% confidence)`);
    }
    
    return decoded;
  }
  
  /**
   * Decode DMX frame to color/number
   */
  private decodeFrame(frame: DMXFrame): DecodedDMXSignal | null {
    const channels = frame.channels;
    
    // Extract color from RGB channels (1-3)
    const red = channels[0] || 0;
    const green = channels[1] || 0;
    const blue = channels[2] || 0;
    
    // Extract number from channels 4-5
    const tensChannel = channels[3] || 0;
    const onesChannel = channels[4] || 0;
    
    // Decode color (highest intensity wins)
    let color = '';
    let colorConfidence = 0;
    
    if (red > green && red > blue && red > 200) {
      color = 'Red';
      colorConfidence = (red / 255) * 100;
    } else if (green > red && green > blue && green > 200) {
      color = 'Green';
      colorConfidence = (green / 255) * 100;
    } else if (blue > red && blue > green && blue > 200) {
      color = 'Blue';
      colorConfidence = (blue / 255) * 100;
    } else {
      return null; // No clear color
    }
    
    // Decode number
    const tens = Math.round(tensChannel / 25.5);
    const ones = Math.round(onesChannel / 25.5);
    const number = (tens * 10 + ones).toString();
    
    // Calculate overall confidence
    const numberConfidence = this.calculateNumberConfidence(tensChannel, onesChannel);
    const overallConfidence = Math.min(colorConfidence, numberConfidence);
    
    return {
      color,
      number,
      confidence: Math.round(overallConfidence),
      frameNumber: frame.frameNumber,
      channels: {
        red,
        green,
        blue,
        tens: tensChannel,
        ones: onesChannel
      },
      timestamp: Date.now(),
      fiberLatency: this.calculateFiberLatency()
    };
  }
  
  /**
   * Calculate number decoding confidence
   */
  private calculateNumberConfidence(tensChannel: number, onesChannel: number): number {
    const tens = Math.round(tensChannel / 25.5);
    const ones = Math.round(onesChannel / 25.5);
    
    // Check if values are in valid range (0-9)
    if (tens < 0 || tens > 9 || ones < 0 || ones > 9) {
      return 0;
    }
    
    // Check how close the channel values are to expected quantized values
    const expectedTens = tens * 25.5;
    const expectedOnes = ones * 25.5;
    
    const tensError = Math.abs(tensChannel - expectedTens) / 255;
    const onesError = Math.abs(onesChannel - expectedOnes) / 255;
    
    const tensConfidence = (1 - tensError) * 100;
    const onesConfidence = (1 - onesError) * 100;
    
    return Math.min(tensConfidence, onesConfidence);
  }
  
  /**
   * Calculate fiber optic latency
   */
  private calculateFiberLatency(): number {
    // Simulate realistic fiber latency (distance-based)
    const fiberDistance = 1000; // 1km typical
    const lightSpeedFiber = DMX_TIMING.LIGHT_SPEED_FIBER * 1000; // m/s
    const latencySeconds = fiberDistance / lightSpeedFiber;
    return Math.round(latencySeconds * 1000000000); // Convert to nanoseconds
  }
  
  /**
   * Get latest decoded signal
   */
  public getLatestDecoded(): DecodedDMXSignal | null {
    return this.decodedSignals.length > 0 ? this.decodedSignals[0] : null;
  }
  
  /**
   * Get all decoded signals
   */
  public getAllDecoded(): DecodedDMXSignal[] {
    return [...this.decodedSignals];
  }
  
  /**
   * Set listening state
   */
  public setListening(listening: boolean): void {
    this.isListening = listening;
    console.log(`🎧 DMX Decoder ${listening ? 'LISTENING' : 'PAUSED'}`);
  }
  
  /**
   * Clear history
   */
  public clearHistory(): void {
    this.receivedFrames = [];
    this.decodedSignals = [];
    console.log('🧹 DMX Decoder history cleared');
  }
  
  /**
   * Get decoder status
   */
  public getStatus(): {
    isListening: boolean;
    frameCount: number;
    signalCount: number;
    latestFrame: DMXFrame | null;
  } {
    return {
      isListening: this.isListening,
      frameCount: this.receivedFrames.length,
      signalCount: this.decodedSignals.length,
      latestFrame: this.receivedFrames.length > 0 ? this.receivedFrames[this.receivedFrames.length - 1] : null
    };
  }
}

export default DMXDecoder;