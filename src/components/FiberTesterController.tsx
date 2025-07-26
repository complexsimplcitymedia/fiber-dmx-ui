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

  // Single transmission handler
  const handleSingleTransmission = async () => {
    if (!selectedColor || !currentNumber || isTransmitting) return;
    
    setIsTransmitting(true);
    setStatusMessage(`Transmitting ${selectedColor} ${currentNumber}...`);
    
    try {
      await executeTransmission(selectedColor, currentNumber);
      setStatusMessage(`${selectedColor} ${currentNumber} transmitted`);
    } catch (error) {
      setStatusMessage('Transmission error');
    } finally {
      setIsTransmitting(false);
    }
  };

  // Loop transmission handler
  const handleLoopTransmission = async () => {
    if (!selectedColor || !currentNumber || isTransmitting) return;
    
    setLoopActive(true);
    loopRef.current = true;
    setIsTransmitting(true);
    setStatusMessage(`Looping ${selectedColor} ${currentNumber}...`);
    
    try {
      while (loopRef.current) {
        await executeTransmission(selectedColor, currentNumber);
        if (loopRef.current) {
          await sleep(2000); // 2 second pause between loops
        }
      }
    } catch (error) {
      setStatusMessage('Loop transmission error');
    } finally {
      setLoopActive(false);
      setIsTransmitting(false);
      setStatusMessage(`${selectedColor} ${currentNumber} ready`);
    }
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
        <div className="bg-black/50 backdrop-blur-sm rounded-xl p-6 mb-8 border border-gray-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className={`w-16 h-16 rounded-full border-4 border-gray-600 flex items-center justify-center transition-all duration-150 ${
                lightActive 
                  ? `${lightColors.on} shadow-lg shadow-2xl border-transparent` 
                  : 'bg-gray-800'
              }`}>
                <div className={`w-8 h-8 rounded-full transition-all duration-150 ${
                  lightActive ? lightColors.inner : 'bg-gray-700'
                }`}>
                  <Power className={`w-full h-full p-1 transition-colors duration-150 ${
                    lightActive ? lightColors.iconColor : 'text-gray-500'
                  }`} />
                </div>
              </div>
              <div>
                <div className="text-2xl font-mono text-white">
                  {selectedColor && <span className="text-blue-400">{selectedColor}</span>}
                  {selectedColor && currentNumber && <span className="text-gray-400 mx-2">•</span>}
                  {currentNumber && <span className="text-green-400">{currentNumber}</span>}
                  {!selectedColor && !currentNumber && <span className="text-gray-500">-- --</span>}
                </div>
                <div className="text-sm text-gray-400 mt-1">{statusMessage}</div>
              </div>
            </div>
            
            {/* Clear Button */}
            <button
              onClick={handleClear}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors duration-200 flex items-center space-x-2"
            >
              <Square className="w-4 h-4" />
              <span>Clear</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Morse Code Translator */}
          <div className="lg:col-span-2 bg-black/30 backdrop-blur-sm rounded-xl p-6 border border-gray-700 mb-8">
            <h2 className="text-xl font-semibold text-white mb-4">Morse Code Translator</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg text-blue-400 mb-2">What Will Be Transmitted:</h3>
                <div className="bg-black/50 rounded-lg p-4 min-h-[100px]">
                  {selectedColor && currentNumber ? (
                    <div className="space-y-2">
                      <div className="text-green-400 font-mono text-lg">
                        <span className="text-blue-300">Color:</span> {selectedColor[0].toUpperCase()} = {MORSE_PATTERNS[selectedColor[0].toUpperCase()]}
                      </div>
                      <div className="text-green-400 font-mono text-lg">
                        <span className="text-blue-300">Number:</span> {currentNumber.split('').map(digit => `${digit} = ${MORSE_PATTERNS[digit]}`).join(', ')}
                      </div>
                      <div className="text-yellow-400 font-mono text-sm mt-3">
                        <span className="text-blue-300">Full Sequence:</span> {selectedColor[0].toUpperCase()}{currentNumber.split('').join('')} = {MORSE_PATTERNS[selectedColor[0].toUpperCase()]}{currentNumber.split('').map(digit => MORSE_PATTERNS[digit]).join(' ')}
                      </div>
                    </div>
                  ) : (
                    <div className="text-gray-500 italic">Select color and number to see Morse translation</div>
                  )}
                </div>
              </div>
              <div>
                <h3 className="text-lg text-blue-400 mb-2">Morse Code Reference:</h3>
                <div className="bg-black/50 rounded-lg p-4 max-h-[200px] overflow-y-auto">
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="text-red-400">R = ·−·</div>
                    <div className="text-green-400">G = −−·</div>
                    <div className="text-blue-400">B = −···</div>
                    <div className="text-gray-300">0 = −−−−−</div>
                    <div className="text-gray-300">1 = ·−−−−</div>
                    <div className="text-gray-300">2 = ··−−−</div>
                    <div className="text-gray-300">3 = ···−−</div>
                    <div className="text-gray-300">4 = ····−</div>
                    <div className="text-gray-300">5 = ·····</div>
                    <div className="text-gray-300">6 = −····</div>
                    <div className="text-gray-300">7 = −−···</div>
                    <div className="text-gray-300">8 = −−−··</div>
                    <div className="text-gray-300">9 = −−−−·</div>
                  </div>
                  <div className="mt-3 pt-3 border-t border-gray-600 text-xs text-gray-400">
                    <div>· = Dot (120ms)</div>
                    <div>− = Dash (360ms)</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Color Selection */}
          <div className="bg-black/30 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
            <h2 className="text-xl font-semibold text-white mb-4">Select Color</h2>
            <div className="grid grid-cols-1 gap-3">
              {colors.map((color) => (
                <button
                  key={color.name}
                  onClick={() => handleColorSelect(color.name)}
                  disabled={isTransmitting || loopActive}
                  className={`p-4 rounded-lg font-semibold transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 ${
                    color.bgColor
                  } ${color.hoverColor} ${color.textColor} ${
                    selectedColor === color.name ? 'ring-4 ring-white/50 shadow-lg' : ''
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span>{color.name}</span>
                    <span className="font-mono text-sm opacity-75">({color.letter})</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Number Input */}
          <div className="bg-black/30 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
            <h2 className="text-xl font-semibold text-white mb-4">Enter Number</h2>
            <div className="grid grid-cols-3 gap-3">
              {numbers.map((num, index) => (
                <button
                  key={index}
                  onClick={() => num && handleNumberInput(num)}
                  disabled={!num || isTransmitting || loopActive || currentNumber.length >= 3}
                  className={`aspect-square rounded-lg font-bold text-xl transition-all duration-200 transform hover:scale-105 disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:scale-100 ${
                    num 
                      ? 'bg-gradient-to-br from-gray-600 to-gray-700 hover:from-gray-500 hover:to-gray-600 text-white shadow-lg' 
                      : 'invisible'
                  }`}
                >
                  {num}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Transmission Controls */}
        <div className="mt-8 bg-black/30 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
          <h2 className="text-xl font-semibold text-white mb-4">Transmission Controls</h2>
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={handleSingleTransmission}
              disabled={!selectedColor || !currentNumber || isTransmitting}
              className="flex-1 py-4 px-6 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 disabled:from-gray-600 disabled:to-gray-700 text-white font-semibold rounded-lg transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center space-x-2"
            >
              <Send className="w-5 h-5" />
              <span>Send Once</span>
            </button>
            
            <button
              onClick={loopActive ? handleClear : handleLoopTransmission}
              disabled={!selectedColor || !currentNumber || (isTransmitting && !loopActive)}
              className={`flex-1 py-4 px-6 font-semibold rounded-lg transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center space-x-2 ${
                loopActive
                  ? 'bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white'
                  : 'bg-gradient-to-r from-green-600 to-green-700 hover:from-green-500 hover:to-green-600 disabled:from-gray-600 disabled:to-gray-700 text-white'
              }`}
            >
              {loopActive ? (
                <>
                  <Square className="w-5 h-5" />
                  <span>Stop Loop</span>
                </>
              ) : (
                <>
                  <Infinity className="w-5 h-5" />
                  <span>Loop</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FiberTesterController;