import React from 'react';
import { useHifz } from '../context/HifzContext';
import { Smartphone, Monitor, Wifi, Battery, Signal } from 'lucide-react';

interface MobileDeviceFrameProps {
  children: React.ReactNode;
}

export const MobileDeviceFrame: React.FC<MobileDeviceFrameProps> = ({ children }) => {
  const { devicePreview, setDevicePreview } = useHifz();

  if (devicePreview === 'responsive') {
    return <>{children}</>;
  }

  const isIPhone = devicePreview === 'iphone';

  return (
    <div className="py-6 px-2 flex flex-col items-center justify-center min-h-[calc(100vh-140px)] bg-slate-200/80">
      
      {/* Device Toggle Pill */}
      <div className="mb-4 bg-white px-3 py-1.5 rounded-full border border-slate-300 shadow-xs flex items-center gap-2 text-xs">
        <span className="font-semibold text-slate-700">Previewing:</span>
        <button
          type="button"
          onClick={() => setDevicePreview('iphone')}
          className={`px-2.5 py-1 rounded-full font-bold transition-colors ${
            isIPhone ? 'bg-slate-900 text-white' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Apple iPhone 16 Pro
        </button>
        <button
          type="button"
          onClick={() => setDevicePreview('android')}
          className={`px-2.5 py-1 rounded-full font-bold transition-colors ${
            !isIPhone ? 'bg-emerald-700 text-white' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Android Google Pixel 9
        </button>
        <button
          type="button"
          onClick={() => setDevicePreview('responsive')}
          className="text-slate-400 hover:text-slate-700 ml-2 font-medium"
        >
          Exit Simulator ✕
        </button>
      </div>

      {/* Phone Hardware Shell */}
      <div
        className={`w-full max-w-[412px] bg-white rounded-[44px] shadow-2xl border-[10px] ${
          isIPhone ? 'border-slate-800' : 'border-slate-700'
        } overflow-hidden relative transition-all`}
        style={{ height: '844px', maxHeight: '88vh' }}
      >
        {/* Hardware Notch / Island */}
        <div className="bg-white sticky top-0 z-50 pt-2 px-6 flex items-center justify-between text-xs text-slate-800 select-none border-b border-slate-100">
          <span className="font-bold text-[11px]">9:41</span>

          {/* Dynamic Island or Camera Hole */}
          {isIPhone ? (
            <div className="w-24 h-5 bg-black rounded-full mx-auto" />
          ) : (
            <div className="w-3.5 h-3.5 bg-black rounded-full mx-auto" />
          )}

          <div className="flex items-center gap-1.5 text-slate-700">
            <Signal className="w-3 h-3" />
            <Wifi className="w-3 h-3" />
            <Battery className="w-4 h-4" />
          </div>
        </div>

        {/* Phone Screen Content (Scrollable) */}
        <div className="h-[calc(100%-36px)] overflow-y-auto scrollbar-thin p-3 pb-24">
          {children}
        </div>

        {/* Home Indicator Bar (iOS / Android) */}
        <div className="absolute bottom-1 left-1/2 -translate-x-1/2 w-32 h-1 bg-slate-900/40 rounded-full pointer-events-none" />
      </div>

    </div>
  );
};
