import React, { useState, useEffect } from 'react';
import { Eye, Zap, CheckCircle, AlertCircle, Activity, RotateCcw } from 'lucide-react';
import SignalDecoder, { DecodedSignal, DecodingStep } from '../utils/signalDecoder';

interface DecoderPanelProps {
  isReceiving: boolean;
  onSimulateReceive?: (color: string, number: string) => void;
}

const DecoderPanel: React.FC<DecoderPanelProps> = ({ isReceiving, onSimulateReceive }) => {
  const [decoder] = useState(() => SignalDecoder.getInstance());
  const [decodedSignals, setDecodedSignals] = useState<DecodedSignal[]>([]);
  const [currentDecoding, setCurrentDecoding] = useState<DecodedSignal | null>(null);
  const [isListening, setIsListening] = useState<boolean>(true);
  const [bufferStatus, setBufferStatus] = useState({ isDecoding: false, bufferSize: 0 });

  // Update buffer status periodically
  useEffect(() => {
    const interval = setInterval(() => {
      setBufferStatus(decoder.getStatus());
      
      // Check for new decoded signals
      const newSignal = decoder.getLatestDecoded();
      if (newSignal) {
        setCurrentDecoding(newSignal);
        
        // Add to history after brief display
        setTimeout(() => {
          setDecodedSignals(prev => [newSignal, ...prev.slice(0, 9)]);
          setCurrentDecoding(null);
        }, 1500); // Reduced from 2000ms
      }
    }, 100);

    return () => clearInterval(interval);
  }, [decoder]);

  // Simulate receiving signals when transmission is active
  useEffect(() => {
    if (isReceiving && isListening) {
      // This would normally be triggered by actual signal detection
      // For demo purposes, we'll simulate random signals
      const simulateRandomSignal = () => {
        const colors = ['Red', 'Green', 'Blue'];
        const color = colors[Math.floor(Math.random() * colors.length)];
        const number = Math.floor(Math.random() * 101).toString();
        
        const decoded = decoder.simulateTransmission(color, number);
        if (decoded) {
          setCurrentDecoding(decoded);
          
          // Add to history after a brief display
          setTimeout(() => {
            setDecodedSignals(prev => [decoded, ...prev.slice(0, 9)]); // Keep last 10
            setCurrentDecoding(null);
          }, 2000);
        }
      };

      const timeout = setTimeout(simulateRandomSignal, 1000);
      return () => clearTimeout(timeout);
    }
  }, [isReceiving, isListening, decoder]);

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.85) return 'text-emerald-400';
    if (confidence >= 0.65) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getConfidenceBackground = (confidence: number) => {
    if (confidence >= 0.85) return 'bg-emerald-500/20 border-emerald-500/30';
    if (confidence >= 0.65) return 'bg-yellow-500/20 border-yellow-500/30';
    return 'bg-red-500/20 border-red-500/30';
  };

  const handleTestDecode = () => {
    const testSignal = decoder.simulateTransmission('Blue', '42');
    if (testSignal) {
      setCurrentDecoding(testSignal);
      setTimeout(() => {
        setDecodedSignals(prev => [testSignal, ...prev.slice(0, 9)]);
        setCurrentDecoding(null);
      }, 3000);
    }
  };

  const clearHistory = () => {
    setDecodedSignals([]);
    setCurrentDecoding(null);
    decoder.clearBuffer();
  };

  return (
    <div className="h-full bg-gradient-to-br from-slate-950 via-gray-900 to-slate-950 p-6">
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
                Confidence: {(currentDecoding.confidence * 100).toFixed(1)}%
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
                      {(step.confidence * 100).toFixed(0)}%
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
          className={`flex items-center gap-2 px-4 py-2 rounded-xl border-2 transition-all duration-300 font-light tracking-wide ${
            isListening 
              ? 'bg-gradient-to-br from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 border-red-500 text-white shadow-red-600/25' 
              : 'bg-gradient-to-br from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 border-emerald-500 text-white shadow-emerald-600/25'
          } shadow-xl hover:scale-105`}
        >
          <Activity className="w-4 h-4" />
          {isListening ? 'PAUSE' : 'LISTEN'}
        </button>
        
        <button
          onClick={handleTestDecode}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-br from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600
            text-white rounded-xl border-2 border-blue-500 transition-all duration-300 shadow-xl shadow-blue-600/25
            hover:scale-105 font-light tracking-wide"
        >
          <Zap className="w-4 h-4" />
          TEST DECODE
        </button>
        
        <button
          onClick={clearHistory}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-br from-slate-600 to-slate-700 hover:from-slate-500 hover:to-slate-600
            text-white rounded-xl border-2 border-slate-500 transition-all duration-300 shadow-xl shadow-slate-600/25
            hover:scale-105 font-light tracking-wide"
        >
          <RotateCcw className="w-4 h-4" />
          CLEAR
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
                      {signal.confidence >= 0.85 ? (
                        <CheckCircle className="w-5 h-5 text-emerald-400" />
                      ) : (
                        <AlertCircle className="w-5 h-5 text-yellow-400" />
                      )}
                      <span className={`font-light text-lg ${
                        signal.color ? 'text-slate-200' : 'text-red-400'
                      }`}>
                        {signal.color} {signal.number}
                      </span>
                      {!signal.color && (
                        <span className="text-red-400 text-sm ml-2">[COLOR DECODE FAILED]</span>
                      )}
                    </div>
                    <div className="text-right">
                      <div className={`text-sm ${getConfidenceColor(signal.confidence)}`}>
                        {(signal.confidence * 100).toFixed(1)}%
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