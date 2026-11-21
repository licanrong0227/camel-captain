/**
 * @name 新增上新价配置弹窗
 */

import React, { useState } from 'react';
import './style.css';
import NewArrivalPriceDialog from './components/NewArrivalPriceDialog';

export default function Prototype() {
  const [open, setOpen] = useState(true);

  return (
    <div className="napd-page">
      {open ? (
        <NewArrivalPriceDialog onClose={() => setOpen(false)} />
      ) : (
        <button type="button" className="napd-reopen" onClick={() => setOpen(true)}>打开新增上新价配置弹窗</button>
      )}
    </div>
  );
}
