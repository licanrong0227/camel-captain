type ZipEntry = { name: string; data: Uint8Array };

const encoder = new TextEncoder();
const decoder = new TextDecoder();

const CRC_TABLE = (() => {
  const table = new Uint32Array(256);
  for (let i = 0; i < 256; i += 1) {
    let value = i;
    for (let bit = 0; bit < 8; bit += 1) {
      value = value & 1 ? 0xedb88320 ^ (value >>> 1) : value >>> 1;
    }
    table[i] = value >>> 0;
  }
  return table;
})();

function crc32(data: Uint8Array) {
  let value = 0xffffffff;
  for (let i = 0; i < data.length; i += 1) {
    value = CRC_TABLE[(value ^ data[i]) & 0xff] ^ (value >>> 8);
  }
  return (value ^ 0xffffffff) >>> 0;
}

function zipStore(files: ZipEntry[]) {
  const chunks: Uint8Array[] = [];
  const central: Uint8Array[] = [];
  let offset = 0;
  const now = new Date();
  const time = ((now.getHours() << 11) | (now.getMinutes() << 5) | (now.getSeconds() >> 1)) & 0xffff;
  const date = (((now.getFullYear() - 1980) << 9) | ((now.getMonth() + 1) << 5) | now.getDate()) & 0xffff;

  files.forEach((file) => {
    const name = encoder.encode(file.name);
    const checksum = crc32(file.data);

    const local = new Uint8Array(30 + name.length);
    const localView = new DataView(local.buffer);
    localView.setUint32(0, 0x04034b50, true);
    localView.setUint16(4, 20, true);
    localView.setUint16(6, 0x0800, true);
    localView.setUint16(8, 0, true);
    localView.setUint16(10, time, true);
    localView.setUint16(12, date, true);
    localView.setUint32(14, checksum, true);
    localView.setUint32(18, file.data.length, true);
    localView.setUint32(22, file.data.length, true);
    localView.setUint16(26, name.length, true);
    localView.setUint16(28, 0, true);
    local.set(name, 30);

    const record = new Uint8Array(46 + name.length);
    const recordView = new DataView(record.buffer);
    recordView.setUint32(0, 0x02014b50, true);
    recordView.setUint16(4, 20, true);
    recordView.setUint16(6, 20, true);
    recordView.setUint16(8, 0x0800, true);
    recordView.setUint16(10, 0, true);
    recordView.setUint16(12, time, true);
    recordView.setUint16(14, date, true);
    recordView.setUint32(16, checksum, true);
    recordView.setUint32(20, file.data.length, true);
    recordView.setUint32(24, file.data.length, true);
    recordView.setUint16(28, name.length, true);
    recordView.setUint16(30, 0, true);
    recordView.setUint16(32, 0, true);
    recordView.setUint16(34, 0, true);
    recordView.setUint16(36, 0, true);
    recordView.setUint32(38, 0, true);
    recordView.setUint32(42, offset, true);
    record.set(name, 46);

    chunks.push(local, file.data);
    central.push(record);
    offset += local.length + file.data.length;
  });

  const centralSize = central.reduce((total, part) => total + part.length, 0);
  const end = new Uint8Array(22);
  const endView = new DataView(end.buffer);
  endView.setUint32(0, 0x06054b50, true);
  endView.setUint16(4, 0, true);
  endView.setUint16(6, 0, true);
  endView.setUint16(8, files.length, true);
  endView.setUint16(10, files.length, true);
  endView.setUint32(12, centralSize, true);
  endView.setUint32(16, offset, true);
  endView.setUint16(20, 0, true);

  return new Blob([...chunks, ...central, end] as BlobPart[], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });
}

function escapeXml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function columnName(index: number) {
  let name = '';
  let value = index + 1;
  while (value > 0) {
    const remainder = (value - 1) % 26;
    name = String.fromCharCode(65 + remainder) + name;
    value = Math.floor((value - 1) / 26);
  }
  return name;
}

function columnIndex(letters: string) {
  let value = 0;
  for (const letter of letters.toUpperCase()) {
    value = value * 26 + (letter.charCodeAt(0) - 64);
  }
  return Math.max(value - 1, 0);
}

const XML_HEADER = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>';

export function buildXlsx(rows: string[][], sheetName = 'Sheet1') {
  const sheetRows = rows
    .map((row, rowIndex) => {
      const cells = row
        .map(
          (cell, colIndex) =>
            `<c r="${columnName(colIndex)}${rowIndex + 1}" t="inlineStr"><is><t xml:space="preserve">${escapeXml(
              cell,
            )}</t></is></c>`,
        )
        .join('');
      return `<row r="${rowIndex + 1}">${cells}</row>`;
    })
    .join('');

  const sheet = `${XML_HEADER}<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><sheetData>${sheetRows}</sheetData></worksheet>`;
  const workbook = `${XML_HEADER}<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><sheets><sheet name="${escapeXml(
    sheetName,
  )}" sheetId="1" r:id="rId1"/></sheets></workbook>`;
  const workbookRels = `${XML_HEADER}<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/><Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/></Relationships>`;
  const styles = `${XML_HEADER}<styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><fonts count="1"><font><sz val="11"/><name val="Calibri"/></font></fonts><fills count="1"><fill><patternFill patternType="none"/></fill></fills><borders count="1"><border/></borders><cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs><cellXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0"/></cellXfs></styleSheet>`;
  const contentTypes = `${XML_HEADER}<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/><Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/><Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/></Types>`;
  const rootRels = `${XML_HEADER}<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/></Relationships>`;

  return zipStore([
    { name: '[Content_Types].xml', data: encoder.encode(contentTypes) },
    { name: '_rels/.rels', data: encoder.encode(rootRels) },
    { name: 'xl/workbook.xml', data: encoder.encode(workbook) },
    { name: 'xl/_rels/workbook.xml.rels', data: encoder.encode(workbookRels) },
    { name: 'xl/styles.xml', data: encoder.encode(styles) },
    { name: 'xl/worksheets/sheet1.xml', data: encoder.encode(sheet) },
  ]);
}

async function inflateRaw(data: Uint8Array) {
  const DecompressionCtor = (globalThis as { DecompressionStream?: new (format: string) => TransformStream<Uint8Array, Uint8Array> })
    .DecompressionStream;
  if (!DecompressionCtor) throw new Error('当前浏览器不支持解压');
  const stream = new Blob([data as BlobPart]).stream().pipeThrough(new DecompressionCtor('deflate-raw'));
  return new Uint8Array(await new Response(stream).arrayBuffer());
}

async function unzip(buffer: Uint8Array) {
  const view = new DataView(buffer.buffer, buffer.byteOffset, buffer.byteLength);
  let endOffset = -1;
  const minOffset = Math.max(0, buffer.length - 66000);
  for (let i = buffer.length - 22; i >= minOffset; i -= 1) {
    if (view.getUint32(i, true) === 0x06054b50) {
      endOffset = i;
      break;
    }
  }
  if (endOffset < 0) throw new Error('文件格式不正确');

  const count = view.getUint16(endOffset + 10, true);
  let pointer = view.getUint32(endOffset + 16, true);
  const entries = new Map<string, Uint8Array>();

  for (let i = 0; i < count; i += 1) {
    if (pointer + 46 > buffer.length || view.getUint32(pointer, true) !== 0x02014b50) break;
    const method = view.getUint16(pointer + 10, true);
    const compressedSize = view.getUint32(pointer + 20, true);
    const nameLength = view.getUint16(pointer + 28, true);
    const extraLength = view.getUint16(pointer + 30, true);
    const commentLength = view.getUint16(pointer + 32, true);
    const localOffset = view.getUint32(pointer + 42, true);
    const name = decoder.decode(buffer.subarray(pointer + 46, pointer + 46 + nameLength));

    const localNameLength = view.getUint16(localOffset + 26, true);
    const localExtraLength = view.getUint16(localOffset + 28, true);
    const dataStart = localOffset + 30 + localNameLength + localExtraLength;
    const compressed = buffer.subarray(dataStart, dataStart + compressedSize);

    if (method === 0) entries.set(name, compressed);
    else if (method === 8) entries.set(name, await inflateRaw(compressed));

    pointer += 46 + nameLength + extraLength + commentLength;
  }

  return entries;
}

function parseCsv(text: string) {
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = '';
  let quoted = false;
  const source = text.replace(/^\uFEFF/, '');

  for (let i = 0; i < source.length; i += 1) {
    const char = source[i];
    if (quoted) {
      if (char === '"' && source[i + 1] === '"') {
        cell += '"';
        i += 1;
      } else if (char === '"') {
        quoted = false;
      } else {
        cell += char;
      }
    } else if (char === '"') {
      quoted = true;
    } else if (char === ',') {
      row.push(cell);
      cell = '';
    } else if (char === '\n') {
      row.push(cell);
      rows.push(row);
      row = [];
      cell = '';
    } else if (char !== '\r') {
      cell += char;
    }
  }

  if (cell || row.length) {
    row.push(cell);
    rows.push(row);
  }
  return rows;
}

async function readXlsx(file: File) {
  const entries = await unzip(new Uint8Array(await file.arrayBuffer()));
  const parser = new DOMParser();
  const sheetName = [...entries.keys()].find((name) => /^xl\/worksheets\/sheet\d+\.xml$/i.test(name));
  if (!sheetName) throw new Error('未找到工作表');

  const shared: string[] = [];
  const sharedName = [...entries.keys()].find((name) => /^xl\/sharedStrings\.xml$/i.test(name));
  if (sharedName) {
    const sharedDoc = parser.parseFromString(decoder.decode(entries.get(sharedName)), 'application/xml');
    Array.from(sharedDoc.getElementsByTagName('si')).forEach((node) => {
      shared.push(node.textContent || '');
    });
  }

  const sheetDoc = parser.parseFromString(decoder.decode(entries.get(sheetName)), 'application/xml');
  const rows: string[][] = [];
  Array.from(sheetDoc.getElementsByTagName('row')).forEach((rowNode) => {
    const cells: string[] = [];
    Array.from(rowNode.getElementsByTagName('c')).forEach((cellNode) => {
      const reference = cellNode.getAttribute('r') || '';
      const index = columnIndex(reference.replace(/\d+/g, ''));
      const type = cellNode.getAttribute('t');
      let value = '';
      if (type === 's') {
        const sharedIndex = Number(cellNode.getElementsByTagName('v')[0]?.textContent || 0);
        value = shared[sharedIndex] ?? '';
      } else if (type === 'inlineStr') {
        value = cellNode.getElementsByTagName('t')[0]?.textContent || '';
      } else {
        value = cellNode.getElementsByTagName('v')[0]?.textContent || '';
      }
      cells[index] = value;
    });
    rows.push(Array.from(cells, (cell) => cell ?? ''));
  });
  return rows;
}

export async function readTableFile(file: File) {
  if (/\.csv$/i.test(file.name)) return parseCsv(await file.text());
  return readXlsx(file);
}

export function downloadBlob(name: string, blob: Blob) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = name;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}
