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
    // Confirmation flash
  await flashLight(CONFIRMATION_FLASH);

  setStatusMessage('Transmission complete');
  setIsTransmitting(false);
};

// Loop handler
const handleLoop = async () => {
  if (!selectedColor || !currentNumber) return;
  setLoopActive(true);
  loopRef.current = true;
  setStatusMessage('Looping transmission...');

  while (loopRef.current) {
    await executeTransmission(selectedColor, currentNumber);
    await sleep(1000); // Delay between loops
  }

  setLoopActive(false);
  setStatusMessage('Loop stopped');
};

// Send button handler
const handleSend = async () => {
  if (!selectedColor || !currentNumber || isTransmitting || loopActive) return;

  setIsTransmitting(true);
  setStatusMessage('Transmitting...');
  await executeTransmission(selectedColor, currentNumber);
  setStatusMessage('Transmission complete');
  setIsTransmitting(false);
};

return (
  <div className="flex flex-col items-center justify-center min-h-screen bg-black text-white p-6">
    <h1 className="text-3xl font-bold mb-4">Fiber Tester Controller</h1>
    <div className="grid grid-cols-3 gap-4 mb-4">
      {colors.map((color) => (
        <button
          key={color.name}
          className={`p-4 rounded ${color.bgColor} ${color.hoverColor} ${color.textColor}`}
          onClick={() => handleColorSelect(color.name)}
        >
          {color.name}
        </button>
      ))}
    </div>
    <div className="grid grid-cols-3 gap-2 mb-4">
      {numbers.map((num, idx) => (
        <button
          key={idx}
          className="bg-gray-700 hover:bg-gray-600 text-white p-4 rounded"
          onClick={() => handleNumberInput(num)}
        >
          {num}
        </button>
      ))}
    </div>
    <div className="flex gap-4">
      <button onClick={handleSend} className="bg-blue-600 p-3 rounded text-white flex items-center">
        <Send className="mr-2" /> Send
      </button>
      <button onClick={handleLoop} className="bg-yellow-600 p-3 rounded text-white flex items-center">
        <Infinity className="mr-2" /> Loop
      </button>
      <button onClick={handleClear} className="bg-red-600 p-3 rounded text-white flex items-center">
        <Square className="mr-2" /> Stop
      </button>
    </div>
    <div className="mt-6 text-center">{statusMessage}</div>
    <div className={`w-20 h-20 mt-4 rounded-full shadow-2xl ${lightActive ? lightColors.on : 'bg-gray-700'}`}>
      <div className={`w-10 h-10 m-5 rounded-full ${lightColors.inner}`}></div>
    </div>
  </div>
);
};
