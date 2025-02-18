import { createTag } from '../../libs/utils/utils.js';

export default function init(block) {
  const columns = [];
  const rows = block.querySelectorAll(':scope > div');

  // creates 2D array as columns containing row's cells
  Array.from(rows).forEach((row, i) => {
    const cells = row.querySelectorAll(':scope > div');
    Array.from(cells).forEach((cell, j) => {
      if (!columns[j]) columns[j] = [];
      columns[j][i] = cell.textContent;
    });
  });

  const upper = createTag('div', { class: 'upper' });
  const lower = createTag('div', { class: 'lower' });
  const separator = createTag('div', { class: 'separator' });

  columns.forEach((column) => {
    const col = createTag('div', { class: 'column' });
    column.forEach((cell, j) => {
      const cellEl = createTag('div', { class: j === 0 ? 'cell header' : 'cell' }, cell);
      if (!cellEl.textContent) {
        cellEl.classList.add('empty');
      }
      if (j === columns.length - 1) {
        lower.append(cellEl);
      } else {
        col.append(cellEl);
      }
    });
    upper.append(col);
  });

  block.innerHTML = '';
  block.append(upper, separator, lower);

  block.style.setProperty('--columns-count', columns.length);
}
