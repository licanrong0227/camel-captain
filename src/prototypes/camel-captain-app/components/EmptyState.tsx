import React from 'react';
import { Inbox } from 'lucide-react';

export function EmptyState({
  title,
  desc,
  action,
  icon,
}: {
  title: string;
  desc?: string;
  action?: { label: string; onClick: () => void };
  icon?: React.ReactNode;
}) {
  return (
    <div className="cc-empty">
      <div className="cc-empty-icon">{icon ?? <Inbox size={26} />}</div>
      <div className="cc-empty-title">{title}</div>
      {desc ? <div className="cc-empty-desc">{desc}</div> : null}
      {action ? (
        <button type="button" className="cc-empty-action" onClick={action.onClick}>
          {action.label}
        </button>
      ) : null}
    </div>
  );
}
