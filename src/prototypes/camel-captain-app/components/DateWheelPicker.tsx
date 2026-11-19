import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Sheet } from './Sheet';

const ITEM_HEIGHT = 36;

function pad(value: number) {
  return String(value).padStart(2, '0');
}

function range(from: number, to: number) {
  const list: number[] = [];
  for (let value = from; value <= to; value += 1) list.push(value);
  return list;
}

function parse(value: string) {
  const [year, month, day] = value.split('-').map(Number);
  return { year, month, day };
}

function WheelColumn({
  items,
  value,
  format,
  onChange,
}: {
  items: number[];
  value: number;
  format?: (item: number) => string;
  onChange: (next: number) => void;
}) {
  const nodeRef = useRef<HTMLDivElement>(null);
  const settling = useRef(false);
  const index = Math.max(0, items.indexOf(value));

  useEffect(() => {
    const node = nodeRef.current;
    if (!node) return;
    const target = index * ITEM_HEIGHT;
    if (Math.abs(node.scrollTop - target) > ITEM_HEIGHT / 2) {
      settling.current = true;
      node.scrollTop = target;
      window.setTimeout(() => {
        settling.current = false;
      }, 80);
    }
  }, [index, items.length]);

  const handleScroll = () => {
    const node = nodeRef.current;
    if (!node || settling.current) return;
    const next = Math.max(0, Math.min(items.length - 1, Math.round(node.scrollTop / ITEM_HEIGHT)));
    if (next !== index) onChange(items[next]);
  };

  return (
    <div className="cc-wheel-col" ref={nodeRef} onScroll={handleScroll}>
      <div className="cc-wheel-pad" />
      {items.map((item, itemIndex) => (
        <div key={item} className={`cc-wheel-item${itemIndex === index ? ' is-active' : ''}`}>
          {format ? format(item) : item}
        </div>
      ))}
      <div className="cc-wheel-pad" />
    </div>
  );
}

export function DateWheelPicker({
  open,
  title,
  value,
  min,
  max,
  onCancel,
  onConfirm,
}: {
  open: boolean;
  title: string;
  value: string;
  min: string;
  max: string;
  onCancel: () => void;
  onConfirm: (next: string) => void;
}) {
  const lower = useMemo(() => parse(min), [min]);
  const upper = useMemo(() => parse(max), [max]);
  const [year, setYear] = useState(() => parse(value).year);
  const [month, setMonth] = useState(() => parse(value).month);
  const [day, setDay] = useState(() => parse(value).day);

  useEffect(() => {
    if (!open) return;
    const parsed = parse(value);
    setYear(parsed.year);
    setMonth(parsed.month);
    setDay(parsed.day);
  }, [open, value]);

  const years = useMemo(() => range(lower.year, upper.year), [lower.year, upper.year]);

  const months = useMemo(() => {
    const start = year === lower.year ? lower.month : 1;
    const end = year === upper.year ? upper.month : 12;
    return range(start, end);
  }, [year, lower.year, lower.month, upper.year, upper.month]);

  const monthValue = months.includes(month) ? month : months[0];

  const days = useMemo(() => {
    const total = new Date(year, monthValue, 0).getDate();
    const start = year === lower.year && monthValue === lower.month ? lower.day : 1;
    const end = year === upper.year && monthValue === upper.month ? upper.day : total;
    return range(start, Math.max(start, Math.min(total, end)));
  }, [year, monthValue, lower, upper]);

  const dayValue = days.includes(day) ? day : days[days.length - 1];

  return (
    <Sheet
      open={open}
      title={title}
      height={400}
      onClose={onCancel}
      footer={
        <div className="cc-sheet-actions">
          <button type="button" className="cc-btn cc-btn--ghost" onClick={onCancel}>取消</button>
          <button
            type="button"
            className="cc-btn cc-btn--primary"
            onClick={() => onConfirm(`${year}-${pad(monthValue)}-${pad(dayValue)}`)}
          >
            确定
          </button>
        </div>
      }
    >
      <div className="cc-wheel-head">
        <span>年</span>
        <span>月</span>
        <span>日</span>
      </div>
      <div className="cc-wheel">
        <div className="cc-wheel-band" />
        <WheelColumn items={years} value={year} onChange={setYear} />
        <WheelColumn items={months} value={monthValue} format={pad} onChange={setMonth} />
        <WheelColumn items={days} value={dayValue} format={pad} onChange={setDay} />
      </div>
    </Sheet>
  );
}
