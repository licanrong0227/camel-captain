/**
 * @name 我的订单 - 批处理申报信息
 */

import React from 'react';
import './style.css';
import { AnnotationViewer, type AnnotationSourceDocument } from '@axhub/annotation';
import annotationSourceDocument from './annotation-source.json';

type DeclareRow = {
  seq: number;
  orderNo: string;
  productName: string;
  spec: string;
  nameEn: string;
  nameCn: string;
  qty: string;
  unitValue: string;
  unitWeight: string;
  length: string;
  width: string;
  height: string;
};

const ROWS: DeclareRow[] = [
  {
    seq: 1,
    orderNo: '323171910636',
    productName:
      "2026 Top Designer Bag New Classic Croc-Embossed Handbag Lightweight Luxury Simple Shoulder and Crossbody Bag Fashionable Women's Chain Small Square Bag 10A",
    spec: '4#,China,20*11*5cm',
    nameEn: 'Shoulder Bags',
    nameCn: '单肩包',
    qty: '1',
    unitValue: '40.00',
    unitWeight: '1.00',
    length: '0',
    width: '0',
    height: '0',
  },
  {
    seq: 2,
    orderNo: '323174336292',
    productName:
      'Designer Mens Tracksuits tech fleece Men Hoodies pant sports Pants Jogger suits zipper Thick sportswear sportsuit mens coats winter coat techfleece Man Joggers',
    spec: 'Khaki,L',
    nameEn: "Men's Hoodies & Sweatshirts",
    nameCn: '男士卫衣(有帽, 无帽)',
    qty: '1',
    unitValue: '55.91',
    unitWeight: '1.00',
    length: '0',
    width: '0',
    height: '0',
  },
  {
    seq: 3,
    orderNo: '323180909559',
    productName: 'Mens Black Patent Leather Loafers With Triangle Logo Durable And Chunky Sole',
    spec: 'Men-US 7 - EU 40- Foot Length 9.8",China,1black',
    nameEn: 'Dress Shoes',
    nameCn: '正装鞋',
    qty: '1',
    unitValue: '48.16',
    unitWeight: '1.00',
    length: '0',
    width: '0',
    height: '0',
  },
  {
    seq: 4,
    orderNo: '323188000622',
    productName:
      "2026 Top Designer Bag New Classic Croc-Embossed Handbag Lightweight Luxury Simple Shoulder and Crossbody Bag Fashionable Women's Chain Small Square Bag 10A",
    spec: '4#,China,20*11*5cm',
    nameEn: 'Shoulder Bags',
    nameCn: '单肩包',
    qty: '1',
    unitValue: '40.00',
    unitWeight: '1.00',
    length: '0',
    width: '0',
    height: '0',
  },
  {
    seq: 5,
    orderNo: '323196982374',
    productName:
      "Men's Print Clogs Slip-on Footbed Mules popular couple's winter closed-toe cork-soled slippers women's Korean-style fashionable outdoor half-slippers",
    spec: '1Brown,Eur45',
    nameEn: 'Clogs',
    nameCn: '木屐',
    qty: '1',
    unitValue: '35.10',
    unitWeight: '1.00',
    length: '0',
    width: '0',
    height: '0',
  },
  {
    seq: 6,
    orderNo: '323204879082',
    productName:
      'Womens Black Leather Penny Loafers Gold Metal Buckle Slip On For Office Casual Daily Wear',
    spec: '1Black,Women-US 10 - EU 40- Foot Length 9.8"',
    nameEn: 'Loafers',
    nameCn: '乐福鞋',
    qty: '1',
    unitValue: '39.72',
    unitWeight: '1.00',
    length: '0',
    width: '0',
    height: '0',
  },
  {
    seq: 7,
    orderNo: '323214218162',
    productName:
      'CUUS DUUS White Patent Leather Platform Combat Boots Detachable Triangle Metal Logo Pocket Side Zip Lace Up Lug Sole Women Fashion Ankle Boots',
    spec: 'EUR42,Black matte finish',
    nameEn: 'Boots',
    nameCn: '靴子',
    qty: '1',
    unitValue: '36.50',
    unitWeight: '1.00',
    length: '0',
    width: '0',
    height: '0',
  },
  {
    seq: 8,
    orderNo: '323217591484',
    productName:
      '2025 Vintage Pink Mini Bag for Women: Retro Shoulder Bag, Small Crossbody Handbag, Cute Underarm Purse, Elegant Evening Clutch',
    spec: '#4,China',
    nameEn: 'Shoulder Bags',
    nameCn: '单肩包',
    qty: '1',
    unitValue: '53.34',
    unitWeight: '1.00',
    length: '0',
    width: '0',
    height: '0',
  },
  {
    seq: 9,
    orderNo: '323218453719',
    productName:
      '5A Mens Jeans 2025 - Black Straight Fit Denim Pants - Retro Casual Streetwear Joggers',
    spec: 'A11,28',
    nameEn: 'Jeans',
    nameCn: '牛仔裤',
    qty: '1',
    unitValue: '58.39',
    unitWeight: '1.00',
    length: '0',
    width: '0',
    height: '0',
  },
  {
    seq: 10,
    orderNo: '323226396029',
    productName:
      '2026 Designer Leather Crossbody Bags for Women - Oversized Gold Logo Chain Strap, Multi-Color Rectangular Style for Daily, Leisure, and Date Use',
    spec: 'White,Size: 11 * 19 * 5cm',
    nameEn: 'Crossbody Bags',
    nameCn: '斜挎包',
    qty: '1',
    unitValue: '118.00',
    unitWeight: '1.00',
    length: '0',
    width: '0',
    height: '0',
  },
];

function IconClose() {
  return (
    <svg viewBox="0 0 16 16" width="16" height="16" aria-hidden="true">
      <path
        d="M4.2 3.1 8 6.9l3.8-3.8 1.1 1.1L9.1 8l3.8 3.8-1.1 1.1L8 9.1l-3.8 3.8-1.1-1.1L6.9 8 3.1 4.2z"
        fill="currentColor"
      />
    </svg>
  );
}

function IconChevron({ up }: { up?: boolean }) {
  return (
    <svg viewBox="0 0 10 10" width="10" height="10" aria-hidden="true">
      <path
        d={up ? 'M2 6.5 5 3.5l3 3' : 'M2 3.5 5 6.5l3-3'}
        fill="none"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function IconSearch() {
  return (
    <svg viewBox="0 0 14 14" width="14" height="14" aria-hidden="true">
      <path
        d="M9.2 8.1a3.7 3.7 0 1 0-1.1 1.1l2.3 2.3a.8.8 0 0 0 1.1-1.1zM6.1 9.2a3.1 3.1 0 1 1 0-6.2 3.1 3.1 0 0 1 0 6.2z"
        fill="currentColor"
      />
    </svg>
  );
}

function IconCaret() {
  return (
    <svg viewBox="0 0 12 12" width="12" height="12" aria-hidden="true">
      <path d="M2.5 4.5 6 8l3.5-3.5z" fill="currentColor" />
    </svg>
  );
}

function IconEdit() {
  return (
    <svg viewBox="0 0 14 14" width="14" height="14" aria-hidden="true">
      <path
        d="M11.4 1.9a1.4 1.4 0 0 1 2 2L4.8 12.4l-3 .8.8-3z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function Checkbox() {
  return <span className="mobd-checkbox" aria-hidden="true" />;
}

function TextCell({ value }: { value: string }) {
  return <input className="mobd-input" type="text" defaultValue={value} readOnly tabIndex={-1} />;
}

function NumberCell({ value }: { value: string }) {
  return (
    <span className="mobd-input-number">
      <input className="mobd-input mobd-input-number__inner" type="text" defaultValue={value} readOnly tabIndex={-1} />
      <span className="mobd-input-number__controls">
        <span className="mobd-input-number__increase">
          <IconChevron up />
        </span>
        <span className="mobd-input-number__decrease">
          <IconChevron />
        </span>
      </span>
    </span>
  );
}

function DeclareRowCells({ row }: { row: DeclareRow }) {
  return (
    <>
      <td className="mobd-td mobd-td--center mobd-td--selection">
        <div className="mobd-cell">
          <Checkbox />
        </div>
      </td>
      <td className="mobd-td mobd-td--center">
        <div className="mobd-cell">{row.seq}</div>
      </td>
      <td className="mobd-td">
        <div className="mobd-cell mobd-cell--num">{row.orderNo}</div>
      </td>
      <td className="mobd-td">
        <div className="mobd-cell mobd-cell--product">
          <span className="mobd-thumb" aria-hidden="true">
            <svg viewBox="0 0 24 24" width="20" height="20">
              <path
                d="M6.5 10a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5zM3 18.6c1.2-2.9 3.4-4.6 6-4.6 1.3 0 2.5.4 3.5 1.1L9 19.5H3v-.9zm15.9-6.1L21 16.6v3h-6.6l1.8-4.4c1.1.2 2.1.7 2.7 1.2zM15.5 10a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5z"
                fill="currentColor"
              />
            </svg>
          </span>
          <span className="mobd-product-name">{row.productName}</span>
        </div>
      </td>
      <td className="mobd-td">
        <div className="mobd-cell mobd-cell--ellipsis" title={row.spec}>
          {row.spec}
        </div>
      </td>
      <td className="mobd-td">
        <div className="mobd-cell">
          <TextCell value={row.nameEn} />
        </div>
      </td>
      <td className="mobd-td">
        <div className="mobd-cell">
          <TextCell value={row.nameCn} />
        </div>
      </td>
      <td className="mobd-td">
        <div className="mobd-cell">
          <NumberCell value={row.qty} />
        </div>
      </td>
      <td className="mobd-td">
        <div className="mobd-cell">
          <NumberCell value={row.unitValue} />
        </div>
      </td>
      <td className="mobd-td">
        <div className="mobd-cell">
          <input className="mobd-input" type="text" placeholder="请输入" readOnly tabIndex={-1} />
        </div>
      </td>
      <td className="mobd-td">
        <div className="mobd-cell">
          <input className="mobd-input" type="text" placeholder="请输入" readOnly tabIndex={-1} />
        </div>
      </td>
      <td className="mobd-td">
        <div className="mobd-cell">
          <input className="mobd-input" type="text" placeholder="请输入" readOnly tabIndex={-1} />
        </div>
      </td>
      <td className="mobd-td">
        <div className="mobd-cell">
          <NumberCell value={row.unitWeight} />
        </div>
      </td>
      <td className="mobd-td">
        <div className="mobd-cell">
          <NumberCell value={row.length} />
        </div>
      </td>
      <td className="mobd-td">
        <div className="mobd-cell">
          <NumberCell value={row.width} />
        </div>
      </td>
      <td className="mobd-td">
        <div className="mobd-cell">
          <NumberCell value={row.height} />
        </div>
      </td>
      <td className="mobd-td">
        <div className="mobd-cell">
          <span className="mobd-input-wrapper">
            <input className="mobd-input mobd-input--suffix" type="text" placeholder="请输入" readOnly tabIndex={-1} />
            <span className="mobd-input__suffix">
              <IconSearch />
            </span>
          </span>
        </div>
      </td>
      <td className="mobd-td">
        <div className="mobd-cell">
          <input className="mobd-input" type="text" placeholder="请输入" readOnly tabIndex={-1} />
        </div>
      </td>
      <td className="mobd-td">
        <div className="mobd-cell">
          <input className="mobd-input" type="text" placeholder="请输入" readOnly tabIndex={-1} />
        </div>
      </td>
      <td className="mobd-td">
        <div className="mobd-cell">
          <span className="mobd-input-wrapper">
            <input className="mobd-input mobd-input--suffix" type="text" placeholder="请选择" readOnly tabIndex={-1} />
            <span className="mobd-input__suffix">
              <IconCaret />
            </span>
          </span>
        </div>
      </td>
    </>
  );
}

function DeclareTable() {
  return (
    <div className="mobd-table-frame">
      <div className="mobd-table-scroll">
        <table className="mobd-table">
          <colgroup>
            <col style={{ width: 45 }} />
            <col style={{ width: 60 }} />
            <col style={{ width: 140 }} />
            <col style={{ width: 220 }} />
            <col style={{ width: 140 }} />
            <col style={{ width: 160 }} />
            <col style={{ width: 160 }} />
            <col style={{ width: 130 }} />
            <col style={{ width: 140 }} />
            <col style={{ width: 180 }} />
            <col style={{ width: 180 }} />
            <col style={{ width: 180 }} />
            <col style={{ width: 140 }} />
            <col style={{ width: 120 }} />
            <col style={{ width: 120 }} />
            <col style={{ width: 120 }} />
            <col style={{ width: 130 }} />
            <col style={{ width: 120 }} />
            <col style={{ width: 120 }} />
            <col style={{ width: 180 }} />
          </colgroup>
          <thead>
            <tr>
              <th className="mobd-th mobd-th--center mobd-th--selection">
                <div className="mobd-cell">
                  <Checkbox />
                </div>
              </th>
              <th className="mobd-th mobd-th--center">
                <div className="mobd-cell">序号</div>
              </th>
              <th className="mobd-th">
                <div className="mobd-cell">平台订单号</div>
              </th>
              <th className="mobd-th">
                <div className="mobd-cell">产品信息</div>
              </th>
              <th className="mobd-th">
                <div className="mobd-cell">规格</div>
              </th>
              <th className="mobd-th mobd-th--editable">
                <div className="mobd-cell">
                  <span className="mobd-batch-header">
                    英文名
                    <span className="mobd-translate-icon">文A</span>
                  </span>
                </div>
              </th>
              <th className="mobd-th mobd-th--editable">
                <div className="mobd-cell">
                  <span className="mobd-batch-header">
                    中文名
                    <span className="mobd-translate-icon">文A</span>
                  </span>
                </div>
              </th>
              <th className="mobd-th mobd-th--editable">
                <div className="mobd-cell">
                  <span className="mobd-batch-header">
                    数量
                    <IconEdit />
                  </span>
                </div>
              </th>
              <th className="mobd-th mobd-th--editable">
                <div className="mobd-cell">
                  <span className="mobd-batch-header">
                    单位价值USD
                    <IconEdit />
                  </span>
                </div>
              </th>
              <th className="mobd-th mobd-th--editable" data-annotation-id="declare-col-nspid">
                <div className="mobd-cell">
                  <span className="mobd-batch-header">制造商产品识别码（nsPid）</span>
                </div>
              </th>
              <th className="mobd-th mobd-th--editable" data-annotation-id="declare-col-spid">
                <div className="mobd-cell">
                  <span className="mobd-batch-header">国际标准商品编码（sPid）</span>
                </div>
              </th>
              <th className="mobd-th mobd-th--editable" data-annotation-id="declare-col-mpid">
                <div className="mobd-cell">
                  <span className="mobd-batch-header">商家产品识别码（mPid）</span>
                </div>
              </th>
              <th className="mobd-th">
                <div className="mobd-cell">单位重量kg</div>
              </th>
              <th className="mobd-th">
                <div className="mobd-cell">长(CM)</div>
              </th>
              <th className="mobd-th">
                <div className="mobd-cell">宽(CM)</div>
              </th>
              <th className="mobd-th">
                <div className="mobd-cell">高(CM)</div>
              </th>
              <th className="mobd-th">
                <div className="mobd-cell">海关编码</div>
              </th>
              <th className="mobd-th">
                <div className="mobd-cell">材质</div>
              </th>
              <th className="mobd-th">
                <div className="mobd-cell">用途</div>
              </th>
              <th className="mobd-th">
                <div className="mobd-cell">特征</div>
              </th>
            </tr>
          </thead>
          <tbody>
            {ROWS.map((row) => (
              <tr key={row.seq} className="mobd-tr">
                <DeclareRowCells row={row} />
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default function MyOrderBatchDeclare() {
  return (
    <>
      <div className="mobd-root">
        <div className="mobd-mask">
          <section
            className="mobd-dialog"
            role="dialog"
            aria-modal="true"
            aria-label="批处理申报信息"
            data-annotation-id="declare-required-fields"
          >
            <header className="mobd-dialog__header">
              <h2 className="mobd-dialog__title">批处理申报信息</h2>
              <button type="button" className="mobd-dialog__close" aria-label="关闭">
                <IconClose />
              </button>
            </header>
            <div className="mobd-dialog__body">
              <div className="mobd-toolbar">
                <button type="button" className="mobd-btn mobd-btn--danger" disabled>
                  批量删除
                </button>
                <button type="button" className="mobd-btn mobd-btn--outline">
                  查看重复订单
                </button>
              </div>
              <DeclareTable />
            </div>
            <footer className="mobd-dialog__footer">
              <button type="button" className="mobd-btn mobd-btn--medium mobd-btn--default">
                取消
              </button>
              <button type="button" className="mobd-btn mobd-btn--medium mobd-btn--primary">
                保存
              </button>
            </footer>
          </section>
        </div>
      </div>
      <AnnotationViewer
        source={annotationSourceDocument as unknown as AnnotationSourceDocument}
        options={{
          currentPageId: (() => {
            const hashPageId = new URLSearchParams(window.location.hash.replace(/^#/, '')).get('page');
            const searchPageId = new URLSearchParams(window.location.search.replace(/^\?/, '')).get('page');
            const pageId = hashPageId || searchPageId;
            return typeof pageId === 'string' && /^[a-z0-9-]+$/u.test(pageId) ? pageId : 'my-order-batch-declare';
          })(),
          onDirectoryRoute: (node) => {
            if (typeof node.route === 'string' && /^[a-z0-9-]+$/u.test(node.route)) {
              window.location.hash = `page=${node.route}`;
            }
          },
          toolbarEdge: 'right',
          showToolbar: true,
          showThemeToggle: true,
          showColorFilter: true,
          emptyWhenNoData: true,
        }}
      />
    </>
  );
}
