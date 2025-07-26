import React, { useState, useEffect } from 'react';
import { Power, Send, Infinity, Square } from 'lucide-react';
import PythonBridge from '../utils/pythonBridge';
import TimecodeDisplay from './TimecodeDisplay';
import TimecodeSync from '../utils/timecodeSync';

const FiberTesterController: React.FC = () => {
  const [selectedColor, setSelectedColor] = useState<string>('');
  const [isTransmitting, setIsTransmitting] = useState<boolean>(false);
  const [currentNumber, setCurrentNumber] = useState<string>('');
  const [lightActive, setLightActive] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<string>('Select color and number');
  const [sentHistory, setSentHistory] = useState<string[]>([]);
  const [pythonBridge] = useState(() => PythonBridge.getInstance());
  const [loopActive, setLoopActive] = useState<boolean>(false);
  const [loopRef] = useState({ current: false });
  const [transmissionTime, setTransmissionTime] = useState<number>(0);
  const [isTimerRunning, setIsTimerRunning] = useState<boolean>(false);
  const [frameCount, setFrameCount] = useState<number>(0);
  const [timecodeSync] = useState(() => TimecodeSync.getInstance());

  const colors = [
    { name: 'Red', letter: 'R', bgColor: 'bg-gradient-to-br from-red-500 to-red-700', hoverColor: 'hover:from-red-400 hover:to-red-600', textColor: 'text-white' },
    { name: 'Green', letter: 'G', bgColor: 'bg-gradient-to-br from-green-500 to-green-700', hoverColor: 'hover:from-green-400 hover:to-green-600', textColor: 'text-white' },
    { name: 'Blue', letter: 'B', bgColor: 'bg-gradient-to-br from-blue-500 to-blue-700', hoverColor: 'hover:from-blue-400 hover:to-blue-600', textColor: 'text-white' }
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
    // Stop any looping first
    if (loopActive) {
      stopLoopingMorse();
      return;
    }
    
    if (!isTransmitting) {
      setCurrentNumber('');
      setSelectedColor('');
      setStatusMessage('Select color and number');
    }
  };

  const executeMorseTransmission = async (color: string, number: string) => {
    const startTime = Date.now();
    setIsTimerRunning(true);
    setTransmissionTime(0);
    
    // Prepare Morse transmission
    const response = await pythonBridge.prepareTransmission(color, number);
    console.log(`🚀 Morse Transmission: ${color} ${number}`);
    console.log(`📡 Sequence:`, response.sequence);
    
    // Update timer during transmission
    const timerInterval = setInterval(() => {
      setTransmissionTime(Date.now() - startTime);
    }, 1);
    
    // Execute Morse sequence
    if (response.sequence) {
      for (const step of response.sequence) {
        if (step.type === 'dot' || step.type === 'dash') {
          // Light ON for pulse
          setLightActive(true);
          await new Promise(resolve => setTimeout(resolve, step.duration));
          // Light OFF after pulse
          setLightActive(false);
        } else if (step.type === 'gap') {
          // Light OFF during gaps
          setLightActive(false);
          await new Promise(resolve => setTimeout(resolve, step.duration));
        } else if (step.type === 'confirmation') {
          // Light ON for confirmation flash
          setLightActive(true);
          await new Promise(resolve => setTimeout(resolve, step.duration));
          // Light OFF after confirmation
          setLightActive(false);
        }
      }
    }
    
    clearInterval(timerInterval);
    const finalTime = Date.now() - startTime;
    setTransmissionTime(finalTime);
    setIsTimerRunning(false);
    setFrameCount(prev => prev + 1);
  };

  const handleSend = async () => {
    if (!selectedColor || !currentNumber || isTransmitting || loopActive) return;

    // Mark transmission start with EXACT timecode
    const transmissionStart = timecodeSync.markTransmissionStart();

    setIsTransmitting(true);

    try {
      setStatusMessage(`Transmitting ${selectedColor} ${currentNumber} via Morse...`);
      
      // Execute Morse transmission
      await executeMorseTransmission(selectedColor, currentNumber);
      
      // Complete transmission
      const completeResponse = await pythonBridge.completeTransmission(selectedColor, currentNumber);
      setStatusMessage(completeResponse.message);
      
      // Reset after successful transmission
      setTimeout(() => {
        setCurrentNumber('');
        setSelectedColor('');
        setStatusMessage('Select color and number');
        setTransmissionTime(0);
      }, 2000);

    } catch (error) {
      setStatusMessage(`Morse transmission failed: ${error}`);
    } finally {
      setIsTransmitting(false);
      setLightActive(false);
      
      // Mark transmission end with EXACT timecode
      timecodeSync.markTransmissionEnd();
    }
  };

  const handleLoop = async () => {
    if (!selectedColor || !currentNumber || loopActive) return;
    
    setLoopActive(true);
    loopRef.current = true;
    
    // Visual feedback - light on during transmission
    setStatusMessage(`Continuously transmitting ${selectedColor} ${currentNumber} via Morse...`);
    
    while (loopRef.current) {
      // Execute Morse transmission
      await executeMorseTransmission(selectedColor, currentNumber);
      
      setIsTransmitting(false);
      
      // Wait before next transmission
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
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
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-gray-900 to-slate-950 p-8">
      {/* Professional Timecode Display */}
      <TimecodeDisplay label="TX" position="top-left" size="medium" />
      
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-light text-transparent bg-gradient-to-r from-slate-200 via-white to-slate-200 bg-clip-text mb-4 tracking-wide">
            Fiber Optic Controller
          </h1>
          <div className="w-32 h-px bg-gradient-to-r from-transparent via-slate-400 to-transparent mx-auto mb-4"></div>
          <p className="text-slate-400 font-light tracking-wide">Professional Morse Code Over Fiber Optic</p>
          <div className="text-emerald-400 text-sm mt-2 font-light">
            Perfect Timing - Light Flashes Morse Code
          </div>
        </div>

        {/* Status Light */}
        <div className="flex justify-center mb-12">
          <div className="relative">
            {/* Main enclosure */}
            <div className="w-32 h-32 rounded-full border-4 border-slate-600 bg-gradient-to-br from-slate-800 via-slate-900 to-black relative overflow-hidden shadow-2xl">
              {/* Metallic ring */}
              <div className="absolute inset-0 rounded-full border-2 border-slate-500 shadow-inner"></div>
              <div className="absolute inset-1 rounded-full border border-slate-400/30"></div>
              
              {/* Single light */}
              <div className={`absolute inset-2 rounded-full transition-all duration-75 ${
                lightActive ? `${lightColors.on} shadow-2xl shadow-current` : 'bg-gradient-to-br from-slate-800 to-slate-900'
              }`}>
                <div className={`absolute inset-1 rounded-full transition-all duration-75 ${
                  lightActive ? `${lightColors.inner} shadow-inner` : 'bg-gradient-to-br from-slate-700 to-slate-800'
                }`} />
              </div>
              
              {/* Power icon overlay */}
              <div className="absolute inset-0 flex items-center justify-center">
                <Power className={`w-10 h-10 transition-all duration-75 ${
                  lightActive ? lightColors.iconColor : 'text-slate-500'
                }`} />
              </div>
            </div>
            <div className="text-center mt-4 text-sm text-slate-400 font-light tracking-wider">SIGNAL LIGHT</div>
          </div>
        </div>

        {/* Big Timer Display - shown when looping */}
        {loopActive && (
          <div className="text-center mb-12">
            <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-2xl p-8 border border-slate-600 shadow-2xl mb-6">
              <div className="retro-digital-display mb-4" style={{ fontSize: '8rem', lineHeight: '1.2' }}>
                {(transmissionTime / 1000).toFixed(2)}s
              </div>
              <div className="retro-digital-text mb-6">
                Continuously transmitting {selectedColor} {currentNumber} via Morse
              </div>
              
              <div className="text-lg text-emerald-400 mb-6 font-light">
                Transmission #{frameCount} | Fiber Optic
              </div>
            </div>
          </div>
        )}

        {/* Status Display */}
        <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-2xl p-8 border border-slate-600 shadow-2xl mb-8">
          <div className="text-center">
            <div className="retro-digital-display mb-4" style={{ fontSize: '2.5rem', lineHeight: '1.4' }}>
              {statusMessage}
            </div>
            <div className="text-sm text-slate-400 font-light">
              {(transmissionTime / 1000).toFixed(2)}s
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
              {/* Metallic overlay */}
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
              {/* Metallic overlay */}
              <div className="absolute inset-0 bg-gradient-to-br from-white/30 via-transparent to-black/10 rounded-2xl"></div>
              <div className="absolute inset-0 border border-white/40 rounded-2xl"></div>
              
              {/* Retro Digital Display Background */}
              <div className="absolute inset-2 bg-black rounded-xl border border-slate-600"></div>
              
              {/* Digital Number Display */}
              <div className="relative flex items-center justify-center h-full">
                <div className="text-6xl font-mono font-bold text-red-400 tracking-wider digital-glow"
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
        {loopActive && (
          <div className="flex items-center justify-center text-emerald-400 font-light mb-4 tracking-wide">
            <Infinity className="w-5 h-5 mr-2" />
            LOOPING...
          </div>
        )}
        
        <div className={`grid grid-cols-3 gap-6 mb-8 ${loopActive ? 'opacity-50' : ''}`}>
          <button
            onClick={handleClear}
            disabled={false}
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

        {/* Transmission History */}
        {sentHistory.length > 0 && (
          <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-xl p-6 border border-slate-600 shadow-xl">
            <h3 className="text-slate-200 font-light mb-4 tracking-wide text-lg">RECENT TRANSMISSIONS</h3>
            <div className="w-16 h-px bg-gradient-to-r from-slate-600 to-transparent mb-4"></div>
            <div className="space-y-2">
              {sentHistory.map((message, index) => (
                <div key={index} className="text-sm text-slate-400 opacity-80 font-light tracking-wide">
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