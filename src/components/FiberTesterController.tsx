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

  // Handle single transmission
  const handleTransmit = async () => {
    if (!selectedColor || !currentNumber || isTransmitting) return;
    
    setIsTransmitting(true);
    setStatusMessage('Transmitting...');
    
    await executeTransmission(selectedColor, currentNumber);
    
    setIsTransmitting(false);
    setStatusMessage(`${selectedColor} ${currentNumber} transmitted`);
  };

  // Handle loop transmission
  const handleLoop = async () => {
    if (!selectedColor || !currentNumber || isTransmitting) return;
    
    setLoopActive(true);
    loopRef.current = true;
    setStatusMessage('Loop active - transmitting...');
    
    while (loopRef.current) {
      setIsTransmitting(true);
      await executeTransmission(selectedColor, currentNumber);
      setIsTransmitting(false);
      
      if (loopRef.current) {
        await sleep(2000); // 2 second pause between transmissions
      }
    }
    
    setLoopActive(false);
    setStatusMessage(`${selectedColor} ${currentNumber} ready`);
  };

  const stopLoop = () => {
    setLoopActive(false);
    loopRef.current = false;
    setIsTransmitting(false);
    setLightActive(false);
    setStatusMessage(`${selectedColor} ${currentNumber} ready`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Fiber Optic Tester</h1>
          <p className="text-gray-300">Professional Morse Code Transmission System</p>
        </div>

        {/* Status Display */}
        <div className="bg-gray-800 rounded-xl p-6 mb-8 border border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <div className="text-white">
              <h2 className="text-xl font-semibold mb-1">Status</h2>
              <p className="text-gray-300">{statusMessage}</p>
            </div>
            
            {/* Light Indicator */}
            <div className="relative">
              <div className={`w-20 h-20 rounded-full border-4 border-gray-600 flex items-center justify-center transition-all duration-150 ${
                lightActive 
                  ? `${lightColors.on} shadow-lg shadow-lg` 
                  : 'bg-gray-700'
              }`}>
                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                  lightActive ? lightColors.inner : 'bg-gray-600'
                }`}>
                  <Power className={`w-6 h-6 ${lightActive ? lightColors.iconColor : 'text-gray-400'}`} />
                </div>
              </div>
              {lightActive && (
                <div className={`absolute inset-0 rounded-full ${lightColors.on} animate-ping opacity-75`}></div>
              )}
            </div>
          </div>
          
          {/* Current Selection Display */}
          <div className="flex gap-4 text-sm">
            <div className="bg-gray-700 px-3 py-2 rounded-lg">
              <span className="text-gray-400">Color: </span>
              <span className="text-white font-medium">{selectedColor || 'None'}</span>
            </div>
            <div className="bg-gray-700 px-3 py-2 rounded-lg">
              <span className="text-gray-400">Number: </span>
              <span className="text-white font-medium">{currentNumber || 'None'}</span>
            </div>
          </div>
        </div>

        {/* Color Selection */}
        <div className="bg-gray-800 rounded-xl p-6 mb-6 border border-gray-700">
          <h3 className="text-xl font-semibold text-white mb-4">Select Color</h3>
          <div className="grid grid-cols-3 gap-4">
            {colors.map((color) => (
              <button
                key={color.name}
                onClick={() => handleColorSelect(color.name)}
                disabled={isTransmitting || loopActive}
                className={`
                  ${color.bgColor} ${color.hoverColor} ${color.textColor}
                  p-4 rounded-lg font-semibold text-lg transition-all duration-200
                  transform hover:scale-105 active:scale-95
                  disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none
                  ${selectedColor === color.name ? 'ring-4 ring-white ring-opacity-50' : ''}
                  shadow-lg hover:shadow-xl
                `}
              >
                {color.name}
                <div className="text-sm opacity-80 mt-1">
                  {color.letter} = {MORSE_PATTERNS[color.letter]}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Number Input */}
        <div className="bg-gray-800 rounded-xl p-6 mb-6 border border-gray-700">
          <h3 className="text-xl font-semibold text-white mb-4">Enter Number (1-999)</h3>
          <div className="grid grid-cols-4 gap-3">
            {numbers.map((num, index) => (
              <button
                key={index}
                onClick={() => num && handleNumberInput(num)}
                disabled={isTransmitting || loopActive || !num}
                className={`
                  ${num ? 'bg-gradient-to-br from-gray-600 to-gray-700 hover:from-gray-500 hover:to-gray-600' : 'invisible'}
                  text-white p-4 rounded-lg font-semibold text-lg transition-all duration-200
                  transform hover:scale-105 active:scale-95
                  disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none
                  shadow-lg hover:shadow-xl
                `}
              >
                {num && (
                  <>
                    {num}
                    <div className="text-xs opacity-70 mt-1">
                      {MORSE_PATTERNS[num]}
                    </div>
                  </>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Control Buttons */}
        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {/* Single Transmission */}
            <button
              onClick={handleTransmit}
              disabled={!selectedColor || !currentNumber || isTransmitting || loopActive}
              className="bg-gradient-to-br from-blue-500 to-blue-700 hover:from-blue-400 hover:to-blue-600 
                         text-white p-4 rounded-lg font-semibold transition-all duration-200
                         transform hover:scale-105 active:scale-95 flex items-center justify-center gap-2
                         disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none
                         shadow-lg hover:shadow-xl"
            >
              <Send className="w-5 h-5" />
              Transmit
            </button>

            {/* Loop Transmission */}
            <button
              onClick={handleLoop}
              disabled={!selectedColor || !currentNumber || isTransmitting || loopActive}
              className="bg-gradient-to-br from-purple-500 to-purple-700 hover:from-purple-400 hover:to-purple-600 
                         text-white p-4 rounded-lg font-semibold transition-all duration-200
                         transform hover:scale-105 active:scale-95 flex items-center justify-center gap-2
                         disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none
                         shadow-lg hover:shadow-xl"
            >
              <Infinity className="w-5 h-5" />
              Loop
            </button>

            {/* Stop Loop */}
            <button
              onClick={stopLoop}
              disabled={!loopActive}
              className="bg-gradient-to-br from-orange-500 to-orange-700 hover:from-orange-400 hover:to-orange-600 
                         text-white p-4 rounded-lg font-semibold transition-all duration-200
                         transform hover:scale-105 active:scale-95 flex items-center justify-center gap-2
                         disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none
                         shadow-lg hover:shadow-xl"
            >
              <Square className="w-5 h-5" />
              Stop
            </button>

            {/* Clear All */}
            <button
              onClick={handleClear}
              disabled={isTransmitting}
              className="bg-gradient-to-br from-red-500 to-red-700 hover:from-red-400 hover:to-red-600 
                         text-white p-4 rounded-lg font-semibold transition-all duration-200
                         transform hover:scale-105 active:scale-95 flex items-center justify-center gap-2
                         disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none
                         shadow-lg hover:shadow-xl"
            >
              <Power className="w-5 h-5" />
              Clear
            </button>
          </div>
        </div>

        {/* Timing Information */}
        <div className="mt-6 bg-gray-800 rounded-xl p-4 border border-gray-700">
          <h4 className="text-lg font-semibold text-white mb-2">Timing Specifications</h4>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm text-gray-300">
            <div>
              <span className="text-gray-400">Dot:</span>
              <span className="text-white ml-1">{DOT_DURATION}ms</span>
            </div>
            <div>
              <span className="text-gray-400">Dash:</span>
              <span className="text-white ml-1">{DASH_DURATION}ms</span>
            </div>
            <div>
              <span className="text-gray-400">Symbol Gap:</span>
              <span className="text-white ml-1">{SYMBOL_GAP}ms</span>
            </div>
            <div>
              <span className="text-gray-400">Letter Gap:</span>
              <span className="text-white ml-1">{LETTER_GAP}ms</span>
            </div>
            <div>
              <span className="text-gray-400">Confirmation:</span>
              <span className="text-white ml-1">{CONFIRMATION_FLASH}ms</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FiberTesterController;