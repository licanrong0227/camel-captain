import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { StatusBar } from './StatusBar';
import { TabBar, type TabKey } from './TabBar';

export function PhoneFrame({
  children,
  showTab = false,
  activeTab,
  onTab,
}: {
  children: React.ReactNode;
  showTab?: boolean;
  activeTab?: TabKey;
  onTab?: (next: TabKey) => void;
}) {
  const [portalHost, setPortalHost] = useState<HTMLElement | null>(null);

  useEffect(() => {
    let host = document.getElementById('cc-phone-portal');
    if (!host) {
      host = document.createElement('div');
      host.id = 'cc-phone-portal';
      document.documentElement.appendChild(host);
    }
    setPortalHost(host);
  }, []);

  if (!portalHost) return null;

  return createPortal(
    <div className="cc-stage">
      <div className="cc-device">
        <div className="cc-phone">
          <div className="cc-screen">
            <StatusBar />
            <div className="cc-screen-body">{children}</div>
            {showTab && activeTab && onTab ? <TabBar active={activeTab} onChange={onTab} /> : null}
            <div className="cc-home-indicator"><span /></div>
            <div className="cc-sheet-layer" id="cc-sheet-layer" />
            <div className="cc-toast-layer" id="cc-toast-layer" />
          </div>
        </div>
        <div className="cc-stage-caption">骆驼队长 App · 375 × 812</div>
      </div>
    </div>,
    portalHost,
  );
}
