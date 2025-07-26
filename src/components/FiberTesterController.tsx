import React, { useState, useEffect } from 'react';
import { Power, Send, Infinity, Square } from 'lucide-react';

const FiberTesterController: React.FC = () => {
  const [selectedColor, setSelectedColor] = useState<string>('');
  const [currentNumber, setCurrentNumber] = useState<string>('');
  const [isTransmitting, setIsTransmitting] = useState<boolean>(false);
  const [lightActive, setLightActive] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<string>('Select color and number');
  const [loopActive, setLoopActive] = useState<boolean>(false);
  const [loopRef, setLoopRef] = useState<{ current: boolean }>({ current: false });

  // Perfect timing constants - EXACT
  const DOT_DURATION = 120;
  const DASH_DURATION = 360;
  const SYMBOL_GAP = 120;
  const LETTER_GAP = 840;
  const CONFIRMATION_FLASH = 990;

  // Correct International Morse Code patterns
  const MORSE_PATTERNS: { [key: string]: string } = {
    'R': '·−·',     // Red
    'G': '−−·',     // Green  
    'B': '−···',    // Blue
    '0': '−−−−−',
    '1': '·−−−−',
    '2': '··−−−',
    '3': '···−−',
    '4': '····−',
    '5': '·····',
    '6': '−····',
    '7': '−−···',
    '8': '−−−··',
    '9': '−−−−·'
  };

  const colors = [
    { name: 'Red', letter: 'R', bgColor: 'bg-gradient-to-br from-red-500 to-red-700', hoverColor: 'hover:from-red-400 hover:to-red-600', textColor: 'text-white' },
    { name: 'Green', letter: 'G', bgColor: 'bg-gradient-to-br from-green-500 to-green-700', hoverColor: 'hover:from-green-400 hover:to-green-600', textColor: 'text-white' },
    { name: 'Blue', letter: 'B', bgColor: 'bg-gradient-to-br from-blue-500 to-blue-700', hoverColor: 'hover:from-blue-400 hover:to-blue-600', textColor: 'text-white' }
  ];

  const numbers = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', ''];

  // Get light colors based on selected color
  const getLightColors = () => {
    switch (selectedColor) {
      case 'Red':
        return { on: 'bg-red-400 shadow-red-400/50', inner: 'bg-red-300', iconColor: 'text-red-800' };
      case 'Green':
        return { on: 'bg-green-400 shadow-green-400/50', inner: 'bg-green-300', iconColor: 'text-green-800' };
      case 'Blue':
        return { on: 'bg-blue-400 shadow-blue-400/50', inner: 'bg-blue-300', iconColor: 'text-blue-800' };
      default:
        return { on: 'bg-yellow-400 shadow-yellow-400/50', inner: 'bg-yellow-300', iconColor: 'text-yellow-800' };
    }
  };

  const lightColors = getLightColors();

  const handleColorSelect = (color: string) => {
    if (isTransmitting || loopActive) return;
    setSelectedColor(color);
    setStatusMessage(currentNumber ? `${color} ${currentNumber} ready` : `${color} selected - Enter number`);
  };

  const handleNumberInput = (num: string) => {
    if (isTransmitting || loopActive) return;
    
    if (currentNumber.length < 3) {
      const newNumber = currentNumber + num;
      if (newNumber !== '0' && newNumber !== '00') {
        setCurrentNumber(newNumber);
        setStatusMessage(selectedColor ? `${selectedColor} ${newNumber} ready` : `Number ${newNumber} set - Select color`);
      }
    }
  };

  const handleClear = () => {
    // Stop loop immediately
    setLoopActive(false);
    loopRef.current = false;
    setIsTransmitting(false);
    setLightActive(false);
    
    // Clear selections
    setCurrentNumber('');
    setSelectedColor('');
    setStatusMessage('Select color and number');
  };

  // Sleep function
  const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

  // Flash light for specific duration
  const flashLight = async (duration: number) => {
    setLightActive(true);
    await sleep(duration);
    setLightActive(false);
  };

  // Transmit single Morse pattern
  const transmitMorsePattern = async (pattern: string) => {
    for (let i = 0; i < pattern.length; i++) {
      if (!loopRef.current && loopActive) break; // Check if loop was stopped
      
      const symbol = pattern[i];
      
      if (symbol === '·') {
        await flashLight(DOT_DURATION);
      } else if (symbol === '−') {
        await flashLight(DASH_DURATION);
      }
      
      // Symbol gap (except after last symbol)
      if (i < pattern.length - 1) {
        await sleep(SYMBOL_GAP);
      }
    }
  };

  // Complete transmission sequence
  const executeTransmission = async (color: string, number: string) => {
    // Transmit color
    const colorLetter = color[0].toUpperCase();
    const colorPattern = MORSE_PATTERNS[colorLetter];
    if (colorPattern) {
      await transmitMorsePattern(colorPattern);
      await sleep(LETTER_GAP);
    }
    
    // Transmit each digit
    for (const digit of number) {
      if (!loopRef.current && loopActive) break; // Check if loop was stopped
      
      const digitPattern = MORSE_PATTERNS[digit];
      if (digitPattern) {
        await transmitMorsePattern(digitPattern);
        await sleep(LETTER_GAP);
      }
    }
    
    // Confirmation flash
    await flashLight(CONFIRMATION_FLASH);
  };

  // Add missing component logic and return statement
  const handleSingleTransmit = async () => {
    if (!selectedColor || !currentNumber || isTransmitting) return;
    
    setIsTransmitting(true);
    setStatusMessage('Transmitting...');
    
    try {
      await executeTransmission(selectedColor, currentNumber);
      setStatusMessage('Transmission complete');
    } catch (error) {
      setStatusMessage('Transmission error');
    } finally {
      setIsTransmitting(false);
    }
  };

  const handleLoopTransmit = async () => {
    if (!selectedColor || !currentNumber || isTransmitting) return;
    
    setLoopActive(true);
    loopRef.current = true;
    setStatusMessage('Loop transmitting...');
    
    while (loopRef.current) {
      setIsTransmitting(true);
      await executeTransmission(selectedColor, currentNumber);
      setIsTransmitting(false);
      
      if (loopRef.current) {
        await sleep(2000); // 2 second pause between transmissions
      }
    }
    
    setLoopActive(false);
    setStatusMessage('Loop stopped');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Fiber Optic Tester</h1>
          <p className="text-gray-300">Morse Code Transmission Controller</p>
        </div>

        {/* Status Light */}
        <div className="flex justify-center mb-8">
          <div className={`w-24 h-24 rounded-full border-4 border-gray-600 flex items-center justify-center transition-all duration-150 ${
            lightActive 
              ? `${lightColors.on} shadow-lg shadow-2xl border-transparent` 
              : 'bg-gray-700'
          }`}>
            <div className={`w-16 h-16 rounded-full flex items-center justify-center ${
              lightActive ? lightColors.inner : 'bg-gray-600'
            }`}>
              <Power className={`w-8 h-8 ${lightActive ? lightColors.iconColor : 'text-gray-400'}`} />
            </div>
          </div>
        </div>

        {/* Status Message */}
        <div className="text-center mb-8">
          <p className="text-xl text-white font-medium">{statusMessage}</p>
        </div>

        {/* Color Selection */}
        <div className="mb-8">
          <h2 className="text-2xl font-semibold text-white mb-4 text-center">Select Color</h2>
          <div className="grid grid-cols-3 gap-4 max-w-md mx-auto">
            {colors.map((color) => (
              <button
                key={color.name}
                onClick={() => handleColorSelect(color.name)}
                disabled={isTransmitting || loopActive}
                className={`
                  ${color.bgColor} ${color.hoverColor} ${color.textColor}
                  py-4 px-6 rounded-lg font-semibold text-lg
                  transition-all duration-200 transform hover:scale-105
                  disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100
                  ${selectedColor === color.name ? 'ring-4 ring-white ring-opacity-50' : ''}
                `}
              >
                {color.name}
              </button>
            ))}
          </div>
        </div>

        {/* Number Pad */}
        <div className="mb-8">
          <h2 className="text-2xl font-semibold text-white mb-4 text-center">Enter Number</h2>
          <div className="grid grid-cols-3 gap-3 max-w-xs mx-auto mb-4">
            {numbers.map((num, index) => (
              <button
                key={index}
                onClick={() => num && handleNumberInput(num)}
                disabled={isTransmitting || loopActive || !num}
                className={`
                  py-4 px-6 rounded-lg font-bold text-xl
                  transition-all duration-200 transform hover:scale-105
                  ${num 
                    ? 'bg-gray-700 hover:bg-gray-600 text-white disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100' 
                    : 'invisible'
                  }
                `}
              >
                {num}
              </button>
            ))}
          </div>
          
          {/* Current Number Display */}
          <div className="text-center mb-4">
            <div className="inline-block bg-gray-800 px-6 py-3 rounded-lg">
              <span className="text-2xl font-mono text-white">
                {currentNumber || '___'}
              </span>
            </div>
          </div>
        </div>

        {/* Control Buttons */}
        <div className="flex justify-center gap-4 mb-8">
          <button
            onClick={handleSingleTransmit}
            disabled={!selectedColor || !currentNumber || isTransmitting || loopActive}
            className="
              bg-blue-600 hover:bg-blue-700 text-white
              py-3 px-8 rounded-lg font-semibold text-lg
              transition-all duration-200 transform hover:scale-105
              disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100
              flex items-center gap-2
            "
          >
            <Send className="w-5 h-5" />
            Send Once
          </button>

          <button
            onClick={loopActive ? handleClear : handleLoopTransmit}
            disabled={!selectedColor || !currentNumber || isTransmitting}
            className={`
              py-3 px-8 rounded-lg font-semibold text-lg
              transition-all duration-200 transform hover:scale-105
              disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100
              flex items-center gap-2
              ${loopActive 
                ? 'bg-red-600 hover:bg-red-700 text-white' 
                : 'bg-green-600 hover:bg-green-700 text-white'
              }
            `}
          >
            {loopActive ? (
              <>
                <Square className="w-5 h-5" />
                Stop Loop
              </>
            ) : (
              <>
                <Infinity className="w-5 h-5" />
                Loop Send
              </>
            )}
          </button>

          <button
            onClick={handleClear}
            disabled={isTransmitting}
            className="
              bg-gray-600 hover:bg-gray-700 text-white
              py-3 px-8 rounded-lg font-semibold text-lg
              transition-all duration-200 transform hover:scale-105
              disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100
            "
          >
            Clear
          </button>
        </div>
      </div>
    </div>
  );
};

export default FiberTesterController;