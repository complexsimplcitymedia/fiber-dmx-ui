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

  const DOT_DURATION = 120;
  const DASH_DURATION = 360;
  const SYMBOL_GAP = 120;
  const LETTER_GAP = 840;
  const CONFIRMATION_FLASH = 990;

  const MORSE_PATTERNS: { [key: string]: string } = {
    'R': '·−·',     // dot-dash-dot
    'G': '−−·',     // dash-dash-dot  
    'B': '−···',    // dash-dot-dot-dot
    '0': '−−−−−',   // 5 dashes
    '1': '·−−−−',   // dot + 4 dashes
    '2': '··−−−',   // 2 dots + 3 dashes
    '3': '···−−',   // 3 dots + 2 dashes
    '4': '····−',   // 4 dots + 1 dash
    '5': '·····',   // 5 dots
    '6': '−····',   // 1 dash + 4 dots
    '7': '−−···',   // 2 dashes + 3 dots
    '8': '−−−··',   // 3 dashes + 2 dots
    '9': '−−−−·'    // 4 dashes + 1 dot
  };

  const colors = [
    { name: 'Red', letter: 'R', bgColor: 'bg-gradient-to-br from-red-500 to-red-700', hoverColor: 'hover:from-red-400 hover:to-red-600', textColor: 'text-white' },
    { name: 'Green', letter: 'G', bgColor: 'bg-gradient-to-br from-green-500 to-green-700', hoverColor: 'hover:from-green-400 hover:to-green-600', textColor: 'text-white' },
    { name: 'Blue', letter: 'B', bgColor: 'bg-gradient-to-br from-blue-500 to-blue-700', hoverColor: 'hover:from-blue-400 hover:to-blue-600', textColor: 'text-white' }
  ];

  const numbers = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', ''];

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
    setLoopActive(false);
    loopRef.current = false;
    setIsTransmitting(false);
    setLightActive(false);
    setCurrentNumber('');
    setSelectedColor('');
    setStatusMessage('Select color and number');
  };

  const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

  const flashLight = async (duration: number) => {
    setLightActive(true);
    await sleep(duration);
    setLightActive(false);
  };

  const transmitMorsePattern = async (pattern: string) => {
    for (let i = 0; i < pattern.length; i++) {
      if (!loopRef.current && loopActive) break;
      const symbol = pattern[i];
      if (symbol === '·') {
        await flashLight(DOT_DURATION);
      } else if (symbol === '−') {
        await flashLight(DASH_DURATION);
      }
      if (i < pattern.length - 1) {
        await sleep(SYMBOL_GAP);
      }
    }
  };

  const executeTransmission = async (color: string, number: string) => {
    const colorLetter = color[0].toUpperCase();
    const colorPattern = MORSE_PATTERNS[colorLetter];
    if (colorPattern) {
      await transmitMorsePattern(colorPattern);
      await sleep(LETTER_GAP);
    }

    for (const digit of number) {
      if (!loopRef.current && loopActive) break;
      const digitPattern = MORSE_PATTERNS[digit];
      if (digitPattern) {
        await transmitMorsePattern(digitPattern);
        await sleep(LETTER_GAP);
      }
    }

    await flashLight(990);
  };

  return (
    <div className="min-h-screen p-8">
      {/* Add buttons and interface here if needed */}
      <p className="text-white">{statusMessage}</p>
    </div>
  );
};

export default FiberTesterController;
