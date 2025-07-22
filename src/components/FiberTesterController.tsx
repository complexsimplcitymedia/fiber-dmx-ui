import React, { useState, useEffect } from 'react';
import { Power, Send, RotateCcw, Infinity, Square } from 'lucide-react';
import PythonBridge, { PythonResponse, TransmissionStep } from '../utils/pythonBridge';

const FiberTesterController: React.FC = () => {
  const [selectedColor, setSelectedColor] = useState<string>('');
  const [currentNumber, setCurrentNumber] = useState<string>('');
  const [isTransmitting, setIsTransmitting] = useState<boolean>(false);
  const [isContinuousFlashing, setIsContinuousFlashing] = useState<boolean>(false);
  const [diode1Active, setDiode1Active] = useState<boolean>(false);
  const [diode2Active, setDiode2Active] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<string>('Select color and number');
  const [sentHistory, setSentHistory] = useState<string[]>([]);
  const [pythonBridge] = useState(() => PythonBridge.getInstance());
  const [continuousInterval, setContinuousInterval] = useState<NodeJS.Timeout | null>(null);
  const [isLooping, setIsLooping] = useState<boolean>(false);
  const [loopSequence, setLoopSequence] = useState<TransmissionStep[]>([]);

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
    if (!isTransmitting || isLooping) {
      // Stop any looping first
      if (isLooping) {
        setIsLooping(false);
        setIsTransmitting(false);
        stopContinuousFlashing();
      }
      
      pythonBridge.clearSelection().then((response: PythonResponse) => {
        setCurrentNumber('');
        setSelectedColor('');
        setStatusMessage(response.message);
      });
    }
  };

  const executeTransmissionSequence = async (sequence: TransmissionStep[]) => {
    let currentDiode = 1; // Start with diode 1
    
    for (const step of sequence) {
      if (step.type === 'dot' || step.type === 'dash' || step.type === 'confirmation') {
        // Alternate between diodes for each flash
        if (currentDiode === 1) {
          setDiode1Active(true);
          setDiode2Active(false);
          currentDiode = 2;
        } else {
          setDiode1Active(false);
          setDiode2Active(true);
          currentDiode = 1;
        }
        
        await new Promise(resolve => setTimeout(resolve, step.duration));
        
        // Turn off current diode
        setDiode1Active(false);
        setDiode2Active(false);
        
        // Add small gap after light unless it's the last step
        if (step !== sequence[sequence.length - 1]) {
          await new Promise(resolve => setTimeout(resolve, 33));
        }
      } else if (step.type === 'gap') {
        await new Promise(resolve => setTimeout(resolve, step.duration));
      }
    }
  };

  const stopContinuousFlashing = () => {
    if (continuousInterval) {
      clearInterval(continuousInterval);
      setContinuousInterval(null);
    }
    setIsContinuousFlashing(false);
    setIsLooping(false);
    setDiode1Active(false);
    setDiode2Active(false);
    setStatusMessage(selectedColor && currentNumber ? `${selectedColor} ${currentNumber} ready` : 'Select color and number');
  };

  const handleSend = async () => {
    if (!selectedColor || !currentNumber || (isTransmitting && !isLooping)) return;

    // If already looping, stop the loop
    if (isLooping) {
      setIsLooping(false);
      setIsTransmitting(false);
      stopContinuousFlashing();
      return;
    }

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
        if (!isLooping) {
          setCurrentNumber('');
          setSelectedColor('');
          setStatusMessage('Select color and number');
        }
      }, 2000);

    } catch (error) {
      setStatusMessage(`Transmission failed: ${error}`);
    } finally {
      if (!isLooping) {
        setIsTransmitting(false);
      }
    }
  };

  const handleLoop = async () => {
    if (!selectedColor || !currentNumber) return;

    if (isLooping) {
      // Stop looping
      setIsLooping(false);
      setIsTransmitting(false);
      stopContinuousFlashing();
      return;
    }

    // Start looping
    setIsLooping(true);
    setIsTransmitting(true);

    try {
      // Prepare transmission once
      const prepareResponse = await pythonBridge.prepareTransmission(selectedColor, currentNumber);
      
      if (!prepareResponse.success || !prepareResponse.sequence) {
        setStatusMessage(prepareResponse.message);
        setIsLooping(false);
        setIsTransmitting(false);
        return;
      }
      
      setLoopSequence(prepareResponse.sequence);
      setStatusMessage(`Continuously flashing ${selectedColor} ${currentNumber}...`);
      
      // Execute first pattern immediately
      await executeTransmissionSequence(prepareResponse.sequence);
      
      // Set up continuous repetition
      const interval = setInterval(async () => {
        if (isLooping) {
          // Short pause between repeats
          await new Promise(resolve => setTimeout(resolve, 250));
          await executeTransmissionSequence(prepareResponse.sequence);
        }
      }, prepareResponse.total_duration + 250);
      
      setContinuousInterval(interval);
      
    } catch (error) {
      setStatusMessage(`Pattern failed: ${error}`);
      setIsLooping(false);
      setIsTransmitting(false);
    }
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
            {/* Main enclosure */}
            <div className="w-24 h-24 rounded-full border-4 border-gray-600 bg-gray-800 relative overflow-hidden">
              {/* Unified light appearance with dual diode control */}
              <div className={`absolute inset-0 rounded-full transition-all duration-75 ${
                (diode1Active || diode2Active) ? `${lightColors.on} shadow-lg` : 'bg-gray-800'
              }`}>
                <div className={`absolute inset-1 rounded-full transition-all duration-75 ${
                  (diode1Active || diode2Active) ? `${lightColors.inner} shadow-inner` : 'bg-gray-700'
                }`} />
              </div>
              
              {/* Power icon overlay */}
              <div className="absolute inset-0 flex items-center justify-center">
                <Power className={`w-8 h-8 transition-all duration-75 ${
                  (diode1Active || diode2Active) ? lightColors.iconColor : 'text-gray-500'
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
        <div className="flex gap-3 justify-center mb-6">
          <button
            onClick={handleClear}
            disabled={false}
            className="flex items-center gap-2 px-4 py-3 bg-red-600 hover:bg-red-700 
              text-white rounded-lg border-2 border-gray-500 transition-all duration-200
              hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Square className="w-5 h-5" />
            {isLooping ? 'Stop' : 'Stop'}
          </button>
          
          <button
            onClick={handleSend}
            disabled={!selectedColor || !currentNumber}
            className="flex items-center gap-2 px-6 py-3 bg-green-600 hover:bg-green-700 
              text-white rounded-lg border-2 border-green-500 transition-all duration-200
              hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <RotateCcw className="w-5 h-5" />
            {isTransmitting && !isLooping ? 'Sending...' : 'Send'}
          </button>

          <button
            onClick={handleLoop}
            disabled={!selectedColor || !currentNumber}
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