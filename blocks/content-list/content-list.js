import { createTag } from '../../libs/utils/utils.js';

function decorateIconList(block) {
  const headers = block.querySelectorAll('h1, h2, h3, h4, h5, h6');
  if (!headers) return;
  const grid = createTag('grid', { class: 'grid' });
  headers.forEach((hTag) => {
    const outerDiv = hTag.closest('div');
    const wrapper = createTag('div', { class: 'wrapper' });
    const nextP = hTag.nextElementSibling;
    outerDiv.insertBefore(wrapper, hTag);
    wrapper.appendChild(hTag);
    wrapper.appendChild(nextP);
    grid.appendChild(wrapper);
  });
  const blockContainer = block.querySelector(':scope > div');
  blockContainer.prepend(grid);
}

export default function decorate(block) {
  if (block.classList.contains('icons')) {
    decorateIconList(block);
  }
}
