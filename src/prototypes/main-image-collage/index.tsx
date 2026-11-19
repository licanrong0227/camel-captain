/**
 * @name 主图拼图
 */

import React from 'react';
import './style.css';

import CollageDialog from './components/CollageDialog';

export default function Prototype() {
  const [open, setOpen] = React.useState(true);

  return (
    <>
      <div className="mic-page">
        {!open && (
          <button className="mic-reopen" type="button" onClick={() => setOpen(true)}>
            打开主图拼图
          </button>
        )}
      </div>
      <CollageDialog open={open} onClose={() => setOpen(false)} mainCount={8} mainLimit={8} />
    </>
  );
}
