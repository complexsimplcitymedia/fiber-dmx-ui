import React, { useState, useEffect } from 'react';
import FiberTesterController from './FiberTesterController';
import DecoderPanel from './DecoderPanel';
import { DMXFrame } from '../utils/dmxProtocol';
import DMXDecoder, { DecodedDMXSignal } from '../utils/dmxDecoder';

const SplitScreenController: React.FC = () => {
  const [isTransmitting, setIsTransmitting] = useState<boolean>(false);
  const [dmxDecoder] = useState(() => DMXDecoder.getInstance());
  const [transmissionData, setTransmissionData] = useState<{color: string, number: string, timestamp: number} | null>(null);
  const [currentPulse, setCurrentPulse] = useState<{duration: number, timestamp: number} | null>(null);
  const [currentGap, setCurrentGap] = useState<{duration: number, timestamp: number} | null>(null);

  // LIGHT BEAM PHYSICS - Direct transmission from left to right
  const handleDMXTransmission = (frame: DMXFrame) => {
    console.log('🚀 LIGHT BEAM TRANSMITTED:', frame);
    
    // Light beam hits the decoder - instant at light speed
    const decodedSignal = dmxDecoder.receiveFrame(frame);
    
    if (decodedSignal) {
      console.log('📡 LIGHT BEAM RECEIVED:', decodedSignal);
      
      // Update transmission data for decoder panel
      setTransmissionData({
        color: decodedSignal.color,
        number: decodedSignal.number,
        timestamp: decodedSignal.timestamp
      });
    }
  };

  // Real pulse/gap data from actual transmission
  const handleTransmissionPulse = (duration: number) => {
    const timestamp = Date.now();
    console.log(`💡 PULSE: ${duration}ms at ${timestamp}`);
    setCurrentPulse({ duration, timestamp });
  };

  const handleTransmissionGap = (duration: number) => {
    const timestamp = Date.now();
    console.log(`⚫ GAP: ${duration}ms at ${timestamp}`);
    setCurrentGap({ duration, timestamp });
  };

  return (
    <div className="flex h-screen">
      {/* Left Side - Transmitter */}
      <div className="w-1/2 border-r border-slate-600">
        <FiberTesterController
          onTransmissionChange={setIsTransmitting}
          onDMXTransmission={handleDMXTransmission}
          onTransmissionPulse={handleTransmissionPulse}
          onTransmissionGap={handleTransmissionGap}
        />
      </div>
      
      {/* Right Side - Decoder */}
      <div className="w-1/2">
        <DecoderPanel
          isReceiving={isTransmitting}
          transmissionData={transmissionData}
          onPulseReceived={handleTransmissionPulse}
          onGapReceived={handleTransmissionGap}
        />
      </div>
    </div>
  );
};

export default SplitScreenController;