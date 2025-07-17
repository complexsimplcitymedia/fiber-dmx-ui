import React, { useState, useEffect } from 'react';
import { Cpu, Usb, Bluetooth, Wifi, Settings, Power, AlertCircle } from 'lucide-react';
import { HardwareTimingController, HardwareTimingConfig } from '../hardware/TimingController';

interface HardwareControlsProps {
  onHardwareStateChange: (connected: boolean) => void;
  onTimingConfigChange: (config: HardwareTimingConfig) => void;
}

const HardwareControls: React.FC<HardwareControlsProps> = ({
  onHardwareStateChange,
  onTimingConfigChange
}) => {
  const [hardwareController] = useState(() => new HardwareTimingController());
  const [isConnected, setIsConnected] = useState(false);
  const [connectionType, setConnectionType] = useState<'serial' | 'usb' | 'bluetooth' | null>(null);
  const [showConfig, setShowConfig] = useState(false);
  const [config, setConfig] = useState<HardwareTimingConfig>({
    dotDuration: 12000,      // 12ms in microseconds
    dashDuration: 36000,     // 36ms in microseconds
    intraLetterGap: 12000,   // 12ms in microseconds
    interLetterGap: 36000,   // 36ms in microseconds
    wordGap: 84000           // 84ms in microseconds
  });

  useEffect(() => {
    const status = hardwareController.getStatus();
    setIsConnected(status.connected);
    setConfig(status.config);
  }, [hardwareController]);

  const handleConnect = async (deviceType: 'serial' | 'usb' | 'bluetooth') => {
    try {
      const success = await hardwareController.connectHardware(deviceType);
      if (success) {
        setIsConnected(true);
        setConnectionType(deviceType);
        onHardwareStateChange(true);
      }
    } catch (error) {
      console.error('Connection failed:', error);
      alert(`Failed to connect to ${deviceType} device: ${error}`);
    }
  };

  const handleDisconnect = async () => {
    try {
      await hardwareController.disconnect();
      setIsConnected(false);
      setConnectionType(null);
      onHardwareStateChange(false);
    } catch (error) {
      console.error('Disconnection failed:', error);
    }
  };

  const handleConfigUpdate = (field: keyof HardwareTimingConfig, value: number) => {
    const newConfig = { ...config, [field]: value };
    setConfig(newConfig);
    hardwareController.updateConfig(newConfig);
    onTimingConfigChange(newConfig);
  };

  const getConnectionIcon = () => {
    switch (connectionType) {
      case 'serial': return <Usb className="w-4 h-4" />;
      case 'usb': return <Usb className="w-4 h-4" />;
      case 'bluetooth': return <Bluetooth className="w-4 h-4" />;
      default: return <Cpu className="w-4 h-4" />;
    }
  };

  return (
    <div className="bg-gray-800 rounded-lg p-4 border-2 border-gray-700 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-white font-semibold flex items-center gap-2">
          <Cpu className="w-5 h-5" />
          Hardware Acceleration
        </h3>
        <button
          onClick={() => setShowConfig(!showConfig)}
          className="text-gray-400 hover:text-white transition-colors"
        >
          <Settings className="w-5 h-5" />
        </button>
      </div>

      {/* Connection Status */}
      <div className="flex items-center gap-2 mb-4">
        <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-400' : 'bg-red-400'}`} />
        <span className="text-sm text-gray-300">
          {isConnected ? `Connected via ${connectionType}` : 'Not connected'}
        </span>
        {isConnected && getConnectionIcon()}
      </div>

      {/* Connection Buttons */}
      {!isConnected ? (
        <div className="grid grid-cols-3 gap-2 mb-4">
          <button
            onClick={() => handleConnect('serial')}
            className="flex items-center justify-center gap-1 px-3 py-2 bg-blue-600 hover:bg-blue-700 
              text-white text-sm rounded transition-colors"
          >
            <Usb className="w-4 h-4" />
            Serial
          </button>
          <button
            onClick={() => handleConnect('usb')}
            className="flex items-center justify-center gap-1 px-3 py-2 bg-green-600 hover:bg-green-700 
              text-white text-sm rounded transition-colors"
          >
            <Usb className="w-4 h-4" />
            USB
          </button>
          <button
            onClick={() => handleConnect('bluetooth')}
            className="flex items-center justify-center gap-1 px-3 py-2 bg-purple-600 hover:bg-purple-700 
              text-white text-sm rounded transition-colors"
          >
            <Bluetooth className="w-4 h-4" />
            BLE
          </button>
        </div>
      ) : (
        <button
          onClick={handleDisconnect}
          className="flex items-center justify-center gap-2 w-full px-3 py-2 bg-red-600 hover:bg-red-700 
            text-white text-sm rounded transition-colors mb-4"
        >
          <Power className="w-4 h-4" />
          Disconnect
        </button>
      )}

      {/* Hardware Info */}
      <div className="bg-gray-900 rounded p-3 mb-4">
        <div className="text-xs text-gray-400 mb-2">Hardware Capabilities:</div>
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="text-gray-300">
            <span className="text-green-400">✓</span> Microsecond precision
          </div>
          <div className="text-gray-300">
            <span className="text-green-400">✓</span> Real-time control
          </div>
          <div className="text-gray-300">
            <span className="text-green-400">✓</span> Hardware interrupts
          </div>
          <div className="text-gray-300">
            <span className="text-green-400">✓</span> Dedicated timing
          </div>
        </div>
      </div>

      {/* Timing Configuration */}
      {showConfig && (
        <div className="bg-gray-900 rounded p-3">
          <div className="text-sm text-white mb-3">Timing Configuration (microseconds)</div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs text-gray-400">Dot Duration:</label>
              <input
                type="number"
                value={config.dotDuration}
                onChange={(e) => handleConfigUpdate('dotDuration', parseInt(e.target.value))}
                className="w-20 px-2 py-1 text-xs bg-gray-800 text-white rounded border border-gray-600"
              />
            </div>
            <div className="flex items-center justify-between">
              <label className="text-xs text-gray-400">Dash Duration:</label>
              <input
                type="number"
                value={config.dashDuration}
                onChange={(e) => handleConfigUpdate('dashDuration', parseInt(e.target.value))}
                className="w-20 px-2 py-1 text-xs bg-gray-800 text-white rounded border border-gray-600"
              />
            </div>
            <div className="flex items-center justify-between">
              <label className="text-xs text-gray-400">Intra-letter Gap:</label>
              <input
                type="number"
                value={config.intraLetterGap}
                onChange={(e) => handleConfigUpdate('intraLetterGap', parseInt(e.target.value))}
                className="w-20 px-2 py-1 text-xs bg-gray-800 text-white rounded border border-gray-600"
              />
            </div>
            <div className="flex items-center justify-between">
              <label className="text-xs text-gray-400">Inter-letter Gap:</label>
              <input
                type="number"
                value={config.interLetterGap}
                onChange={(e) => handleConfigUpdate('interLetterGap', parseInt(e.target.value))}
                className="w-20 px-2 py-1 text-xs bg-gray-800 text-white rounded border border-gray-600"
              />
            </div>
            <div className="flex items-center justify-between">
              <label className="text-xs text-gray-400">Word Gap:</label>
              <input
                type="number"
                value={config.wordGap}
                onChange={(e) => handleConfigUpdate('wordGap', parseInt(e.target.value))}
                className="w-20 px-2 py-1 text-xs bg-gray-800 text-white rounded border border-gray-600"
              />
            </div>
          </div>
        </div>
      )}

      {/* Warning for software fallback */}
      {!isConnected && (
        <div className="flex items-start gap-2 p-2 bg-yellow-900/30 border border-yellow-600/30 rounded">
          <AlertCircle className="w-4 h-4 text-yellow-400 mt-0.5 flex-shrink-0" />
          <div className="text-xs text-yellow-200">
            Using software timing fallback. Connect hardware for microsecond precision.
          </div>
        </div>
      )}
    </div>
  );
};

export default HardwareControls;