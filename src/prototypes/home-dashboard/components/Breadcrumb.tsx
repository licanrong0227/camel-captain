import React from 'react';

export function Breadcrumb({ items, onHome }: { items: string[]; onHome: () => void }) {
  return (
    <div className="hd-crumb">
      <span className="hd-crumb-link" onClick={onHome}>首页</span>
      {items.map((item, index) => (
        <React.Fragment key={item}>
          <span className="hd-crumb-sep">/</span>
          <span className={index === items.length - 1 ? 'hd-crumb-current' : 'hd-crumb-text'}>{item}</span>
        </React.Fragment>
      ))}
    </div>
  );
}
