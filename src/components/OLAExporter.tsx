import React, { useState, useEffect } from 'react';
import { Download, Wifi, Settings, CheckCircle, AlertCircle } from 'lucide-react';

interface OLAConfig {
  universe: number;
  channel: number;
  deviceName: string;
  ipAddress: string;
  port: number;
}

interface OLAExporterProps {
  selectedColor: string;
  currentNumber: string;
  isTransmitting: boolean;
  onExport: (config: OLAConfig) => void;
}

const OLAExporter: React.FC<OLAExporterProps> = ({
  selectedColor,
  currentNumber,
  isTransmitting,
  onExport
}) => {
  const [config, setConfig] = useState<OLAConfig>({
    universe: 1,
    channel: 1,
    deviceName: 'FiberTester',
    ipAddress: '192.168.1.100',
    port: 9090
  });
  
  const [isConnected, setIsConnected] = useState(false);
  const [exportStatus, setExportStatus] = useState<string>('');

  // Test OLA connection
  const testConnection = async () => {
    try {
      const response = await fetch(`http://${config.ipAddress}:${config.port}/json/universe_info`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        setIsConnected(true);
        setExportStatus('Connected to OLA daemon');
      } else {
        setIsConnected(false);
        setExportStatus('OLA daemon not responding');
      }
    } catch (error) {
      setIsConnected(false);
      setExportStatus('Cannot reach Raspberry Pi');
    }
  };

  // Generate OLA command script
  const generateOLAScript = () => {
    if (!selectedColor || !currentNumber) return '';

    const colorChannels = {
      'Red': { r: 255, g: 0, b: 0 },
      'Green': { r: 0, g: 255, b: 0 },
      'Blue': { r: 0, g: 0, b: 255 }
    };

    const color = colorChannels[selectedColor as keyof typeof colorChannels];
    
    return `#!/bin/bash
# OLA DMX Script for Fiber Optic Tester
# Generated for: ${selectedColor} ${currentNumber}
# Universe: ${config.universe}, Starting Channel: ${config.channel}

# Set color channels
ola_streaming_client -u ${config.universe} -d ${config.channel}:${color.r},${config.channel + 1}:${color.g},${config.channel + 2}:${color.b}

# Morse code transmission for ${selectedColor} ${currentNumber}
# Color: ${selectedColor[0].toUpperCase()} = ${getMorsePattern(selectedColor[0].toUpperCase())}
# Number: ${currentNumber.split('').map(d => `${d} = ${getMorsePattern(d)}`).join(', ')}

echo "Transmitting ${selectedColor} ${currentNumber} via DMX Universe ${config.universe}"
`;
  };

  const getMorsePattern = (char: string) => {
    const patterns: { [key: string]: string } = {
      'R': '·−·', 'G': '−−·', 'B': '−···',
      '0': '−−−−−', '1': '·−−−−', '2': '··−−−', '3': '···−−', '4': '····−',
      '5': '·····', '6': '−····', '7': '−−···', '8': '−−−··', '9': '−−−−·'
    };
    return patterns[char] || '';
  };

  // Export configuration
  const handleExport = () => {
    const script = generateOLAScript();
    const blob = new Blob([script], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `fiber_tester_${selectedColor}_${currentNumber}.sh`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    setExportStatus(`Exported script for ${selectedColor} ${currentNumber}`);
    onExport(config);
  };

  // Generate Python OLA script
  const generatePythonScript = () => {
    if (!selectedColor || !currentNumber) return '';

    return `#!/usr/bin/env python3
"""
OLA Python Script for Fiber Optic Tester
Generated for: ${selectedColor} ${currentNumber}
Requires: python3-ola package on Raspberry Pi
"""

import time
import array
from ola.ClientWrapper import ClientWrapper

# Configuration
UNIVERSE = ${config.universe}
CHANNEL = ${config.channel}
COLOR = "${selectedColor}"
NUMBER = "${currentNumber}"

# Morse timing (milliseconds)
DOT_DURATION = 0.120
DASH_DURATION = 0.360
SYMBOL_GAP = 0.120
LETTER_GAP = 0.840
CONFIRMATION_FLASH = 0.990

# Color values
COLORS = {
    'Red': [255, 0, 0],
    'Green': [0, 255, 0],
    'Blue': [0, 0, 255]
}

# Morse patterns
MORSE_PATTERNS = {
    'R': '·−·', 'G': '−−·', 'B': '−···',
    '0': '−−−−−', '1': '·−−−−', '2': '··−−−', '3': '···−−', '4': '····−',
    '5': '·····', '6': '−····', '7': '−−···', '8': '−−−··', '9': '−−−−·'
}

def send_dmx(wrapper, data):
    """Send DMX data to OLA"""
    wrapper.Client().SendDmx(UNIVERSE, data)

def flash_light(wrapper, duration, color_values):
    """Flash the light for specified duration"""
    # Turn on
    data = array.array('B', [0] * 512)
    for i, value in enumerate(color_values):
        if CHANNEL + i < 512:
            data[CHANNEL + i] = value
    send_dmx(wrapper, data)
    
    time.sleep(duration)
    
    # Turn off
    data = array.array('B', [0] * 512)
    send_dmx(wrapper, data)

def transmit_morse_pattern(wrapper, pattern, color_values):
    """Transmit a Morse code pattern"""
    for i, symbol in enumerate(pattern):
        if symbol == '·':
            flash_light(wrapper, DOT_DURATION, color_values)
        elif symbol == '−':
            flash_light(wrapper, DASH_DURATION, color_values)
        
        # Symbol gap (except after last symbol)
        if i < len(pattern) - 1:
            time.sleep(SYMBOL_GAP)

def main():
    """Main transmission function"""
    wrapper = ClientWrapper()
    
    print(f"Starting OLA transmission: {COLOR} {NUMBER}")
    print(f"Universe: {UNIVERSE}, Channel: {CHANNEL}")
    
    color_values = COLORS[COLOR]
    
    # Transmit color
    color_letter = COLOR[0].upper()
    color_pattern = MORSE_PATTERNS[color_letter]
    print(f"Transmitting color {color_letter}: {color_pattern}")
    transmit_morse_pattern(wrapper, color_pattern, color_values)
    time.sleep(LETTER_GAP)
    
    # Transmit each digit
    for digit in NUMBER:
        digit_pattern = MORSE_PATTERNS[digit]
        print(f"Transmitting digit {digit}: {digit_pattern}")
        transmit_morse_pattern(wrapper, digit_pattern, color_values)
        time.sleep(LETTER_GAP)
    
    # Confirmation flash
    print("Confirmation flash")
    flash_light(wrapper, CONFIRMATION_FLASH, color_values)
    
    print("Transmission complete")
    wrapper.Stop()

if __name__ == "__main__":
    main()
`;
  };

  const exportPythonScript = () => {
    const script = generatePythonScript();
    const blob = new Blob([script], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `fiber_tester_${selectedColor}_${currentNumber}.py`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    setExportStatus(`Exported Python script for ${selectedColor} ${currentNumber}`);
  };

  return (
    <div className="bg-black/30 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
      <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
        <Settings className="w-5 h-5" />
        OLA Export (Raspberry Pi)
      </h2>
      
      {/* Connection Status */}
      <div className="mb-4 p-3 rounded-lg bg-black/50 border border-gray-600">
        <div className="flex items-center justify-between mb-2">
          <span className="text-gray-300">Connection Status</span>
          <div className={`flex items-center gap-2 ${isConnected ? 'text-green-400' : 'text-red-400'}`}>
            {isConnected ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
            <span className="text-sm">{isConnected ? 'Connected' : 'Disconnected'}</span>
          </div>
        </div>
        <button
          onClick={testConnection}
          className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-200 flex items-center justify-center gap-2"
        >
          <Wifi className="w-4 h-4" />
          Test Connection
        </button>
      </div>

      {/* Configuration */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-gray-300 text-sm mb-1">Universe</label>
          <input
            type="number"
            min="1"
            max="512"
            value={config.universe}
            onChange={(e) => setConfig({...config, universe: parseInt(e.target.value)})}
            className="w-full px-3 py-2 bg-black/50 border border-gray-600 rounded-lg text-white focus:border-blue-500 focus:outline-none"
          />
        </div>
        <div>
          <label className="block text-gray-300 text-sm mb-1">Start Channel</label>
          <input
            type="number"
            min="1"
            max="510"
            value={config.channel}
            onChange={(e) => setConfig({...config, channel: parseInt(e.target.value)})}
            className="w-full px-3 py-2 bg-black/50 border border-gray-600 rounded-lg text-white focus:border-blue-500 focus:outline-none"
          />
        </div>
        <div>
          <label className="block text-gray-300 text-sm mb-1">Pi IP Address</label>
          <input
            type="text"
            value={config.ipAddress}
            onChange={(e) => setConfig({...config, ipAddress: e.target.value})}
            className="w-full px-3 py-2 bg-black/50 border border-gray-600 rounded-lg text-white focus:border-blue-500 focus:outline-none"
          />
        </div>
        <div>
          <label className="block text-gray-300 text-sm mb-1">OLA Port</label>
          <input
            type="number"
            value={config.port}
            onChange={(e) => setConfig({...config, port: parseInt(e.target.value)})}
            className="w-full px-3 py-2 bg-black/50 border border-gray-600 rounded-lg text-white focus:border-blue-500 focus:outline-none"
          />
        </div>
      </div>

      {/* Export Buttons */}
      <div className="space-y-3">
        <button
          onClick={handleExport}
          disabled={!selectedColor || !currentNumber}
          className="w-full py-3 px-4 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg transition-colors duration-200 flex items-center justify-center gap-2"
        >
          <Download className="w-4 h-4" />
          Export Bash Script
        </button>
        
        <button
          onClick={exportPythonScript}
          disabled={!selectedColor || !currentNumber}
          className="w-full py-3 px-4 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg transition-colors duration-200 flex items-center justify-center gap-2"
        >
          <Download className="w-4 h-4" />
          Export Python Script
        </button>
      </div>

      {/* Status Message */}
      {exportStatus && (
        <div className="mt-4 p-3 rounded-lg bg-blue-500/20 border border-blue-500/30">
          <p className="text-blue-300 text-sm">{exportStatus}</p>
        </div>
      )}

      {/* Instructions */}
      <div className="mt-4 p-3 rounded-lg bg-yellow-500/20 border border-yellow-500/30">
        <p className="text-yellow-300 text-sm">
          <strong>Setup Instructions:</strong><br/>
          1. Install OLA on Raspberry Pi: <code>sudo apt install ola</code><br/>
          2. Configure your DMX interface<br/>
          3. Export and run the script on your Pi<br/>
          4. Connect RGB LED fixture to channels {config.channel}-{config.channel + 2}
        </p>
      </div>
    </div>
  );
};

export default OLAExporter;