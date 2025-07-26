import React, { useState, useEffect } from 'react';
import { Clock, Wifi, WifiOff, AlertTriangle } from 'lucide-react';
import TimecodeSync, { TimecodeState } from '../utils/timecodeSync';

interface TimecodeDisplayProps {
  label: string;
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
  size?: 'small' | 'medium' | 'large';
}

const TimecodeDisplay: React.FC<TimecodeDisplayProps> = ({ 
  label, 
  position = 'top-left',
  size = 'medium'
}) => {
  const [timecode, setTimecode] = useState<TimecodeState>({
    hours: 0,
    minutes: 0,
    seconds: 0,
    frames: 0,
    milliseconds: 0,
    syncStatus: 'SYNCED'
  });

  const [timecodeSync] = useState(() => TimecodeSync.getInstance());

  useEffect(() => {
    const handleTimecodeUpdate = (newTimecode: TimecodeState) => {
      setTimecode(newTimecode);
    };

    timecodeSync.subscribe(handleTimecodeUpdate);

    return () => {
      timecodeSync.unsubscribe(handleTimecodeUpdate);
    };
  }, [timecodeSync]);

  const getSyncStatusIcon = () => {
    switch (timecode.syncStatus) {
      case 'SYNCED':
        return <Wifi className="w-4 h-4 text-emerald-400" />;
      case 'DRIFT':
        return <AlertTriangle className="w-4 h-4 text-yellow-400" />;
      case 'LOST':
        return <WifiOff className="w-4 h-4 text-red-400" />;
    }
  };

  const getSyncStatusColor = () => {
    switch (timecode.syncStatus) {
      case 'SYNCED':
        return 'border-emerald-500/30 bg-emerald-500/10';
      case 'DRIFT':
        return 'border-yellow-500/30 bg-yellow-500/10';
      case 'LOST':
        return 'border-red-500/30 bg-red-500/10';
    }
  };

  const getPositionClasses = () => {
    switch (position) {
      case 'top-left':
        return 'top-4 left-4';
      case 'top-right':
        return 'top-4 right-4';
      case 'bottom-left':
        return 'bottom-4 left-4';
      case 'bottom-right':
        return 'bottom-4 right-4';
    }
  };

  const getSizeClasses = () => {
    switch (size) {
      case 'small':
        return 'text-sm px-3 py-2';
      case 'medium':
        return 'text-base px-4 py-2';
      case 'large':
        return 'text-lg px-5 py-3';
    }
  };

  const formattedTimecode = timecodeSync.formatTimecode(timecode);

  return (
    <div className={`absolute ${getPositionClasses()} z-50`}>
      <div className={`
        ${getSizeClasses()}
        ${getSyncStatusColor()}
        backdrop-blur-sm rounded-lg border font-mono
        flex items-center gap-3 shadow-xl
      `}>
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-slate-400" />
          <span className="text-slate-300 font-light text-xs tracking-wider uppercase">
            {label}
          </span>
        </div>
        
        <div className="flex items-center gap-2">
          <span className="text-white font-medium tracking-wider">
            {formattedTimecode}
          </span>
          {getSyncStatusIcon()}
        </div>
        
        <div className="text-xs text-slate-400">
          {timecode.syncStatus}
        </div>
      </div>
    </div>
  );
};

export default TimecodeDisplay;