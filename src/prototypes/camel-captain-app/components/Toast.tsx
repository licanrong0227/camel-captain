import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

export function Toast({ message }: { message: string }) {
  const [target, setTarget] = useState<HTMLElement | null>(null);

  useEffect(() => {
    setTarget(document.getElementById('cc-toast-layer'));
  }, []);

  if (!message) return null;
  const node = target ?? document.body;
  return createPortal(
    <div className="cc-toast" role="status">{message}</div>,
    node,
  );
}
