import React, { useEffect, useState } from 'react';
import { ArrowUp } from 'lucide-react';

export function BackToTop({
  scrollRef,
  bottom = 14,
  threshold = 240,
}: {
  scrollRef: React.RefObject<HTMLElement | null>;
  bottom?: number;
  threshold?: number;
}) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const node = scrollRef.current;
    if (!node) return undefined;
    const onScroll = () => setVisible(node.scrollTop > threshold);
    onScroll();
    node.addEventListener('scroll', onScroll, { passive: true });
    return () => node.removeEventListener('scroll', onScroll);
  }, [scrollRef, threshold]);

  const toTop = () => {
    const node = scrollRef.current;
    if (!node) return;
    node.scrollTo({ top: 0, behavior: 'smooth' });
    window.setTimeout(() => {
      const target = scrollRef.current;
      if (!target) return;
      if (target.scrollTop > 4) target.scrollTop = 0;
      setVisible(target.scrollTop > threshold);
    }, 700);
  };

  return (
    <button
      type="button"
      className={`cc-back-top${visible ? ' is-visible' : ''}`}
      style={{ bottom }}
      aria-label="返回顶部"
      aria-hidden={!visible}
      tabIndex={visible ? 0 : -1}
      onClick={toTop}
    >
      <ArrowUp size={17} />
    </button>
  );
}
