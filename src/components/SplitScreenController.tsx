import React, { useState } from 'react';
import { Split, Maximize2, Minimize2 } from 'lucide-react';
import FiberTesterController from './FiberTesterController';
import DecoderPanel from './DecoderPanel';
import TimecodeSync from '../utils/timecodeSync';

const SplitScreenController: React.FC = () => {
  const [splitMode, setSplitMode] = useState<'split' | 'transmitter' | 'decoder'>('split');
  const [isTransmitting, setIsTransmitting] = useState<boolean>(false);
  const [timecodeSync] = useState(() => TimecodeSync.getInstance());

  const handleTransmissionStateChange = (transmitting: boolean) => {
    setIsTransmitting(transmitting);
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
              className={`px-4 py-2 rounded-lg transition-all duration-300 font-light tracking-wide ${
                splitMode === 'transmitter'
                  ? 'bg-emerald-600 text-white shadow-emerald-600/25'
                  : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
              }`}
            >
              <Maximize2 className="w-4 h-4 inline mr-2" />
              Transmitter
            </button>
            
            <button
              onClick={() => setSplitMode('split')}
              className={`px-4 py-2 rounded-lg transition-all duration-300 font-light tracking-wide ${
                splitMode === 'split'
                  ? 'bg-blue-600 text-white shadow-blue-600/25'
                  : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
              }`}
            >
              <Split className="w-4 h-4 inline mr-2" />
              Split View
            </button>
            
            <button
              onClick={() => setSplitMode('decoder')}
              className={`px-4 py-2 rounded-lg transition-all duration-300 font-light tracking-wide ${
                splitMode === 'decoder'
                  ? 'bg-purple-600 text-white shadow-purple-600/25'
                  : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
              }`}
            >
              <Minimize2 className="w-4 h-4 inline mr-2" />
              Decoder
            </button>
            
            {/* Jam Sync Button - like professional equipment */}
            <button
              onClick={() => timecodeSync.jamSync()}
              className="px-4 py-2 bg-gradient-to-br from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600
                text-white rounded-lg border-2 border-amber-500 transition-all duration-300 shadow-xl shadow-amber-600/25
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
            <FiberTesterController onTransmissionChange={handleTransmissionStateChange} />
          </div>
        )}
        
        {splitMode === 'decoder' && (
          <div className="h-screen">
            <DecoderPanel isReceiving={isTransmitting} />
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
                <FiberTesterController onTransmissionChange={handleTransmissionStateChange} />
              </div>
            </div>
            
            {/* Decoder Side */}
            <div className="w-1/2">
              <div className="h-full relative">
                <div className="absolute top-4 right-4 z-10">
                  <div className="bg-slate-900/80 backdrop-blur-sm rounded-lg px-3 py-1 border border-slate-600">
                    <span className="text-blue-400 text-sm font-light tracking-wide">DECODER</span>
                  </div>
                </div>
                <DecoderPanel isReceiving={isTransmitting} />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SplitScreenController;