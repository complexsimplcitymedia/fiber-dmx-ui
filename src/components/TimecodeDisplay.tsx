import React, { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';
import TimecodeSync, { TimecodeData } from '../utils/timecodeSync';

interface TimecodeDisplayProps {
  label: string;
  position: 'top-left' | 'top-right';
  size: 'small' | 'medium' | 'large';
}

const TimecodeDisplay: React.FC<TimecodeDisplayProps> = ({ label, position, size }) => {
  const [timecodeSync] = useState(() => TimecodeSync.getInstance());
  const [currentTimecode, setCurrentTimecode] = useState<TimecodeData | null>(null);

  useEffect(() => {
    const updateTimecode = () => {
      setCurrentTimecode(timecodeSync.getCurrentTimecode());
    };

    // Update every 33ms for 30fps precision
    const interval = setInterval(updateTimecode, 33);
    updateTimecode(); // Initial update

    return () => clearInterval(interval);
  }, [timecodeSync]);

  const getSizeClasses = () => {
    switch (size) {
      case 'small':
        return 'text-sm px-3 py-1';
      case 'medium':
        return 'text-base px-4 py-2';
      case 'large':
        return 'text-lg px-6 py-3';
      default:
        return 'text-base px-4 py-2';
    }
  };

  const getPositionClasses = () => {
    switch (position) {
      case 'top-left':
        return 'top-4 left-4';
      case 'top-right':
        return 'top-4 right-4';
      default:
        return 'top-4 left-4';
    }
  };

  if (!currentTimecode) return null;

  const formattedTime = timecodeSync.formatTimecode(currentTimecode);

  return (
    <div className={`fixed ${getPositionClasses()} z-50`}>
      <div className={`bg-black/90 border border-slate-600 rounded-lg ${getSizeClasses()} font-mono`}>
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-emerald-400" />
          <span className="text-slate-300 font-light">{label}:</span>
          <span className="text-emerald-400 font-bold tracking-wider">{formattedTime}</span>
        </div>
      </div>
    </div>
  );
};

export default TimecodeDisplay;