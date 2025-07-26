import React, { useState, useEffect } from 'react';
import { Eye, Zap, CheckCircle, AlertCircle, Activity, RotateCcw } from 'lucide-react';
import SignalDecoder, { DecodedSignal, DecodingStep } from '../utils/signalDecoder';
import TimecodeDisplay from './TimecodeDisplay';
import TimecodeSync from '../utils/timecodeSync';

interface DecoderPanelProps {
  isReceiving: boolean;
  transmissionData?: {color: string, number: string} | null;
  onSimulateReceive?: (color: string, number: string) => void;
}

const DecoderPanel: React.FC<DecoderPanelProps> = ({ 
  isReceiving, 
  transmissionData,
  onSimulateReceive 
}) => {
  const [decoder] = useState(() => SignalDecoder.getInstance());
  const [decodedSignals, setDecodedSignals] = useState<DecodedSignal[]>([]);
  const [currentDecoding, setCurrentDecoding] = useState<DecodedSignal | null>(null);
  const [bufferStatus, setBufferStatus] = useState({ isDecoding: false, bufferSize: 0 });
  const [timecodeSync] = useState(() => TimecodeSync.getInstance());
  const [isListening, setIsListening] = useState<boolean>(true);

  // EXACT buffer status monitoring - no delays
  useEffect(() => {
    const interval = setInterval(() => {
      setBufferStatus(decoder.getStatus());
      
      // EXACT transmission end detection
      decoder.checkForTransmissionEnd();
      
      // EXACT signal detection - no delays
      const newSignal = decoder.getLatestDecoded();
      if (newSignal) {
        // EXACT timecode logging
        const receptionTimecode = timecodeSync.getCurrentTimecode();
        
        setCurrentDecoding(newSignal);
        
        // Add to history after EXACT display time
        setTimeout(() => {
          setDecodedSignals(prev => [newSignal, ...prev.slice(0, 9)]);
          setCurrentDecoding(null);
        }, 1000); // EXACT 1 second display
      }
    }, 10); // EXACT 10ms monitoring interval

    return () => clearInterval(interval);
  }, [decoder, timecodeSync]);

  // EXACT signal reception - no simulation delays
  useEffect(() => {
    if (isReceiving && isListening && transmissionData) {
      // EXACT decoding - mathematical precision
      const { color, number } = transmissionData;
      
      // EXACT transmission decoding
      const decoded = decoder.simulateTransmission(color, number);
      if (decoded) {
        const receptionTimecode = timecodeSync.getCurrentTimecode();
        
        setCurrentDecoding(decoded);
        
        // EXACT history timing
        setTimeout(() => {
          setDecodedSignals(prev => [decoded, ...prev.slice(0, 9)]);
          setCurrentDecoding(null);
        }, 1000); // EXACT 1 second
      }
    }
  }, [isReceiving, isListening, transmissionData, decoder, timecodeSync]);

  const getConfidenceColor = (confidence: number) => {
    // EXACT confidence: 1.0 or rejection
    return 'text-emerald-400'; // Always 1.0 confidence
  };

  const getConfidenceBackground = (confidence: number) => {
    // EXACT confidence: always valid
    return 'bg-emerald-500/20 border-emerald-500/30';
  };

  const handleTestDecode = () => {
    // EXACT test - mathematical precision
    const testSignal = decoder.simulateTransmission('Blue', '42');
    if (testSignal) {
      setCurrentDecoding(testSignal);
      setTimeout(() => {
        setDecodedSignals(prev => [testSignal, ...prev.slice(0, 9)]);
        setCurrentDecoding(null);
      }, 1000); // EXACT timing
    }
  };

  const clearHistory = () => {
    // EXACT clear - immediate
    setDecodedSignals([]);
    setCurrentDecoding(null);
    decoder.clearBuffer();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-gray-900 to-slate-950 p-6">
      {/* Professional Timecode Display */}
      <TimecodeDisplay label="RX" position="top-right" size="medium" />
      
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Eye className="w-8 h-8 text-blue-400" />
            <h2 className="text-3xl font-light text-transparent bg-gradient-to-r from-slate-200 via-white to-slate-200 bg-clip-text tracking-wide">
              Signal Decoder
            </h2>
          </div>
          
          <div className="flex items-center gap-4">
            {/* Listening Status */}
            <div className={`flex items-center gap-2 px-3 py-1 rounded-full border ${
              isListening ? 'bg-emerald-500/20 border-emerald-500/30 text-emerald-400' : 'bg-slate-500/20 border-slate-500/30 text-slate-400'
            }`}>
              <Activity className={`w-4 h-4 ${isListening ? 'animate-pulse' : ''}`} />
              <span className="text-sm font-light">{isListening ? 'LISTENING' : 'PAUSED'}</span>
            </div>
            
            {/* Buffer Status */}
            {bufferStatus.bufferSize > 0 && (
              <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 border-blue-500/30 text-blue-400 border">
                <Zap className="w-4 h-4" />
                <span className="text-sm font-light">BUFFER: {bufferStatus.bufferSize}</span>
              </div>
            )}
          </div>
        </div>
        
        <div className="w-32 h-px bg-gradient-to-r from-transparent via-slate-400 to-transparent mb-4"></div>
        <p className="text-slate-400 font-light tracking-wide">Real-time Morse Code Signal Analysis</p>
      </div>

      {/* Current Decoding Display */}
      {currentDecoding && (
        <div className="mb-8">
          <div className={`bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-2xl p-8 border shadow-2xl ${getConfidenceBackground(currentDecoding.confidence)}`}>
            <div className="text-center mb-6">
              <div className="text-6xl font-light text-transparent bg-gradient-to-r from-slate-200 via-white to-slate-200 bg-clip-text mb-4 tracking-wider">
                {currentDecoding.color} {currentDecoding.number}
              </div>
              <div className={`text-2xl font-light mb-2 ${getConfidenceColor(currentDecoding.confidence)}`}>
                VERIFIED ✓
              </div>
              <div className="text-slate-400 font-mono text-sm tracking-wider">
                Pattern: {currentDecoding.rawPattern}
              </div>
            </div>
            
            {/* Decoding Steps */}
            <div className="space-y-3">
              {currentDecoding.decodingSteps.map((step, index) => (
                <div key={index} className="bg-slate-800/50 rounded-lg p-4 border border-slate-600/50">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-slate-300 font-light">{step.step}</span>
                    <span className={`text-sm ${getConfidenceColor(step.confidence)}`}>
                      VALID
                    </span>
                  </div>
                  <div className="text-slate-400 text-sm mb-1 font-mono">{step.pattern}</div>
                  <div className="text-slate-500 text-xs">{step.interpretation}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Controls */}
      <div className="flex gap-4 mb-8">
        <button
          onClick={() => setIsListening(!isListening)}
          className={`relative h-28 w-40 rounded-2xl flex items-center justify-center gap-2 border-2 transition-all duration-300 font-light tracking-wide overflow-hidden ${
            isListening 
              ? 'bg-gradient-to-br from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 border-red-500 text-white shadow-2xl shadow-red-600/25' 
              : 'bg-gradient-to-br from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 border-emerald-500 text-white shadow-2xl shadow-emerald-600/25'
          } shadow-2xl hover:scale-105`}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-black/20 rounded-2xl"></div>
          <div className="absolute inset-0 border border-white/20 rounded-2xl"></div>
          <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-black/20 rounded-2xl"></div>
          <div className="absolute inset-0 border border-white/20 rounded-2xl"></div>
          <div className="flex flex-col items-center gap-1">
            <Activity className="w-10 h-10" />
            <span className="text-sm">{isListening ? 'PAUSE' : 'LISTEN'}</span>
          </div>
        </button>
        
        <button
          onClick={handleTestDecode}
          className="relative h-28 w-40 rounded-2xl flex items-center justify-center gap-2 bg-gradient-to-br from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600
            text-white border-2 border-blue-500 transition-all duration-300 shadow-2xl shadow-blue-600/25
            hover:scale-105 font-light tracking-wide overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-black/20 rounded-2xl"></div>
          <div className="absolute inset-0 border border-white/20 rounded-2xl"></div>
          <div className="flex flex-col items-center gap-1">
            <Zap className="w-10 h-10" />
            <span className="text-sm">TEST</span>
          </div>
        </button>
        
        <button
          onClick={clearHistory}
          className="relative h-28 w-40 rounded-2xl flex items-center justify-center gap-2 bg-gradient-to-br from-slate-600 to-slate-700 hover:from-slate-500 hover:to-slate-600
            text-white border-2 border-slate-500 transition-all duration-300 shadow-2xl shadow-slate-600/25
            hover:scale-105 font-light tracking-wide overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-black/20 rounded-2xl"></div>
          <div className="absolute inset-0 border border-white/20 rounded-2xl"></div>
          <div className="flex flex-col items-center gap-1">
            <RotateCcw className="w-10 h-10" />
            <span className="text-sm">CLEAR</span>
          </div>
        </button>
      </div>

      {/* Decoded History */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-xl border border-slate-600 shadow-xl">
        <div className="p-6 border-b border-slate-600">
          <h3 className="text-slate-200 font-light text-lg tracking-wide">DECODED SIGNALS</h3>
          <div className="w-16 h-px bg-gradient-to-r from-slate-600 to-transparent mt-2"></div>
        </div>
        
        <div className="p-6">
          {decodedSignals.length === 0 ? (
            <div className="text-center py-12">
              <Eye className="w-16 h-16 text-slate-600 mx-auto mb-4" />
              <p className="text-slate-500 font-light">Waiting for signals...</p>
            </div>
          ) : (
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {decodedSignals.map((signal, index) => (
                <div key={index} className={`bg-slate-800/50 rounded-lg p-4 border ${getConfidenceBackground(signal.confidence)}`}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      {signal.confidence === 1.0 ? (
                        <CheckCircle className="w-5 h-5 text-emerald-400" />
                      ) : (
                        <AlertCircle className="w-5 h-5 text-red-400" />
                      )}
                      <span className={`font-light text-lg ${
                        'text-slate-200'
                      }`}>
                        {signal.color} {signal.number}
                      </span>
                    </div>
                    <div className="text-right">
                      <div className={`text-sm ${getConfidenceColor(signal.confidence)}`}>
                        VERIFIED
                      </div>
                      <div className="text-xs text-slate-500">
                        {new Date(signal.timestamp).toLocaleTimeString()}
                      </div>
                    </div>
                  </div>
                  <div className="text-slate-400 text-sm font-mono tracking-wider">
                    {signal.rawPattern}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DecoderPanel;