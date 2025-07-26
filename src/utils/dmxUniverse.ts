/**
 * Multi-Universe DMX Pipeline
 * Handles 12 simultaneous DMX universes for professional lighting control
 * Each universe = 512 channels, can run independently
 */

export interface DMXUniverse {
  universeId: number;
  channels: number[]; // 512 channels, 0-255 each
  isActive: boolean;
  lastUpdate: number;
  frameRate: number; // Hz
}

export interface DMXOutput {
  universeId: number;
  channelData: number[];
  timestamp: number;
  frameNumber: number;
}

export class DMXUniverseManager {
  private static instance: DMXUniverseManager;
  private universes: Map<number, DMXUniverse> = new Map();
  private outputCallbacks: ((outputs: DMXOutput[]) => void)[] = [];
  private isRunning: boolean = false;
  private frameCounter: number = 0;
  
  private constructor() {
    // Initialize 12 universes
    for (let i = 1; i <= 12; i++) {
      this.universes.set(i, {
        universeId: i,
        channels: new Array(512).fill(0),
        isActive: false,
        lastUpdate: 0,
        frameRate: 44 // 44Hz standard DMX refresh rate
      });
    }
  }
  
  public static getInstance(): DMXUniverseManager {
    if (!DMXUniverseManager.instance) {
      DMXUniverseManager.instance = new DMXUniverseManager();
    }
    return DMXUniverseManager.instance;
  }
  
  /**
   * Set channel value in specific universe
   */
  public setChannel(universeId: number, channel: number, value: number): void {
    const universe = this.universes.get(universeId);
    if (!universe || channel < 1 || channel > 512 || value < 0 || value > 255) {
      return;
    }
    
    universe.channels[channel - 1] = Math.round(value);
    universe.lastUpdate = Date.now();
    universe.isActive = true;
    
    console.log(`🎛️ DMX Universe ${universeId} Channel ${channel}: ${value}`);
  }
  
  /**
   * Set multiple channels at once
   */
  public setChannels(universeId: number, startChannel: number, values: number[]): void {
    const universe = this.universes.get(universeId);
    if (!universe || startChannel < 1 || startChannel > 512) {
      return;
    }
    
    for (let i = 0; i < values.length && (startChannel + i) <= 512; i++) {
      const value = Math.max(0, Math.min(255, Math.round(values[i])));
      universe.channels[startChannel - 1 + i] = value;
    }
    
    universe.lastUpdate = Date.now();
    universe.isActive = true;
    
    console.log(`🎛️ DMX Universe ${universeId} Channels ${startChannel}-${startChannel + values.length - 1}: [${values.join(', ')}]`);
  }
  
  /**
   * Set color/number on specific universe
   */
  public setColorNumber(universeId: number, color: string, number: string): void {
    const values: number[] = [0, 0, 0, 0, 0]; // R, G, B, Tens, Ones
    
    // Set color channels
    switch (color) {
      case 'Red':
        values[0] = 255; // Red
        break;
      case 'Green':
        values[1] = 255; // Green
        break;
      case 'Blue':
        values[2] = 255; // Blue
        break;
    }
    
    // Set number channels
    const num = parseInt(number);
    const tens = Math.floor(num / 10);
    const ones = num % 10;
    values[3] = tens * 25.5; // Tens digit
    values[4] = ones * 25.5; // Ones digit
    
    this.setChannels(universeId, 1, values);
    
    console.log(`🚀 DMX Universe ${universeId}: ${color} ${number}`);
  }
  
  /**
   * Clear universe (all channels to 0)
   */
  public clearUniverse(universeId: number): void {
    const universe = this.universes.get(universeId);
    if (!universe) return;
    
    universe.channels.fill(0);
    universe.isActive = false;
    universe.lastUpdate = Date.now();
    
    console.log(`🧹 DMX Universe ${universeId} cleared`);
  }
  
  /**
   * Start DMX output pipeline
   */
  public startOutput(): void {
    if (this.isRunning) return;
    
    this.isRunning = true;
    console.log('🚀 DMX Pipeline Started - 12 Universes @ 44Hz');
    
    // 44Hz refresh rate (22.7ms intervals)
    const outputInterval = setInterval(() => {
      if (!this.isRunning) {
        clearInterval(outputInterval);
        return;
      }
      
      this.generateOutputs();
    }, 23); // ~44Hz
  }
  
  /**
   * Stop DMX output pipeline
   */
  public stopOutput(): void {
    this.isRunning = false;
    console.log('⏹️ DMX Pipeline Stopped');
  }
  
  /**
   * Generate outputs for all active universes
   */
  private generateOutputs(): void {
    const outputs: DMXOutput[] = [];
    const now = Date.now();
    
    this.universes.forEach((universe, universeId) => {
      if (universe.isActive) {
        outputs.push({
          universeId,
          channelData: [...universe.channels], // Copy array
          timestamp: now,
          frameNumber: ++this.frameCounter
        });
      }
    });
    
    if (outputs.length > 0) {
      // Send to all subscribers
      this.outputCallbacks.forEach(callback => callback(outputs));
    }
  }
  
  /**
   * Subscribe to DMX outputs
   */
  public onOutput(callback: (outputs: DMXOutput[]) => void): void {
    this.outputCallbacks.push(callback);
  }
  
  /**
   * Get universe status
   */
  public getUniverseStatus(universeId: number): DMXUniverse | null {
    return this.universes.get(universeId) || null;
  }
  
  /**
   * Get all universe statuses
   */
  public getAllUniverses(): DMXUniverse[] {
    return Array.from(this.universes.values());
  }
  
  /**
   * Get active universe count
   */
  public getActiveCount(): number {
    return Array.from(this.universes.values()).filter(u => u.isActive).length;
  }
}

export default DMXUniverseManager;