import React, { useState, useEffect } from 'react';
import { Power, Send, RotateCcw, Infinity, Square } from 'lucide-react';
import PythonBridge, { PythonResponse, TransmissionStep } from '../utils/pythonBridge';
import TimecodeDisplay from './TimecodeDisplay';
import TimecodeSync from '../utils/timecodeSync';

interface FiberTesterControllerProps {
  onTransmissionChange?: (isTransmitting: boolean) => void;
}

const FiberTesterController: React.FC<FiberTesterControllerProps> = ({ onTransmissionChange }) => {
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
  const [timecodeSync] = useState(() => TimecodeSync.getInstance());

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

  // Notify parent component of transmission state changes
  useEffect(() => {
    onTransmissionChange?.(isTransmitting || loopActive);
  }, [isTransmitting, loopActive, onTransmissionChange]);

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

    // Mark transmission start with precise timecode
    const transmissionStart = timecodeSync.markTransmissionStart();
    console.log(`=== TRANSMISSION START ===`);
    console.log(`Timecode: ${timecodeSync.formatTimecode(transmissionStart.timecode)}`);
    console.log(`Timestamp: ${transmissionStart.timestamp}`);
    console.log(`Color: ${selectedColor}, Number: ${currentNumber}`);

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
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-gray-900 to-slate-950 p-8">
      {/* Professional Timecode Display */}
      <TimecodeDisplay label="TX" position="top-left" size="medium" />
      
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-light text-transparent bg-gradient-to-r from-slate-200 via-white to-slate-200 bg-clip-text mb-4 tracking-wide">
            Fiber Tester Controller
          </h1>
          <div className="w-32 h-px bg-gradient-to-r from-transparent via-slate-400 to-transparent mx-auto mb-4"></div>
          <p className="text-slate-400 font-light tracking-wide">Professional Morse Code Transmission System</p>
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
              <div className="text-9xl font-mono font-light text-transparent bg-gradient-to-r from-slate-200 via-white to-slate-200 bg-clip-text mb-4 tracking-wider">
                {(transmissionTime / 1000).toFixed(2)}s
              </div>
              <div className="text-2xl text-slate-300 mb-6 font-light tracking-wide">
                Continuously flashing {selectedColor} {currentNumber}
              </div>
              
              {/* Premium progress bar */}
              <div className="relative w-96 h-3 bg-slate-800 rounded-full mb-4 mx-auto overflow-hidden border border-slate-600">
                <div className="absolute inset-0 bg-gradient-to-r from-slate-700 to-slate-800 rounded-full"></div>
                <div 
                  className={`h-full transition-all duration-100 rounded-full ${
                    lightActive ? `bg-gradient-to-r ${lightColors.on.replace('bg-', 'from-').replace('-400', '-400')} to-white shadow-lg` : 'bg-gradient-to-r from-slate-600 to-slate-500'
                  }`}
                  style={{
                    width: expectedDuration > 0 ? `${Math.min((transmissionTime / expectedDuration) * 100, 100)}%` : '0%'
                  }}
                />
                <div className="absolute inset-0 rounded-full border border-slate-500/50"></div>
              </div>
              
              <div className="text-lg text-slate-400 mb-6 font-light">
                Expected: {(expectedDuration / 1000).toFixed(2)}s | 
                {transmissionTime > expectedDuration ? (
                  <span className="text-amber-400 ml-2 font-medium">Overtime</span>
                ) : (
                  <span className="text-emerald-400 ml-2 font-medium">On Time</span>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Status Display */}
        <div className={`bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-xl p-6 mb-8 border border-slate-600 shadow-xl ${loopActive ? 'opacity-50' : ''}`}>
          <div className="text-center">
            <div className="text-xl font-light text-slate-200 mb-3 tracking-wide">{statusMessage}</div>
            <div className="text-sm text-slate-400 font-light">
              {(transmissionTime / 1000).toFixed(2)}s
            </div>
            <div className="text-sm text-slate-400 font-light">
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
                bg-gradient-to-br overflow-hidden`}
            >
              {/* Metallic overlay */}
              <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-black/20"></div>
              <div className="absolute inset-0 border border-white/20 rounded-2xl"></div>
              
              <div className="relative text-5xl font-light text-white/90 flex items-center justify-center h-full tracking-wider">
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
              
              <div className="relative text-5xl font-light text-slate-800 flex items-center justify-center h-full tracking-wider">
                {num}
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
        
        <div className="flex gap-6 justify-center mb-8">
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
              <RotateCcw className="w-10 h-10" />
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