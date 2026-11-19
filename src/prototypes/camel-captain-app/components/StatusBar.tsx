import React from 'react';
import { BatteryFull, Signal, Wifi } from 'lucide-react';

export function StatusBar() {
  return (
    <div className="cc-statusbar">
      <span className="cc-statusbar-time">9:41</span>
      <span className="cc-statusbar-icons">
        <Signal size={14} strokeWidth={2.4} />
        <Wifi size={14} strokeWidth={2.4} />
        <BatteryFull size={17} strokeWidth={2.2} />
      </span>
    </div>
  );
}
