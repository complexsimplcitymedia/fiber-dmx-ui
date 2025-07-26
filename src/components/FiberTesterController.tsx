import React, { useState } from 'react';
import { Power, Send, Infinity, Square } from 'lucide-react';

const FiberTesterController: React.FC = () => {
  const [selectedColor, setSelectedColor] = useState<string>('');
  const [currentNumber, setCurrentNumber] = useState<string>('');
  const [isTransmitting, setIsTransmitting] = useState<boolean>(false);
  const [lightActive, setLightActive] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<string>('Select color and number');
  const [loopActive, setLoopActive] = useState<boolean>(false);
  const [loopRef, setLoopRef] = useState<{
    current: boolean;
  }>({ current: false });

  const DOT_DURATION = 120;
  const DASH_DURATION = 360;
  const SYMBOL_GAP = 120;
  const LETTER_GAP = 840;
  const CONFIRMATION_FLASH = 990;

  const MORSE_PATTERNS: { [key: string]: string } = {
    'R': '·−·',
    'G': '−−·',
    'B': '−···',
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

  const getLightColors = () => {
    switch (selectedColor) {
      case 'Red': return { on: 'bg-red-400 shadow-red-400/50', inner: 'bg-red-300', icon: 'text-red-800' };
      case 'Green': return { on: 'bg-green-400 shadow-green-400/50', inner: 'bg-green-300', icon: 'text-green-800' };
      case 'Blue': return { on: 'bg-blue-400 shadow-blue-400/50', inner: 'bg-blue-300', icon: 'text-blue-800' };
      default: return { on: 'bg-yellow-400 shadow-yellow-400/50', inner: 'bg-yellow-300', icon: 'text-yellow-800' };
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
      if (symbol === '·') await flashLight(DOT_DURATION);
      if (symbol === '−') await flashLight(DASH_DURATION);
      if (i < pattern.length - 1) await sleep(SYMBOL_GAP);
    }
  };

  const executeTransmission = async (color: string, number: string) => {
    const colorPattern = MORSE_PATTERNS[color[0].toUpperCase()];
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
    await flashLight(CONFIRMATION_FLASH);
  };

  const handleSend = async () => {
    if (!selectedColor || !currentNumber || isTransmitting || loopActive) return;

    setIsTransmitting(true);
    setStatusMessage(`Transmitting ${selectedColor} ${currentNumber}...`);

    await executeTransmission(selectedColor, currentNumber);
    
    setIsTransmitting(false);
    setStatusMessage(`${selectedColor} ${currentNumber} sent`);
    
    setTimeout(() => {
      setCurrentNumber('');
      setSelectedColor('');
      setStatusMessage('Select color and number');
    }, 2000);
  };

  const handleLoop = async () => {
    if (!selectedColor || !currentNumber || loopActive) return;
    
    setLoopActive(true);
    loopRef.current = true;
    setStatusMessage(`Looping ${selectedColor} ${currentNumber}...`);
    
    while (loopRef.current) {
      setIsTransmitting(true);
      await executeTransmission(selectedColor, currentNumber);
      setIsTransmitting(false);
      await sleep(100);
    }
    
    setLoopActive(false);
    setStatusMessage('Select color and number');
    setCurrentNumber('');
    setSelectedColor('');
  };

  const handleClear = () => {
    loopRef.current = false;
    setLoopActive(false);
    setIsTransmitting(false);
    setLightActive(false);
    setCurrentNumber('');
    setSelectedColor('');
    setStatusMessage('Select color and number');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-gray-900 to-slate-950 p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-light text-transparent bg-gradient-to-r from-slate-200 via-white to-slate-200 bg-clip-text mb-4 tracking-wide">
            Fiber Optic Transmitter
          </h1>
          <div className="w-32 h-px bg-gradient-to-r from-transparent via-slate-400 to-transparent mx-auto mb-4"></div>
          <p className="text-slate-400 font-light tracking-wide">Perfect Morse Code Timing</p>
        </div>

        {/* Signal Light */}
        <div className="flex justify-center mb-12">
          <div className="relative">
            <div className="w-32 h-32 rounded-full border-4 border-slate-600 bg-gradient-to-br from-slate-800 via-slate-900 to-black relative overflow-hidden shadow-2xl">
              <div className="absolute inset-0 rounded-full border-2 border-slate-500 shadow-inner"></div>
              <div className="absolute inset-1 rounded-full border border-slate-400/30"></div>
              
              <div className={`absolute inset-2 rounded-full transition-all duration-75 ${
                lightActive ? `${lightColors.on} shadow-2xl shadow-current` : 'bg-gradient-to-br from-slate-800 to-slate-900'
              }`}>
                <div className={`absolute inset-1 rounded-full transition-all duration-75 ${
                  lightActive ? `${lightColors.inner} shadow-inner` : 'bg-gradient-to-br from-slate-700 to-slate-800'
                }`} />
              </div>
              
              <div className="absolute inset-0 flex items-center justify-center">
                <Power className={`w-10 h-10 transition-all duration-75 ${
                  lightActive ? lightColors.icon : 'text-slate-500'
                }`} />
              </div>
            </div>
            <div className="text-center mt-4 text-sm text-slate-400 font-light tracking-wider">SIGNAL LIGHT</div>
          </div>
        </div>

        {/* Status Display */}
        <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-2xl p-8 border border-slate-600 shadow-2xl mb-8">
          <div className="text-center">
            <div className="retro-digital-display mb-4" style={{ fontSize: '2.5rem', lineHeight: '1.4' }}>
              {statusMessage}
            </div>
            <div className="retro-digital-text text-lg text-slate-400 font-light">
              {selectedColor && `Color: ${selectedColor}`}
              {selectedColor && currentNumber && ' | '}
              {currentNumber && `Number: ${currentNumber}`}
            </div>
          </div>
        </div>

        {/* Color Buttons */}
        <div className={`grid grid-cols-3 gap-6 mb-8 ${loopActive ? 'opacity-50' : ''}`}>
          {colors.map((color) => (
            <button
              key={color.name}
              onClick={() => handleColorSelect(color.name)}
              disabled={isTransmitting || loopActive}
              className={`relative h-28 rounded-2xl ${color.bgColor} ${color.hoverColor} 
                border-2 border-slate-600 shadow-2xl transform transition-all duration-300
                hover:scale-105 hover:shadow-3xl active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed
                ${selectedColor === color.name ? 'ring-2 ring-amber-400 shadow-amber-400/25' : ''}
                overflow-hidden`}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-black/20"></div>
              <div className="absolute inset-0 border border-white/20 rounded-2xl"></div>
              
              <div className={`relative text-5xl font-light ${color.textColor} flex items-center justify-center h-full tracking-wider`}>
                {color.letter}
              </div>
            </button>
          ))}
        </div>

        {/* Number Pad */}
        <div className={`grid grid-cols-3 gap-6 mb-8 ${loopActive ? 'opacity-50' : ''}`}>
          {numbers.map((num, index) => (
            <button
              key={index}
              onClick={() => handleNumberInput(num)}
              disabled={isTransmitting || loopActive || !num}
              className={`relative h-28 rounded-2xl bg-gradient-to-br from-slate-200 via-slate-100 to-slate-300 hover:from-slate-100 hover:to-slate-200
                border-2 border-slate-400 shadow-2xl transform transition-all duration-300
                hover:scale-105 hover:shadow-2xl active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed
                ${!num ? 'invisible' : ''}`}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-white/30 via-transparent to-black/10 rounded-2xl"></div>
              <div className="absolute inset-0 border border-white/40 rounded-2xl"></div>
              
              <div className="absolute inset-2 bg-black rounded-xl border border-slate-600"></div>
              
              <div className="relative flex items-center justify-center h-full">
                <div className="text-6xl font-mono font-bold text-red-400 tracking-wider"
                     style={{
                       fontFamily: 'monospace',
                       textShadow: '0 0 10px #ef4444, 0 0 20px #ef4444, 0 0 30px #ef4444',
                       filter: 'brightness(1.2)'
                     }}>
                  {num}
                </div>
              </div>
            </button>
          ))}
        </div>

        {/* Control Buttons */}
        <div className={`grid grid-cols-3 gap-6 mb-8 ${loopActive ? 'opacity-50' : ''}`}>
          <button
            onClick={handleClear}
            className={`relative h-28 rounded-2xl flex items-center justify-center gap-3 overflow-hidden
              ${loopActive ? 'bg-gradient-to-br from-red-700 to-red-800 border-red-400 animate-pulse shadow-red-500/25' : 'bg-gradient-to-br from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 shadow-red-600/25'}
              text-white border-2 border-red-500 transition-all duration-300 shadow-2xl
              hover:scale-105 hover:shadow-2xl active:scale-95 font-light tracking-wide`}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-black/20 rounded-2xl"></div>
            <div className="absolute inset-0 border border-white/20 rounded-2xl"></div>
            <div className="flex flex-col items-center gap-1">
              <Square className="w-10 h-10" />
              <span className="text-sm">STOP</span>
            </div>
          </button>
          
          <button
            onClick={handleSend}
            disabled={!selectedColor || !currentNumber || loopActive}
            className="relative h-28 rounded-2xl flex items-center justify-center gap-3 bg-gradient-to-br from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600
              text-white border-2 border-emerald-500 transition-all duration-300 shadow-2xl shadow-emerald-600/25
              hover:scale-105 hover:shadow-2xl active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed font-light tracking-wide overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-black/20 rounded-2xl"></div>
            <div className="absolute inset-0 border border-white/20 rounded-2xl"></div>
            <div className="flex flex-col items-center gap-1">
              <Send className="w-10 h-10" />
              <span className="text-sm">{isTransmitting && !loopActive ? 'SENDING' : 'SEND'}</span>
            </div>
          </button>

          <button
            onClick={handleLoop}
            disabled={!selectedColor || !currentNumber || loopActive}
            className={`relative h-28 rounded-2xl flex items-center justify-center gap-3 text-white border-2 transition-all duration-300 shadow-2xl
              hover:scale-105 hover:shadow-2xl active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed font-light tracking-wide overflow-hidden
              bg-gradient-to-br from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 border-blue-500 shadow-blue-600/25`}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-black/20 rounded-2xl"></div>
            <div className="absolute inset-0 border border-white/20 rounded-2xl"></div>
            <div className="flex flex-col items-center gap-1">
              <Infinity className="w-10 h-10" />
              <span className="text-sm">LOOP</span>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};

export default FiberTesterController;