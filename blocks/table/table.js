/*
 * Table Block
 * Recreate a table
 * https://www.hlx.live/developer/block-collection/table
 */

function buildCell(rowIndex) {
  const cell = rowIndex ? document.createElement('td') : document.createElement('th');
  if (!rowIndex) cell.setAttribute('scope', 'col');
  return cell;
}

function setBorderColor(cls, block) {
  const color = cls.replace('border-color-', '');
  const hexRegex = /^#?([0-9a-f]{3}){1,2}$/i;
  const isHexColor = hexRegex.test(color);
  const formattedColor = isHexColor && !color.startsWith('#') ? `#${color}` : color;
  const isBordered = block.classList.contains('bordered');
  const colorProperty = isHexColor ? formattedColor : `var(--${color})`;
  const rows = block.querySelectorAll('tr');
  rows.forEach((row) => {
    if (isBordered) {
      const cells = row.children;
      Array.from(cells).forEach((cell) => {
        cell.style.borderColor = colorProperty;
      });

      if (row.parentNode.tagName === 'THEAD') {
        row.style.borderBottomColor = colorProperty;
        row.style.borderTopColor = colorProperty;
      }
      return;
    }

    row.style.borderTopColor = colorProperty;
    row.style.borderBottomColor = colorProperty;
  });
  block.style.setProperty('--border-color', colorProperty);
}

export default async function decorate(block) {
  const table = document.createElement('table');
  const thead = document.createElement('thead');
  const tbody = document.createElement('tbody');

  const header = !block.classList.contains('no-header');
  if (header) table.append(thead);
  table.append(tbody);

  [...block.children].forEach((child, i) => {
    const row = document.createElement('tr');
    if (header && i === 0) thead.append(row);
    else tbody.append(row);
    [...child.children].forEach((col) => {
      const cell = buildCell(header ? i : i + 1);
      cell.innerHTML = col.innerHTML;
      row.append(cell);
    });
  });
  block.innerHTML = '';
  block.append(table);

  const borderColorClass = [...block.classList].find((cls) => cls.startsWith('border-color-'));
  if (borderColorClass) {
    setBorderColor(borderColorClass, block);
  }

  const borderStyleClass = [...block.classList].find((cls) => cls.startsWith('border-style-'));
  if (borderStyleClass) {
    const style = borderStyleClass.replace('border-style-', '');
    block.style.setProperty('--border-style', style);
    block.classList.add('border-styled');
  }
}
