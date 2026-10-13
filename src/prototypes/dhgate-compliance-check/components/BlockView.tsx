import React, { useState } from 'react';
import { Block } from '../lib/scenarios';
import { IMAGES } from './ui';

export function BlockView({ block }: { block: Block }) {
  switch (block.kind) {
    case 'text':
      return (
        <div className="dcc-block dcc-block--text">
          {block.label ? <div className="dcc-block-label">{block.label}</div> : null}
          <div className="dcc-block-line">
            <span className="dcc-field-chip">{block.field}</span>
            <span className="dcc-fragment">{highlight(block.fragment, block.word)}</span>
          </div>
        </div>
      );
    case 'list':
      return (
        <div className="dcc-block dcc-block--list">
          <div className="dcc-block-label">{block.label}</div>
          <div className="dcc-chips">
            {block.items.map((item, index) => (
              <span className="dcc-chip" key={index}>{item}</span>
            ))}
          </div>
        </div>
      );
    case 'image':
      return <ImageView label={block.label} srcKey={block.src} boxes={block.boxes} caption={block.caption} />;
    case 'ocr':
      return (
        <div className="dcc-block dcc-block--ocr">
          <div className="dcc-block-label">{block.label}</div>
          <pre className="dcc-ocr">
            {block.lines.map((line, index) => (
              <div key={index} className={line.hit ? 'is-hit' : undefined}>{line.text}</div>
            ))}
          </pre>
        </div>
      );
    case 'table':
      return (
        <div className="dcc-block dcc-block--table">
          <div className="dcc-block-label">{block.label}</div>
          <table className="dcc-table">
            <thead>
              <tr>{block.columns.map((column) => <th key={column}>{column}</th>)}</tr>
            </thead>
            <tbody>
              {block.rows.map((row, index) => (
                <tr key={index}>
                  {row.cells.map((cell, cellIndex) => (
                    <td key={cellIndex} className={row.bad?.includes(cellIndex) ? 'is-bad' : undefined}>{cell}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    case 'formula':
      return (
        <div className="dcc-block dcc-block--formula">
          <div className="dcc-block-label">{block.label}</div>
          <div className="dcc-formula-lines">
            {block.lines.map((line, index) => <div key={index} className="dcc-formula-line">{line}</div>)}
          </div>
          {block.result ? <div className="dcc-formula-result">{block.result}</div> : null}
        </div>
      );
    default:
      return null;
  }
}

function highlight(text: string, word?: string): React.ReactNode {
  if (!word || !text.includes(word)) return text;
  const [before, after] = text.split(word);
  return (
    <>
      {before}
      <mark className="dcc-mark">{word}</mark>
      {after}
    </>
  );
}

export function ImageView({
  label,
  srcKey,
  boxes,
  caption,
}: {
  label: string;
  srcKey: string;
  boxes?: { x: number; y: number; w: number; h: number; label: string }[];
  caption?: string;
}) {
  const [failed, setFailed] = useState(false);
  const src = IMAGES[srcKey as keyof typeof IMAGES];
  return (
    <div className="dcc-block dcc-block--image">
      <div className="dcc-block-label">{label}</div>
      {failed || !src ? (
        <div className="dcc-img-fallback">
          <div>图片加载失败</div>
          <button type="button" className="dcc-btn dcc-btn--text" onClick={() => setFailed(false)}>重新加载</button>
        </div>
      ) : (
        <div className="dcc-image-wrap">
          <img className="dcc-image" src={src} alt={label} onError={() => setFailed(true)} loading="lazy" />
          {boxes?.map((box, index) => (
            <div
              key={index}
              className="dcc-anno-box"
              style={{ left: `${box.x}%`, top: `${box.y}%`, width: `${box.w}%`, height: `${box.h}%` }}
            >
              <span className="dcc-anno-label">{box.label}</span>
            </div>
          ))}
        </div>
      )}
      {caption ? <div className="dcc-image-caption">{caption}</div> : null}
    </div>
  );
}
