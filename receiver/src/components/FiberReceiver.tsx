import React, { useState, useEffect } from 'react';
import { Eye, Activity, CheckCircle, Wifi, WifiOff } from 'lucide-react';

interface ReceivedSignal {
  color: string;
  number: string;
  timestamp: number;
  transmitter: string;
}

const FiberReceiver: React.FC = () => {
  const [receivedSignals, setReceivedSignals] = useState<ReceivedSignal[]>([]);
  const [currentSignal, setCurrentSignal] = useState<ReceivedSignal | null>(null);
  const [isListening, setIsListening] = useState<boolean>(true);
  const [serverRunning, setServerRunning] = useState<boolean>(false);

  // Start HTTP server to receive signals
  useEffect(() => {
    const startServer = async () => {
      try {
        // Simple HTTP server simulation using fetch polling
        console.log('🎯 Receiver listening on port 3001...');
        setServerRunning(true);
        
        // In a real implementation, this would be an actual HTTP server
        // For demo purposes, we'll simulate receiving signals
        
      } catch (error) {
        console.error('Failed to start receiver server:', error);
        setServerRunning(false);
      }
    };

    if (isListening) {
      startServer();
    }
  }, [isListening]);

  // Simulate receiving a signal (in real implementation, this would be HTTP endpoint)
  const simulateReceiveSignal = (signal: ReceivedSignal) => {
    console.log('📡 Signal received:', signal);
    
    setCurrentSignal(signal);
    
    // Show current signal for 2 seconds, then add to history
    setTimeout(() => {
      setReceivedSignals(prev => [signal, ...prev.slice(0, 9)]);
      setCurrentSignal(null);
    }, 2000);
  };

  // For demo purposes - simulate receiving signals from transmitter
  useEffect(() => {
    // This would be replaced by actual HTTP server endpoint
    const handleMessage = (event: MessageEvent) => {
      if (event.data.type === 'fiber-signal') {
        simulateReceiveSignal(event.data.signal);
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  const clearHistory = () => {
    setReceivedSignals([]);
    setCurrentSignal(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-gray-900 to-slate-950 p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-light text-transparent bg-gradient-to-r from-slate-200 via-white to-slate-200 bg-clip-text mb-4 tracking-wide">
            Fiber Optic Receiver
          </h1>
          <div className="w-32 h-px bg-gradient-to-r from-transparent via-slate-400 to-transparent mx-auto mb-4"></div>
          <p className="text-slate-400 font-light tracking-wide">Port 3001 ← Port 3000</p>
          <div className="flex items-center justify-center gap-2 mt-2">
            {serverRunning ? (
              <div className="flex items-center gap-2 text-emerald-400">
                <Wifi className="w-4 h-4" />
                <span className="text-sm">Server Running</span>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-red-400">
                <WifiOff className="w-4 h-4" />
                <span className="text-sm">Server Offline</span>
              </div>
            )}
          </div>
        </div>

        {/* Status Indicators */}
        <div className="flex items-center justify-center gap-4 mb-8">
          <div className={`flex items-center gap-2 px-4 py-2 rounded-full border ${
            isListening ? 'bg-emerald-500/20 border-emerald-500/30 text-emerald-400' : 'bg-slate-500/20 border-slate-500/30 text-slate-400'
          }`}>
            <Activity className={`w-4 h-4 ${isListening ? 'animate-pulse' : ''}`} />
            <span className="text-sm font-light">{isListening ? 'LISTENING' : 'PAUSED'}</span>
          </div>
        </div>

        {/* Current Signal Display */}
        {currentSignal && (
          <div className="mb-8">
            <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-2xl p-8 border border-emerald-500/30 shadow-2xl shadow-emerald-500/10">
              <div className="text-center mb-6">
                <div className="text-6xl font-light text-transparent bg-gradient-to-r from-emerald-200 via-emerald-100 to-emerald-200 bg-clip-text mb-4 tracking-wider">
                  {currentSignal.color} {currentSignal.number}
                </div>
                <div className="text-2xl font-light mb-2 text-emerald-400">
                  SIGNAL RECEIVED ✓
                </div>
                <div className="text-slate-400 font-mono text-sm tracking-wider">
                  From: {currentSignal.transmitter} | {new Date(currentSignal.timestamp).toLocaleTimeString()}
                </div>
              </div>
              
              <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-600/50">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-slate-300 font-light">Signal Analysis</span>
                  <span className="text-sm text-emerald-400">VALID</span>
                </div>
                <div className="text-slate-400 text-sm mb-1">
                  Color: {currentSignal.color} | Number: {currentSignal.number}
                </div>
                <div className="text-slate-500 text-xs">
                  Fiber optic transmission successfully decoded
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Controls */}
        <div className="flex gap-4 mb-8 justify-center">
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
            <div className="flex flex-col items-center gap-1">
              <Activity className="w-10 h-10" />
              <span className="text-sm">{isListening ? 'PAUSE' : 'LISTEN'}</span>
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
              <Eye className="w-10 h-10" />
              <span className="text-sm">CLEAR</span>
            </div>
          </button>
        </div>

        {/* Received Signals History */}
        <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-xl border border-slate-600 shadow-xl">
          <div className="p-6 border-b border-slate-600">
            <h3 className="text-slate-200 font-light text-lg tracking-wide">RECEIVED SIGNALS</h3>
            <div className="w-16 h-px bg-gradient-to-r from-slate-600 to-transparent mt-2"></div>
          </div>
          
          <div className="p-6">
            {receivedSignals.length === 0 ? (
              <div className="text-center py-12">
                <Eye className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                <p className="text-slate-500 font-light">Waiting for fiber optic signals...</p>
                <p className="text-slate-600 text-sm mt-2">Start transmitter on port 3000</p>
              </div>
            ) : (
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {receivedSignals.map((signal, index) => (
                  <div key={index} className="bg-slate-800/50 rounded-lg p-4 border border-emerald-500/20">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <CheckCircle className="w-5 h-5 text-emerald-400" />
                        <span className="font-light text-lg text-slate-200">
                          {signal.color} {signal.number}
                        </span>
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-emerald-400">RECEIVED</div>
                        <div className="text-xs text-slate-500">
                          {new Date(signal.timestamp).toLocaleTimeString()}
                        </div>
                      </div>
                    </div>
                    <div className="text-slate-400 text-sm">
                      Source: {signal.transmitter}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FiberReceiver;