import React, { useState, useEffect } from 'react';
import { Power, Send, RotateCcw } from 'lucide-react';
import PythonBridge, { PythonResponse, TransmissionStep } from '../utils/pythonBridge';
import HardwareControls from './HardwareControls';
import { HardwareTimingController, HardwareTimingConfig } from '../hardware/TimingController';

const FiberTesterController: React.FC = () => {
  const [selectedColor, setSelectedColor] = useState<string>('');
  const [currentNumber, setCurrentNumber] = useState<string>('');
  const [isTransmitting, setIsTransmitting] = useState<boolean>(false);
  const [isContinuousFlashing, setIsContinuousFlashing] = useState<boolean>(false);
  const [flashingIntervalId, setFlashingIntervalId] = useState<NodeJS.Timeout | null>(null);
  const [lightOn, setLightOn] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<string>('Select color and number');
  const [sentHistory, setSentHistory] = useState<string[]>([]);
  const [pythonBridge] = useState(() => PythonBridge.getInstance());
  const [hardwareController] = useState(() => new HardwareTimingController());
  const [isHardwareConnected, setIsHardwareConnected] = useState(false);
  const [hardwareConfig, setHardwareConfig] = useState<HardwareTimingConfig>({
    dotDuration: 250000,     // 250ms in microseconds (4 Hz)
    dashDuration: 750000,    // 750ms in microseconds
    intraLetterGap: 250000,  // 250ms in microseconds
    interLetterGap: 750000,  // 750ms in microseconds
    wordGap: 1750000         // 1750ms in microseconds
  });

  const colors = [
    { name: 'Red', letter: 'R', bgColor: 'bg-red-600', hoverColor: 'hover:bg-red-700' },
    { name: 'Green', letter: 'G', bgColor: 'bg-green-600', hoverColor: 'hover:bg-green-700' },
    { name: 'Blue', letter: 'B', bgColor: 'bg-blue-600', hoverColor: 'hover:bg-blue-700' }
  ];

  // Get light colors based on selected color
  const getLightColors = () => {
    switch (selectedColor) {
      case 'Red':
        return {
          on: 'bg-red-400 shadow-red-400/50',
          inner: 'bg-red-300',
          iconColor: 'text-red-800'
        };
      case 'Green':
        return {
          on: 'bg-green-400 shadow-green-400/50',
          inner: 'bg-green-300',
          iconColor: 'text-green-800'
        };
      case 'Blue':
        return {
          on: 'bg-blue-400 shadow-blue-400/50',
          inner: 'bg-blue-300',
          iconColor: 'text-blue-800'
        };
      default:
        return {
          on: 'bg-yellow-400 shadow-yellow-400/50',
          inner: 'bg-yellow-300',
          iconColor: 'text-yellow-800'
        };
    }
  };

  const lightColors = getLightColors();

  const numbers = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', ''];

  // Listen for hardware output events
  useEffect(() => {
    const handleHardwareOutput = (event: CustomEvent) => {
      setLightOn(event.detail.state);
    };

    window.addEventListener('hardwareOutput', handleHardwareOutput as EventListener);
    return () => {
      window.removeEventListener('hardwareOutput', handleHardwareOutput as EventListener);
    };
  }, []);

  const handleColorSelect = (color: string) => {
    if (!isTransmitting) {
      pythonBridge.setColor(color).then((response: PythonResponse) => {
        if (response.success) {
          setSelectedColor(color);
          setStatusMessage(response.message);
        } else {
          setStatusMessage(response.message);
        }
      });
    }
  };

  const handleNumberInput = (num: string) => {
    if (!isTransmitting && num) {
      const newNumber = currentNumber + num;
      if (parseInt(newNumber) <= 100) {
        pythonBridge.setNumber(newNumber).then((response: PythonResponse) => {
          if (response.success) {
            setCurrentNumber(newNumber);
            setStatusMessage(selectedColor ? `${selectedColor} ${newNumber} ready` : response.message);
          } else {
            setStatusMessage(response.message);
          }
        });
      }
    }
  };

  const handleClear = () => {
    if (!isTransmitting) {
      pythonBridge.clearSelection().then((response: PythonResponse) => {
        setCurrentNumber('');
        setSelectedColor('');
        setStatusMessage(response.message);
      });
    }
  };

  const executeTransmissionSequence = async (sequence: TransmissionStep[]) => {
    if (isHardwareConnected) {
      // Use hardware acceleration for precise timing
      const hardwareSequence = sequence.map(step => ({
        type: step.type as 'dot' | 'dash' | 'gap',
        duration: step.type === 'dot' ? hardwareConfig.dotDuration :
                 step.type === 'dash' ? hardwareConfig.dashDuration :
                 step.type === 'gap' ? (step.description.includes('Inter-letter') ? hardwareConfig.interLetterGap : hardwareConfig.intraLetterGap) :
                 step.duration * 1000 // Convert ms to microseconds
      }));
      
      await hardwareController.executeSequence(hardwareSequence, isLoop);
    } else {
      // Software fallback with visual timing
      for (const step of sequence) {
        console.log(`Executing step: ${step.type} for ${step.duration}ms`);
        
        if (step.type === 'dot' || step.type === 'dash' || step.type === 'confirmation') {
          console.log('Turning light ON');
          setLightOn(true);
          await new Promise(resolve => setTimeout(resolve, step.duration));
          console.log('Turning light OFF');
          setLightOn(false);
        } else if (step.type === 'gap') {
          console.log('Gap - light stays OFF');
          setLightOn(false);
          await new Promise(resolve => setTimeout(resolve, step.duration));
        }
      }
      
      // Ensure light is off after sequence
      setLightOn(false);
    }
  };

  const handleStartFlash = async () => {
    if (!selectedColor || !currentNumber || isTransmitting || isContinuousFlashing) return;

    setIsContinuousFlashing(true);
    setStatusMessage(`Continuously flashing ${selectedColor} ${currentNumber}...`);
    console.log('Starting continuous flash');

    try {
      const prepareResponse = await pythonBridge.prepareTransmission(selectedColor, currentNumber);
      
      if (!prepareResponse.success || !prepareResponse.sequence) {
        setStatusMessage(prepareResponse.message);
        setIsContinuousFlashing(false);
        return;
      }
      
      console.log('Starting infinite loop with sequence:', prepareResponse.sequence);
      
      // Start the infinite loop
      const runContinuousSequence = async () => {
        while (isContinuousFlashing) {
          console.log('Running sequence cycle');
          await executeTransmissionSequence(prepareResponse.sequence);
          
          // Check if we should continue
          if (isContinuousFlashing) {
            console.log('Adding word gap before next cycle');
            await new Promise(resolve => setTimeout(resolve, 1750)); // Word gap
          }
        }
        console.log('Continuous flash stopped');
        setLightOn(false);
      };
      
      runContinuousSequence();
      
    } catch (error) {
      setStatusMessage(`Flash failed: ${error}`);
      setIsContinuousFlashing(false);
    }
  };

  const handleStopFlash = () => {
    console.log('Stopping continuous flash');
    setIsContinuousFlashing(false);
    hardwareController.stop(); // Stop hardware execution
    if (flashingIntervalId) {
      clearInterval(flashingIntervalId);
      setFlashingIntervalId(null);
    }
    setLightOn(false);
    setStatusMessage(`${selectedColor} ${currentNumber} ready`);
  };

  const handleSend = async () => {
    if (!selectedColor || !currentNumber || isTransmitting) return;

    setIsTransmitting(true);
    setStatusMessage(`Sending ${selectedColor} ${currentNumber}...`);

    try {
      // Prepare transmission using Python logic
      const prepareResponse = await pythonBridge.prepareTransmission(selectedColor, currentNumber);
      
      if (!prepareResponse.success || !prepareResponse.sequence) {
        setStatusMessage(prepareResponse.message);
        return;
      }
      
      setStatusMessage(prepareResponse.message);
      
      // Execute the transmission sequence
      console.log('Starting transmission sequence:', prepareResponse.sequence);
      await executeTransmissionSequence(prepareResponse.sequence);
      
      // Complete transmission
      const completeResponse = await pythonBridge.completeTransmission(selectedColor, currentNumber);
      
      if (completeResponse.success && completeResponse.history) {
        setSentHistory(completeResponse.history);
        setStatusMessage(completeResponse.message);
      }
      
      // Reset after successful transmission
      setTimeout(() => {
        setCurrentNumber('');
        setSelectedColor('');
        setStatusMessage('Select color and number');
      }, 2000);

    } catch (error) {
      setStatusMessage(`Transmission failed: ${error}`);
    } finally {
      setIsTransmitting(false);
    }
  };

  const handleHardwareStateChange = (connected: boolean) => {
    setIsHardwareConnected(connected);
  };

  const handleTimingConfigChange = (config: HardwareTimingConfig) => {
    setHardwareConfig(config);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 p-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Fiber Tester Controller</h1>
          <p className="text-gray-300">Select color and number to transmit Morse code</p>
        </div>

        {/* Status Light */}
        <div className="flex justify-center mb-8">
          <div className="relative">
            {/* Debug info */}
            <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 text-xs text-gray-400">
              Light: {lightOn ? 'ON' : 'OFF'}
            </div>
            <div className={`w-24 h-24 rounded-full border-4 border-gray-600 transition-all duration-200 ${
              lightOn ? `${lightColors.on} shadow-lg` : 'bg-gray-800'
            }`}>
              <div className={`absolute inset-2 rounded-full transition-all duration-200 ${
                lightOn ? `${lightColors.inner} shadow-inner` : 'bg-gray-700'
              }`}>
                <Power className={`w-8 h-8 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 ${
                  lightOn ? lightColors.iconColor : 'text-gray-500'
                }`} />
              </div>
            </div>
            <div className="text-center mt-2 text-sm text-gray-400">Signal Light</div>
          </div>
        </div>

        {/* Hardware Controls */}
        <HardwareControls 
          onHardwareStateChange={handleHardwareStateChange}
          onTimingConfigChange={handleTimingConfigChange}
        />

        {/* Status Display */}
        <div className="bg-gray-800 rounded-lg p-4 mb-6 border-2 border-gray-700">
          <div className="text-center">
            <div className="text-lg font-semibold text-white mb-2">{statusMessage}</div>
            <div className="text-sm text-gray-400">
              {selectedColor && `Color: ${selectedColor}`}
              {selectedColor && currentNumber && ' | '}
              {currentNumber && `Number: ${currentNumber}`}
            </div>
          </div>
        </div>

        {/* Color Buttons */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          {colors.map((color) => (
            <button
              key={color.name}
              onClick={() => handleColorSelect(color.name)}
              disabled={isTransmitting}
              className={`h-24 rounded-2xl ${color.bgColor} ${color.hoverColor} 
                border-4 border-gray-600 shadow-lg transform transition-all duration-200
                hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed
                ${selectedColor === color.name ? 'ring-4 ring-yellow-400' : ''}`}
            >
              <div className="text-4xl font-bold text-white opacity-80">
                {color.letter}
              </div>
            </button>
          ))}
        </div>

        {/* Number Pad */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          {numbers.map((num, index) => (
            <button
              key={index}
              onClick={() => handleNumberInput(num)}
              disabled={isTransmitting || !num}
              className={`h-16 rounded-xl bg-gray-200 hover:bg-gray-300 
                border-4 border-gray-600 shadow-lg transform transition-all duration-200
                hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed
                ${!num ? 'invisible' : ''}`}
            >
              <div className="text-2xl font-bold text-gray-800">
                {num}
              </div>
            </button>
          ))}
        </div>

        {/* Control Buttons */}
        <div className="flex gap-4 justify-center mb-6">
          <button
            onClick={handleClear}
            disabled={isTransmitting || isContinuousFlashing}
            className="flex items-center gap-2 px-6 py-3 bg-gray-600 hover:bg-gray-700 
              text-white rounded-lg border-2 border-gray-500 transition-all duration-200
              hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <RotateCcw className="w-5 h-5" />
            Clear
          </button>
          
          {isContinuousFlashing ? (
            <button
              onClick={handleStopFlash}
              className="flex items-center gap-2 px-8 py-3 bg-red-600 hover:bg-red-700 
                text-white rounded-lg border-2 border-red-500 transition-all duration-200
                hover:scale-105 active:scale-95"
            >
              <Power className="w-5 h-5" />
              Stop Flash
            </button>
          ) : (
            <>
              <button
                onClick={handleStartFlash}
                disabled={!selectedColor || !currentNumber || isTransmitting}
                className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 
                  text-white rounded-lg border-2 border-blue-500 transition-all duration-200
                  hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Power className="w-5 h-5" />
                Start Flash
              </button>
              
              <button
                onClick={handleSend}
                disabled={!selectedColor || !currentNumber || isTransmitting}
                className="flex items-center gap-2 px-8 py-3 bg-green-600 hover:bg-green-700 
                  text-white rounded-lg border-2 border-green-500 transition-all duration-200
                  hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send className="w-5 h-5" />
                {isTransmitting ? 'Sending...' : 'Send Once'}
              </button>
            </>
          )}
        </div>

        {/* Transmission History */}
        {sentHistory.length > 0 && (
          <div className="bg-gray-800 rounded-lg p-4 border-2 border-gray-700">
            <h3 className="text-white font-semibold mb-2">Recent Transmissions</h3>
            <div className="space-y-1">
              {sentHistory.map((message, index) => (
                <div key={index} className="text-sm text-gray-300 opacity-80">
                  {message}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FiberTesterController;