import React, { useState, useEffect } from 'react';
import { Power, Send, RotateCcw, Infinity, Square } from 'lucide-react';
import PythonBridge, { PythonResponse, TransmissionStep } from '../utils/pythonBridge';

const FiberTesterController: React.FC = () => {
  const [selectedColor, setSelectedColor] = useState<string>('');
  const [currentNumber, setCurrentNumber] = useState<string>('');
  const [isTransmitting, setIsTransmitting] = useState<boolean>(false);
  const [isContinuousFlashing, setIsContinuousFlashing] = useState<boolean>(false);
  const [lightActive, setLightActive] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<string>('Select color and number');
  const [sentHistory, setSentHistory] = useState<string[]>([]);
  const [pythonBridge] = useState(() => PythonBridge.getInstance());
  const [loopActive, setLoopActive] = useState<boolean>(false);
  const [loopRef] = useState({ current: false });
  const [transmissionTime, setTransmissionTime] = useState<number>(0);
  const [isTimerRunning, setIsTimerRunning] = useState<boolean>(false);
  const [expectedDuration, setExpectedDuration] = useState<number>(0);

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

  const handleColorSelect = (color: string) => {
    if (!isTransmitting && !loopActive) {
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
    if (!isTransmitting && !loopActive && num) {
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
    // Stop any looping first
    if (loopActive) {
      stopLoopingMorse();
      return;
    }
    
    pythonBridge.clearSelection().then((response: PythonResponse) => {
      setCurrentNumber('');
      setSelectedColor('');
      setStatusMessage(response.message);
    });
  };

  const executeTransmissionSequence = async (sequence: TransmissionStep[]) => {
    const startTime = Date.now();
    setIsTimerRunning(true);
    setTransmissionTime(0);
    
    // Calculate expected duration
    const totalExpected = sequence.reduce((sum, step) => sum + step.duration, 0);
    setExpectedDuration(totalExpected);
    
    // Update timer every 10ms during transmission
    const timerInterval = setInterval(() => {
      setTransmissionTime(Date.now() - startTime);
    }, 10);
    
    for (const step of sequence) {
      if (step.type === 'dot' || step.type === 'dash' || step.type === 'confirmation') {
        // Turn on the light
        setLightActive(true);
        
        await new Promise(resolve => setTimeout(resolve, step.duration));
        
        // Turn off the light
        setLightActive(false);
        
        // Add small gap after light unless it's the last step
        if (step !== sequence[sequence.length - 1]) {
          await new Promise(resolve => setTimeout(resolve, 33));
        }
      } else if (step.type === 'gap') {
        await new Promise(resolve => setTimeout(resolve, step.duration));
      }
    }
    
    clearInterval(timerInterval);
    const finalTime = Date.now() - startTime;
    setTransmissionTime(finalTime);
    setIsTimerRunning(false);
  };

  const delay = (ms: number): Promise<void> => {
    return new Promise((resolve) => setTimeout(resolve, ms));
  };

  const handleSend = async () => {
    if (!selectedColor || !currentNumber || isTransmitting || loopActive) return;

    setIsTransmitting(true);

    try {
      // Prepare transmission using Python logic
      const prepareResponse = await pythonBridge.prepareTransmission(selectedColor, currentNumber);
      
      if (!prepareResponse.success || !prepareResponse.sequence) {
        setStatusMessage(prepareResponse.message);
        setIsTransmitting(false);
        return;
      }
      
      setStatusMessage(prepareResponse.message);
      
      // Execute the transmission sequence
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
        setTransmissionTime(0);
      }, 2000);

    } catch (error) {
      setStatusMessage(`Transmission failed: ${error}`);
    } finally {
      setIsTransmitting(false);
      setLightActive(false);
    }
  };

  const handleLoop = async () => {
    if (!selectedColor || !currentNumber || loopActive) return;
    setLoopActive(true);
    setIsTransmitting(true);
    setStatusMessage(`Continuously flashing ${selectedColor} ${currentNumber}...`);

    loopRef.current = true;

    while (loopRef.current) {
      try {
        // Reset timer for each loop cycle
        console.log('=== Starting new loop cycle ===');
        // Diagnostic: See if Python is returning what you expect
        const prepareResponse = await pythonBridge.prepareTransmission(selectedColor, currentNumber);
        console.log('prepareResponse:', prepareResponse);

        if (!prepareResponse.success || !prepareResponse.sequence || prepareResponse.sequence.length === 0) {
          setStatusMessage(prepareResponse.message || 'Invalid sequence');
          setLoopActive(false);
          setIsTransmitting(false);
          loopRef.current = false;
          break;
        }

        // Diagnostic: Output sequence for every loop
        console.log('sequence:', prepareResponse.sequence);

        // Actually run the flash sequence
        await executeTransmissionSequence(prepareResponse.sequence);

        // Diagnostic: Confirm completion of flash
        console.log('Completed transmission sequence.');

        await delay(250);

      } catch (error) {
        setStatusMessage(`Loop failed: ${error}`);
        setLoopActive(false);
        setIsTransmitting(false);
        loopRef.current = false;
        break;
      }
    }

    // Reset state at the end
    setIsTransmitting(false);
    setLightActive(false);
    setStatusMessage('Select color and number');
    setCurrentNumber('');
    setSelectedColor('');
  };

  const stopLoopingMorse = () => {
    loopRef.current = false;
    setLoopActive(false);
    setIsTransmitting(false);
    setLightActive(false);
    setStatusMessage('Select color and number');
    setCurrentNumber('');
    setSelectedColor('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 p-8">
      {/* Full-Screen Timer Overlay */}
      {loopActive && (
        <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50">
          <div className="text-center">
            {/* Big Timer Display */}
            <div className="text-8xl font-mono font-bold text-white mb-8">
              {(transmissionTime / 1000).toFixed(2)}s
            </div>
            
            {/* Status */}
            <div className="text-2xl text-gray-300 mb-4">
              Continuously flashing {selectedColor} {currentNumber}
            </div>
            
            {/* Progress Bar */}
            <div className="w-96 h-4 bg-gray-700 rounded-full mb-8 mx-auto overflow-hidden">
              <div 
                className={`h-full transition-all duration-75 ${
                  lightActive ? `${lightColors.on.replace('bg-', 'bg-').replace('-400', '-500')}` : 'bg-gray-600'
                }`}
                style={{
                  width: expectedDuration > 0 ? `${Math.min((transmissionTime / expectedDuration) * 100, 100)}%` : '0%'
                }}
              />
            </div>
            
            {/* Expected vs Actual */}
            <div className="text-lg text-gray-400 mb-8">
              Expected: {(expectedDuration / 1000).toFixed(2)}s | 
              {transmissionTime > expectedDuration ? (
                <span className="text-yellow-400 ml-2">Overtime</span>
              ) : (
                <span className="text-green-400 ml-2">On Time</span>
              )}
            </div>
            
            {/* Large Stop Button */}
            <button
              onClick={handleClear}
              className="px-12 py-6 bg-red-600 hover:bg-red-700 text-white text-2xl font-bold 
                rounded-2xl border-4 border-red-400 animate-pulse transition-all duration-200
                hover:scale-105 active:scale-95"
            >
              <Square className="w-8 h-8 inline mr-3" />
              STOP
            </button>
          </div>
        </div>
      )}
      
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Fiber Tester Controller</h1>
          <p className="text-gray-300">Select color and number to transmit Morse code</p>
        </div>

        {/* Status Light */}
        <div className="flex justify-center mb-8">
          <div className="relative">
            {/* Main enclosure */}
            <div className="w-24 h-24 rounded-full border-4 border-gray-600 bg-gray-800 relative overflow-hidden">
              {/* Single light */}
              <div className={`absolute inset-0 rounded-full transition-all duration-75 ${
                lightActive ? `${lightColors.on} shadow-lg` : 'bg-gray-800'
              }`}>
                <div className={`absolute inset-1 rounded-full transition-all duration-75 ${
                  lightActive ? `${lightColors.inner} shadow-inner` : 'bg-gray-700'
                }`} />
              </div>
              
              {/* Power icon overlay */}
              <div className="absolute inset-0 flex items-center justify-center">
                <Power className={`w-8 h-8 transition-all duration-75 ${
                  lightActive ? lightColors.iconColor : 'text-gray-500'
                }`} />
              </div>
            </div>
            <div className="text-center mt-2 text-sm text-gray-400">Signal Light</div>
          </div>
        </div>

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
              disabled={isTransmitting || loopActive}
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
              disabled={isTransmitting || loopActive || !num}
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
        {loopActive && (
          <div className="flex items-center justify-center text-green-400 font-bold mb-2">
            <Infinity className="w-5 h-5 mr-2" />
            Looping...
          </div>
        )}
        
        <div className="flex gap-3 justify-center mb-6">
          <button
            onClick={handleClear}
            disabled={false}
            className={`flex items-center gap-2 px-4 py-3
              ${loopActive ? 'bg-red-700 border-red-400 animate-pulse' : 'bg-red-600 hover:bg-red-700'}
              text-white rounded-lg border-2 border-gray-500 transition-all duration-200
              hover:scale-105 active:scale-95`}
          >
            <Square className="w-5 h-5" />
            Stop
          </button>
          
          <button
            onClick={handleSend}
            disabled={!selectedColor || !currentNumber || loopActive}
            className="flex items-center gap-2 px-6 py-3 bg-green-600 hover:bg-green-700 
              text-white rounded-lg border-2 border-green-500 transition-all duration-200
              hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <RotateCcw className="w-5 h-5" />
            {isTransmitting && !loopActive ? 'Sending...' : 'Send'}
          </button>

          <button
            onClick={handleLoop}
            disabled={!selectedColor || !currentNumber || loopActive}
            className={`flex items-center gap-2 px-6 py-3 text-white rounded-lg border-2 transition-all duration-200
              hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed
              bg-blue-600 hover:bg-blue-700 border-blue-500`}
          >
            <Infinity className="w-5 h-5" />
            Loop
          </button>
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