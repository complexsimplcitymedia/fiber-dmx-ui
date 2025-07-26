import React, { useState } from 'react';
import { Split, Maximize2, Minimize2 } from 'lucide-react';
import FiberTesterController from './FiberTesterController';
import DecoderPanel from './DecoderPanel';
import TimecodeSync from '../utils/timecodeSync';
import SignalDecoder from '../utils/signalDecoder';

const SplitScreenController: React.FC = () => {
  const [splitMode, setSplitMode] = useState<'split' | 'transmitter' | 'decoder'>('split');
  const [isTransmitting, setIsTransmitting] = useState<boolean>(false);
  const [currentTransmission, setCurrentTransmission] = useState<{color: string, number: string, timestamp: number} | null>(null);
  const [timecodeSync] = useState(() => TimecodeSync.getInstance());

  const handleTransmissionStateChange = (transmitting: boolean) => {
    setIsTransmitting(transmitting);
  };

  const handleTransmissionData = (color: string, number: string) => {
    // Add timestamp to force decoder to process each transmission
    setCurrentTransmission({ color, number, timestamp: Date.now() });
    console.log(`🚀 SIGNAL COMPLETE: ${color} ${number} at ${Date.now()}`);
  };
  
  const handleTransmissionPulse = (duration: number) => {
    // FEED REAL PULSE DATA TO DECODER
    console.log(`📡 PULSE: ${duration}ms`);
    const decoder = SignalDecoder.getInstance();
    decoder.processPulse(duration);
  };
  
  const handleTransmissionGap = (duration: number) => {
    // FEED REAL GAP DATA TO DECODER  
    console.log(`⏸️ GAP: ${duration}ms`);
    const decoder = SignalDecoder.getInstance();
    decoder.processGap(duration);
  };
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-gray-900 to-slate-950">
      {/* Mode Toggle Header */}
      <div className="bg-slate-900/50 border-b border-slate-700 p-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Split className="w-6 h-6 text-slate-400" />
            <h1 className="text-xl font-light text-slate-200 tracking-wide">
              Fiber Optic Communication System
            </h1>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={() => setSplitMode('transmitter')}
              className={`w-32 h-12 rounded-lg transition-all duration-300 font-light tracking-wide flex items-center justify-center gap-2 ${
                splitMode === 'transmitter'
                  ? 'bg-emerald-600 text-white shadow-emerald-600/25'
                  : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
              }`}
            >
              <Maximize2 className="w-4 h-4" />
              Transmitter
            </button>
            
            <button
              onClick={() => setSplitMode('split')}
              className={`w-32 h-12 rounded-lg transition-all duration-300 font-light tracking-wide flex items-center justify-center gap-2 ${
                splitMode === 'split'
                  ? 'bg-blue-600 text-white shadow-blue-600/25'
                  : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
              }`}
            >
              <Split className="w-4 h-4" />
              Split View
            </button>
            
            <button
              onClick={() => setSplitMode('decoder')}
              className={`w-32 h-12 rounded-lg transition-all duration-300 font-light tracking-wide flex items-center justify-center gap-2 ${
                splitMode === 'decoder'
                  ? 'bg-purple-600 text-white shadow-purple-600/25'
                  : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
              }`}
            >
              <Minimize2 className="w-4 h-4" />
              Decoder
            </button>
            
            {/* Jam Sync Button - like professional equipment */}
            <button
              onClick={() => timecodeSync.jamSync()}
              className="w-32 h-12 bg-gradient-to-br from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600
                text-white rounded-lg border-2 border-amber-500 transition-all duration-300 shadow-xl shadow-amber-600/25 flex items-center justify-center
                hover:scale-105 font-light tracking-wide"
              title="Reset timecode synchronization"
            >
              JAM SYNC
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1">
        {splitMode === 'transmitter' && (
          <div className="h-screen">
            <FiberTesterController 
              onTransmissionChange={handleTransmissionStateChange}
              onTransmissionData={handleTransmissionData}
            />
          </div>
        )}
        
        {splitMode === 'decoder' && (
          <div className="h-screen">
            <DecoderPanel 
              isReceiving={isTransmitting} 
              transmissionData={currentTransmission}
            />
          </div>
        )}
        
        {splitMode === 'split' && (
          <div className="flex h-screen">
            {/* Transmitter Side */}
            <div className="w-1/2 border-r border-slate-700">
              <div className="h-full relative">
                <div className="absolute top-4 left-4 z-10">
                  <div className="bg-slate-900/80 backdrop-blur-sm rounded-lg px-3 py-1 border border-slate-600">
                    <span className="text-emerald-400 text-sm font-light tracking-wide">TRANSMITTER</span>
                  </div>
                </div>
                <FiberTesterController 
                  onTransmissionChange={handleTransmissionStateChange}
                  onTransmissionData={handleTransmissionData}
                  onTransmissionPulse={handleTransmissionPulse}
                  onTransmissionGap={handleTransmissionGap}
                  onTransmissionPulse={handleTransmissionPulse}
                  onTransmissionGap={handleTransmissionGap}
                />
              </div>
            </div>
            
            {/* Decoder Side */}
            <div className="w-1/2">
              <div className="h-full relative">
                <div className="absolute top-4 right-4 z-10">
                  <div className="bg-slate-900/80 backdrop-blur-sm rounded-lg px-3 py-1 border border-slate-600">
                    <span className="text-emerald-400 text-sm font-light tracking-wide">DECODER - READY</span>
                  </div>
                </div>
                <DecoderPanel 
                  isReceiving={isTransmitting} 
                  transmissionData={currentTransmission}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SplitScreenController;