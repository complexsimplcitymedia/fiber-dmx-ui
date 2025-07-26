/**
 * Fiber Optic Transmitter
 * Converts DMX channel outputs to fiber optic signals at light speed
 * This is what actually goes over the fiber - NOT DMX protocol
 * The backend receives these fiber signals, not DMX
 */

import { DMXOutput } from './dmxUniverse';

export interface FiberSignal {
  channelId: number;
  color: string;
  number: string;
  timestamp: number;
  fiberLatency: number; // nanoseconds
  signalStrength: number; // 0-100%
  lightSpeed: number; // km/s
}

export interface FiberTransmissionStats {
  totalSignals: number;
  activeChannels: number;
  averageLatency: number;
  fiberDistance: number; // meters
  transmissionRate: number; // signals/second
}

export class FiberOpticTransmitter {
  private static instance: FiberOpticTransmitter;
  private transmissionCallbacks: ((signals: FiberSignal[]) => void)[] = [];
  private transmissionStats: FiberTransmissionStats = {
    totalSignals: 0,
    activeChannels: 0,
    averageLatency: 0,
    fiberDistance: 1000, // 1km default
    transmissionRate: 0
  };
  
  // Fiber optic constants
  private readonly LIGHT_SPEED_FIBER = 200000000; // 200,000 km/s (2/3 of c)
  private readonly FIBER_BIT_RATE = 1000000000; // 1 Gbps
  
  private constructor() {}
  
  public static getInstance(): FiberOpticTransmitter {
    if (!FiberOpticTransmitter.instance) {
      FiberOpticTransmitter.instance = new FiberOpticTransmitter();
    }
    return FiberOpticTransmitter.instance;
  }
  
  /**
   * Transmit DMX outputs over fiber optic at light speed
   */
  public async transmitOutputs(outputs: DMXOutput[]): Promise<void> {
    const fiberSignals: FiberSignal[] = [];
    const transmissionStart = Date.now();
    
    console.log(`🚀 Fiber Transmission: ${outputs.length} channels @ ${this.LIGHT_SPEED_FIBER.toLocaleString()} km/s`);
    
    for (const output of outputs) {
      // Calculate fiber optic latency
      const fiberLatency = this.calculateFiberLatency();
      
      // Convert DMX output to fiber signal
      const fiberSignal: FiberSignal = {
        channelId: output.channelId,
        color: output.color,
        number: output.number,
        timestamp: output.timestamp,
        fiberLatency,
        signalStrength: (output.intensity / 255) * 100,
        lightSpeed: this.LIGHT_SPEED_FIBER
      };
      
      fiberSignals.push(fiberSignal);
      
      console.log(`📡 Channel ${output.channelId}: ${output.color} ${output.number} (${fiberSignal.signalStrength.toFixed(1)}% strength, ${fiberLatency}ns latency)`);
    }
    
    // Simulate fiber transmission time
    const transmissionTime = this.calculateTransmissionTime(fiberSignals.length);
    await new Promise(resolve => setTimeout(resolve, transmissionTime));
    
    // Update stats
    this.updateTransmissionStats(fiberSignals, Date.now() - transmissionStart);
    
    // Send to all subscribers (backend receives these)
    this.transmissionCallbacks.forEach(callback => callback(fiberSignals));
    
    console.log(`✅ Fiber Transmission Complete: ${fiberSignals.length} signals in ${Date.now() - transmissionStart}ms`);
  }
  
  /**
   * Calculate fiber optic latency based on distance
   */
  private calculateFiberLatency(): number {
    const distanceMeters = this.transmissionStats.fiberDistance;
    const latencySeconds = distanceMeters / (this.LIGHT_SPEED_FIBER * 1000);
    return Math.round(latencySeconds * 1000000000); // Convert to nanoseconds
  }
  
  /**
   * Calculate transmission time for multiple signals
   */
  private calculateTransmissionTime(signalCount: number): number {
    // At 1 Gbps, each signal takes time to serialize
    const bitsPerSignal = 64; // Simplified: color + number + metadata
    const totalBits = signalCount * bitsPerSignal;
    const transmissionTimeMs = (totalBits / this.FIBER_BIT_RATE) * 1000;
    
    return Math.max(1, Math.round(transmissionTimeMs)); // Minimum 1ms
  }
  
  /**
   * Update transmission statistics
   */
  private updateTransmissionStats(signals: FiberSignal[], transmissionTimeMs: number): void {
    this.transmissionStats.totalSignals += signals.length;
    this.transmissionStats.activeChannels = new Set(signals.map(s => s.channelId)).size;
    this.transmissionStats.averageLatency = signals.reduce((sum, s) => sum + s.fiberLatency, 0) / signals.length;
    this.transmissionStats.transmissionRate = signals.length / (transmissionTimeMs / 1000);
  }
  
  /**
   * Subscribe to fiber transmissions (backend subscribes here)
   */
  public onTransmission(callback: (signals: FiberSignal[]) => void): void {
    this.transmissionCallbacks.push(callback);
  }
  
  /**
   * Set fiber distance (affects latency)
   */
  public setFiberDistance(distanceMeters: number): void {
    this.transmissionStats.fiberDistance = Math.max(1, distanceMeters);
    console.log(`🔬 Fiber Distance Set: ${distanceMeters}m (${(distanceMeters/1000).toFixed(2)}km)`);
  }
  
  /**
   * Get transmission statistics
   */
  public getStats(): FiberTransmissionStats {
    return { ...this.transmissionStats };
  }
  
  /**
   * Reset statistics
   */
  public resetStats(): void {
    this.transmissionStats = {
      totalSignals: 0,
      activeChannels: 0,
      averageLatency: 0,
      fiberDistance: this.transmissionStats.fiberDistance, // Keep distance
      transmissionRate: 0
    };
    console.log('📊 Fiber Transmission Stats Reset');
  }
}

export default FiberOpticTransmitter;