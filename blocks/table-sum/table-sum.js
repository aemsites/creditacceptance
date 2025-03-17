import { createTag } from '../../libs/utils/utils.js';

function getBlockMetadata(block) {
  const section = block.closest('.section-outer');
  const metadata = section.querySelector('.table-sum-metadata');
  metadata.style.display = 'none';

  const rows = metadata.querySelectorAll(':scope > div');
  const data = [];
  Array.from(rows).forEach((row) => {
    const keyCol = row.children[0].textContent.trim().toLowerCase();
    const valueCol = row.children[1].textContent.trim().toLowerCase();
    const keys = keyCol.split(',');
    keys.forEach((key) => {
      // eslint-disable-next-line no-unused-vars
      const [_, index, type] = key.split('-');
      data.push({
        columnIndex: parseInt(index, 10),
        type,
        value: valueCol,
      });
    });
  });

  return data;
}

function decorateSeparator(lower) {
  const columns = lower.querySelectorAll('.column');
  let start = 0;
  let end = columns.length - 1;
  for (let i = 0; i < columns.length; i += 1) {
    if (columns[i].textContent.trim()) {
      start = i;
      break;
    }
  }

  for (let i = columns.length - 1; i >= 0; i -= 1) {
    if (columns[i].textContent.trim()) {
      end = i;
      break;
    }
  }

  const separator = createTag('div', { class: 'separator' });

  const lowerStyles = getComputedStyle(lower, '--columns-desktop-count');
  const desktopColumnCount = lowerStyles.getPropertyValue('--columns-desktop-count');

  const width = ((end - start + 1) / parseInt(desktopColumnCount, 10)) * 100;
  separator.style.width = `${width}%`;
  separator.style.marginInlineStart = `calc(100% - ${width}%)`;
  lower.insertAdjacentElement('beforebegin', separator);
}

export default function init(block) {
  const columns = [];
  const rows = block.querySelectorAll(':scope > div');

  // creates 2D array as columns containing row's cells
  Array.from(rows).forEach((row, i) => {
    const cells = row.querySelectorAll(':scope > div');
    Array.from(cells).forEach((cell, j) => {
      if (!columns[j]) columns[j] = [];
      columns[j][i] = cell;
    });
  });

  const upper = createTag('div', { class: 'upper' });
  const lower = createTag('div', { class: 'lower' });
  // const separator = createTag('div', { class: 'separator' });

  columns.forEach((column) => {
    const upperCol = createTag('div', { class: 'column' });
    const lowerCol = createTag('div', { class: 'column' });
    column.forEach((cell, j) => {
      const cellEl = createTag('div', { class: 'cell' }, cell);
      if (j === 0) {
        cellEl.classList.add('header');
      }

      if (!cellEl.textContent) {
        cellEl.classList.add('empty');
      }

      if (j === column.length - 1) {
        lowerCol.append(cellEl);
        lower.append(lowerCol);
      } else {
        upperCol.append(cellEl);
        upper.append(upperCol);
      }
    });
  });

  block.innerHTML = '';
  block.append(upper, lower);

  const metadata = getBlockMetadata(block);

  metadata.forEach((meta) => {
    const { columnIndex, type, value } = meta;
    const decoratingColumns = block.querySelectorAll(`.upper .column:nth-child(${columnIndex})`);
    decoratingColumns.forEach((column) => {
      switch (type) {
        case 'color':
          column.style.setProperty('--column-color', value.startsWith('#') ? value : `var(--${value})`);
          break;
        case 'mobile':
          // value could be either 'hide' or 'slider'
          if (value === 'hide') {
            column.classList.add('hide-mobile');
          }
          if (value === 'slider') {
            column.classList.add('slider-mobile');
          }
          break;

        case 'desktop':
          if (value === 'hide') {
            column.classList.add('hide-desktop');
            const lowerColumn = block.querySelector(`.lower .column:nth-child(${columnIndex})`);
            lowerColumn.classList.add('hide-desktop');
          }
          break;
        default:
          break;
      }
    });
  });

  const sliderColumns = block.querySelectorAll('.upper .column.slider-mobile');
  const columnsSliderCount = sliderColumns.length;

  const mobileColumns = block.querySelectorAll('.upper .column:not(.hide-mobile)');
  const mobileColumnCount = columnsSliderCount ? mobileColumns.length - (sliderColumns.length - 1)
    : mobileColumns.length;
  block.style.setProperty('--columns-mobile-count', mobileColumnCount);

  const desktopColumnCount = block.querySelectorAll('.upper .column:not(.hide-desktop)').length;
  block.style.setProperty('--columns-desktop-count', desktopColumnCount);

  decorateSeparator(lower);

  if (!columnsSliderCount) return;
  const swiper = createTag('div', { class: 'swiper' });
  Array.from(sliderColumns).forEach((column) => {
    const clone = column.cloneNode(true);
    clone.classList.remove('slider-mobile');
    clone.classList.add('swiper-slide');
    swiper.append(clone);
  });
  upper.append(swiper);
}
