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
  }
}