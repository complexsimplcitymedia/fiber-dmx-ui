/**
 * Multi-Channel DMX Pipeline
 * Handles 12 simultaneous DMX channels for professional lighting control
 * Each channel can run independently with color/number data
 */

export interface DMXChannel {
  channelId: number;
  color: string;
  number: string;
  isActive: boolean;
  lastUpdate: number;
  intensity: number; // 0-255
}

export interface DMXOutput {
  channelId: number;
  color: string;
  number: string;
  timestamp: number;
  frameNumber: number;
  intensity: number;
}

export class DMXChannelManager {
  private static instance: DMXChannelManager;
  private channels: Map<number, DMXChannel> = new Map();
  private outputCallbacks: ((outputs: DMXOutput[]) => void)[] = [];
  private isRunning: boolean = false;
  private frameCounter: number = 0;
  
  private constructor() {
    // Initialize 12 channels
    for (let i = 1; i <= 12; i++) {
      this.channels.set(i, {
        channelId: i,
        color: '',
        number: '',
        isActive: false,
        lastUpdate: 0,
        intensity: 0
      });
    }
  }
  
  public static getInstance(): DMXChannelManager {
    if (!DMXChannelManager.instance) {
      DMXChannelManager.instance = new DMXChannelManager();
    }
    return DMXChannelManager.instance;
  }
  
  /**
   * Set color/number on specific channel
   */
  public setChannel(channelId: number, color: string, number: string, intensity: number = 255): void {
    const channel = this.channels.get(channelId);
    if (!channel || channelId < 1 || channelId > 12) {
      return;
    }
    
    channel.color = color;
    channel.number = number;
    channel.intensity = Math.max(0, Math.min(255, intensity));
    channel.lastUpdate = Date.now();
    channel.isActive = true;
    
    console.log(`🎛️ DMX Channel ${channelId}: ${color} ${number} @ ${intensity}`);
  }
  
  /**
   * Clear channel
   */
  public clearChannel(channelId: number): void {
    const channel = this.channels.get(channelId);
    if (!channel) return;
    
    channel.color = '';
    channel.number = '';
    channel.intensity = 0;
    channel.isActive = false;
    channel.lastUpdate = Date.now();
    
    console.log(`🧹 DMX Channel ${channelId} cleared`);
  }
  
  /**
   * Start DMX output pipeline - 44Hz refresh rate
   */
  public startOutput(): void {
    if (this.isRunning) return;
    
    this.isRunning = true;
    console.log('🚀 DMX Pipeline Started - 12 Channels @ 44Hz');
    
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
   * Generate outputs for all active channels
   */
  private generateOutputs(): void {
    const outputs: DMXOutput[] = [];
    const now = Date.now();
    
    this.channels.forEach((channel, channelId) => {
      if (channel.isActive && channel.color && channel.number) {
        outputs.push({
          channelId,
          color: channel.color,
          number: channel.number,
          timestamp: now,
          frameNumber: ++this.frameCounter,
          intensity: channel.intensity
        });
      }
    });
    
    if (outputs.length > 0) {
      // Send to all subscribers (this is what goes to fiber optic)
      this.outputCallbacks.forEach(callback => callback(outputs));
    }
  }
  
  /**
   * Subscribe to DMX outputs (fiber optic transmitter subscribes here)
   */
  public onOutput(callback: (outputs: DMXOutput[]) => void): void {
    this.outputCallbacks.push(callback);
  }
  
  /**
   * Get channel status
   */
  public getChannelStatus(channelId: number): DMXChannel | null {
    return this.channels.get(channelId) || null;
  }
  
  /**
   * Get all channel statuses
   */
  public getAllChannels(): DMXChannel[] {
    return Array.from(this.channels.values());
  }
  
  /**
   * Get active channel count
   */
  public getActiveCount(): number {
    return Array.from(this.channels.values()).filter(c => c.isActive).length;
  }
  
  /**
   * Set multiple channels simultaneously
   */
  public setMultipleChannels(channelData: Array<{channelId: number, color: string, number: string, intensity?: number}>): void {
    channelData.forEach(data => {
      this.setChannel(data.channelId, data.color, data.number, data.intensity || 255);
    });
    
    console.log(`🎛️ DMX Multi-Channel Update: ${channelData.length} channels`);
  }
}

export default DMXChannelManager;