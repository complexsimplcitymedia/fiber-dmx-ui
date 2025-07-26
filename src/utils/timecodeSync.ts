/**
 * Professional Timecode Synchronization for Fiber Optic Testing
 * Ensures both transmitter and decoder show synchronized timestamps
 * Critical for field installations where precise timing correlation is needed
 */

export interface TimecodeState {
  hours: number;
  minutes: number;
  seconds: number;
  frames: number;
  milliseconds: number;
  syncStatus: 'SYNCED' | 'DRIFT' | 'LOST';
}

export class TimecodeSync {
  private static instance: TimecodeSync;
  private startTime: number;
  private frameRate: number = 30; // 30fps standard
  private syncOffset: number = 0;
  private lastSyncCheck: number = 0;
  private syncCallbacks: ((timecode: TimecodeState) => void)[] = [];
  private intervalId: NodeJS.Timeout | null = null;

  private constructor() {
    this.startTime = Date.now();
    this.startTimecodeDisplay();
  }

  public static getInstance(): TimecodeSync {
    if (!TimecodeSync.instance) {
      TimecodeSync.instance = new TimecodeSync();
    }
    return TimecodeSync.instance;
  }

  /**
   * Start the timecode display - runs continuously like professional equipment
   */
  private startTimecodeDisplay(): void {
    this.intervalId = setInterval(() => {
      const currentTimecode = this.getCurrentTimecode();
      this.notifyCallbacks(currentTimecode);
    }, 33); // ~30fps update rate
  }

  /**
   * Get current synchronized timecode
   */
  public getCurrentTimecode(): TimecodeState {
    const now = Date.now();
    const elapsed = now - this.startTime + this.syncOffset;
    
    const totalSeconds = Math.floor(elapsed / 1000);
    const milliseconds = elapsed % 1000;
    const frames = Math.floor((milliseconds / 1000) * this.frameRate);
    
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    
    // Check sync status
    const timeSinceLastSync = now - this.lastSyncCheck;
    let syncStatus: 'SYNCED' | 'DRIFT' | 'LOST' = 'SYNCED';
    
    if (timeSinceLastSync > 30000) { // 30 seconds
      syncStatus = 'LOST';
    } else if (timeSinceLastSync > 10000) { // 10 seconds
      syncStatus = 'DRIFT';
    }

    return {
      hours,
      minutes,
      seconds,
      frames,
      milliseconds,
      syncStatus
    };
  }

  /**
   * Format timecode as professional display string
   */
  public formatTimecode(timecode: TimecodeState): string {
    const h = timecode.hours.toString().padStart(2, '0');
    const m = timecode.minutes.toString().padStart(2, '0');
    const s = timecode.seconds.toString().padStart(2, '0');
    const f = timecode.frames.toString().padStart(2, '0');
    
    return `${h}:${m}:${s}:${f}`;
  }

  /**
   * Sync with another device (in real system, this would be network sync)
   */
  public syncWithMaster(masterTimestamp: number): void {
    const localTime = Date.now();
    this.syncOffset = masterTimestamp - localTime;
    this.lastSyncCheck = localTime;
  }

  /**
   * Mark transmission start with precise timecode
   */
  public markTransmissionStart(): { timecode: TimecodeState; timestamp: number } {
    const timestamp = Date.now();
    const timecode = this.getCurrentTimecode();
    
    return { timecode, timestamp };
  }

  /**
   * Subscribe to timecode updates
   */
  public subscribe(callback: (timecode: TimecodeState) => void): void {
    this.syncCallbacks.push(callback);
  }

  /**
   * Unsubscribe from timecode updates
   */
  public unsubscribe(callback: (timecode: TimecodeState) => void): void {
    this.syncCallbacks = this.syncCallbacks.filter(cb => cb !== callback);
  }

  /**
   * Notify all subscribers of timecode updates
   */
  private notifyCallbacks(timecode: TimecodeState): void {
    this.syncCallbacks.forEach(callback => callback(timecode));
  }

  /**
   * Reset timecode (like jam sync on professional equipment)
   */
  public jamSync(): void {
    this.startTime = Date.now();
    this.syncOffset = 0;
    this.lastSyncCheck = Date.now();
  }

  /**
   * Cleanup
   */
  public destroy(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    this.syncCallbacks = [];
  }
}

export default TimecodeSync;