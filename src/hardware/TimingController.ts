/**
 * Hardware Timing Controller
 * Interfaces with dedicated hardware for microsecond-precise timing control
 */

export interface HardwareTimingConfig {
  dotDuration: number;      // microseconds
  dashDuration: number;     // microseconds
  intraLetterGap: number;   // microseconds
  interLetterGap: number;   // microseconds
  wordGap: number;          // microseconds
}

export interface TimingSequence {
  type: 'dot' | 'dash' | 'gap';
  duration: number;         // microseconds
  outputPin?: number;       // hardware pin number
}

export class HardwareTimingController {
  private isConnected: boolean = false;
  private hardwareInterface: any = null;
  private currentSequence: TimingSequence[] = [];
  private isRunning: boolean = false;
  
  // Standard Morse timing in microseconds (1 unit = 12ms = 12000μs)
  private config: HardwareTimingConfig = {
    dotDuration: 12000,      // 12ms in microseconds
    dashDuration: 36000,     // 36ms in microseconds  
    intraLetterGap: 12000,   // 12ms in microseconds
    interLetterGap: 36000,   // 36ms in microseconds
    wordGap: 84000           // 84ms in microseconds
  };

  constructor() {
    this.detectHardware();
  }

  /**
   * Detect available hardware timing interfaces
   */
  private async detectHardware(): Promise<void> {
    try {
      // Check for Web Serial API (Arduino, microcontroller)
      if ('serial' in navigator) {
        console.log('Web Serial API available - can connect to Arduino/microcontroller');
      }
      
      // Check for WebUSB (dedicated timing hardware)
      if ('usb' in navigator) {
        console.log('WebUSB available - can connect to USB timing devices');
      }
      
      // Check for Web Bluetooth (wireless timing devices)
      if ('bluetooth' in navigator) {
        console.log('Web Bluetooth available - can connect to BLE timing devices');
      }
      
      // Fallback to high-resolution software timing
      if ('performance' in window && performance.now) {
        console.log('High-resolution performance timer available');
      }
      
    } catch (error) {
      console.warn('Hardware detection failed:', error);
    }
  }

  /**
   * Connect to hardware timing device
   */
  public async connectHardware(deviceType: 'serial' | 'usb' | 'bluetooth' = 'serial'): Promise<boolean> {
    try {
      switch (deviceType) {
        case 'serial':
          return await this.connectSerial();
        case 'usb':
          return await this.connectUSB();
        case 'bluetooth':
          return await this.connectBluetooth();
        default:
          throw new Error(`Unsupported device type: ${deviceType}`);
      }
    } catch (error) {
      console.error('Hardware connection failed:', error);
      return false;
    }
  }

  /**
   * Connect via Web Serial (Arduino, ESP32, etc.)
   */
  private async connectSerial(): Promise<boolean> {
    if (!('serial' in navigator)) {
      throw new Error('Web Serial API not supported');
    }

    try {
      // Request serial port
      const port = await (navigator as any).serial.requestPort();
      await port.open({ baudRate: 115200 });
      
      this.hardwareInterface = port;
      this.isConnected = true;
      
      // Send initialization command
      const writer = port.writable.getWriter();
      await writer.write(new TextEncoder().encode('INIT_TIMING\n'));
      writer.releaseLock();
      
      console.log('Connected to serial timing device');
      return true;
      
    } catch (error) {
      console.error('Serial connection failed:', error);
      return false;
    }
  }

  /**
   * Connect via WebUSB (dedicated timing hardware)
   */
  private async connectUSB(): Promise<boolean> {
    if (!('usb' in navigator)) {
      throw new Error('WebUSB not supported');
    }

    try {
      // Request USB device (timing controller)
      const device = await (navigator as any).usb.requestDevice({
        filters: [
          { vendorId: 0x2341 }, // Arduino vendor ID
          { vendorId: 0x10C4 }, // Silicon Labs (ESP32)
        ]
      });
      
      await device.open();
      this.hardwareInterface = device;
      this.isConnected = true;
      
      console.log('Connected to USB timing device');
      return true;
      
    } catch (error) {
      console.error('USB connection failed:', error);
      return false;
    }
  }

  /**
   * Connect via Web Bluetooth (wireless timing devices)
   */
  private async connectBluetooth(): Promise<boolean> {
    if (!('bluetooth' in navigator)) {
      throw new Error('Web Bluetooth not supported');
    }

    try {
      const device = await (navigator as any).bluetooth.requestDevice({
        filters: [{ services: ['12345678-1234-1234-1234-123456789abc'] }] // Custom timing service UUID
      });
      
      const server = await device.gatt.connect();
      this.hardwareInterface = server;
      this.isConnected = true;
      
      console.log('Connected to Bluetooth timing device');
      return true;
      
    } catch (error) {
      console.error('Bluetooth connection failed:', error);
      return false;
    }
  }

  /**
   * Execute timing sequence with hardware precision
   */
  public async executeSequence(sequence: TimingSequence[], loop: boolean = false): Promise<void> {
    if (!this.isConnected) {
      // Fallback to high-precision software timing
      return this.executeSoftwareSequence(sequence, loop);
    }

    this.isRunning = true;
    this.currentSequence = sequence;

    try {
      if (this.hardwareInterface && this.hardwareInterface.writable) {
        // Send sequence to hardware device
        const writer = this.hardwareInterface.writable.getWriter();
        const command = this.encodeSequenceCommand(sequence, loop);
        await writer.write(new TextEncoder().encode(command));
        writer.releaseLock();
      }
    } catch (error) {
      console.error('Hardware sequence execution failed:', error);
      // Fallback to software timing
      return this.executeSoftwareSequence(sequence, loop);
    }
  }

  /**
   * High-precision software timing fallback
   */
  private async executeSoftwareSequence(sequence: TimingSequence[], loop: boolean = false): Promise<void> {
    const executeOnce = async () => {
      for (const step of sequence) {
        if (!this.isRunning) break;
        
        const startTime = performance.now();
        
        // Trigger output (would control actual hardware pin)
        if (step.type === 'dot' || step.type === 'dash') {
          this.triggerOutput(true);
        }
        
        // High-precision timing loop
        const targetDuration = step.duration / 1000; // Convert μs to ms
        while ((performance.now() - startTime) < targetDuration) {
          // Busy wait for precise timing
          if (!this.isRunning) break;
        }
        
        // Turn off output
        if (step.type === 'dot' || step.type === 'dash') {
          this.triggerOutput(false);
        }
      }
    };

    if (loop) {
      while (this.isRunning) {
        await executeOnce();
        if (this.isRunning) {
          // Word gap between repetitions
          const startTime = performance.now();
          while ((performance.now() - startTime) < (this.config.wordGap / 1000)) {
            if (!this.isRunning) break;
          }
        }
      }
    } else {
      await executeOnce();
    }
  }

  /**
   * Encode sequence for hardware device
   */
  private encodeSequenceCommand(sequence: TimingSequence[], loop: boolean): string {
    const commands = sequence.map(step => {
      const type = step.type === 'dot' ? 'D' : step.type === 'dash' ? 'H' : 'G';
      return `${type}:${step.duration}`;
    });
    
    const loopFlag = loop ? 'LOOP:1' : 'LOOP:0';
    return `SEQ:${commands.join(',')}|${loopFlag}\n`;
  }

  /**
   * Trigger hardware output (placeholder for actual hardware control)
   */
  private triggerOutput(state: boolean): void {
    // This would control actual hardware pins/outputs
    // For now, we'll emit events that the UI can listen to
    window.dispatchEvent(new CustomEvent('hardwareOutput', { 
      detail: { state, timestamp: performance.now() } 
    }));
  }

  /**
   * Stop current sequence execution
   */
  public stop(): void {
    this.isRunning = false;
    
    if (this.isConnected && this.hardwareInterface && this.hardwareInterface.writable) {
      try {
        const writer = this.hardwareInterface.writable.getWriter();
        writer.write(new TextEncoder().encode('STOP\n'));
        writer.releaseLock();
      } catch (error) {
        console.error('Failed to send stop command to hardware:', error);
      }
    }
    
    this.triggerOutput(false);
  }

  /**
   * Update timing configuration
   */
  public updateConfig(newConfig: Partial<HardwareTimingConfig>): void {
    this.config = { ...this.config, ...newConfig };
    
    if (this.isConnected && this.hardwareInterface && this.hardwareInterface.writable) {
      try {
        const writer = this.hardwareInterface.writable.getWriter();
        const configCmd = `CONFIG:${JSON.stringify(this.config)}\n`;
        writer.write(new TextEncoder().encode(configCmd));
        writer.releaseLock();
      } catch (error) {
        console.error('Failed to update hardware config:', error);
      }
    }
  }

  /**
   * Get current hardware status
   */
  public getStatus(): { connected: boolean; running: boolean; config: HardwareTimingConfig } {
    return {
      connected: this.isConnected,
      running: this.isRunning,
      config: this.config
    };
  }

  /**
   * Disconnect from hardware
   */
  public async disconnect(): Promise<void> {
    this.stop();
    
    if (this.isConnected && this.hardwareInterface) {
      try {
        if (this.hardwareInterface.close) {
          await this.hardwareInterface.close();
        } else if (this.hardwareInterface.disconnect) {
          await this.hardwareInterface.disconnect();
        }
      } catch (error) {
        console.error('Hardware disconnection error:', error);
      }
    }
    
    this.isConnected = false;
    this.hardwareInterface = null;
  }
}