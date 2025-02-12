import { handleFocalpoint, initSlider } from '../../libs/utils/decorate.js';
import { loadCSS } from '../../scripts/aem.js';

const isDesktop = window.matchMedia('(min-width: 960px)');

function decorateCard(block, card) {
  const cols = card.querySelectorAll(':scope > div');
  const foreground = cols[cols.length - 1];
  const background = cols.length > 1 ? cols[0] : null;
  if (background) {
    background.classList.add('image');
    block.classList.add('has-bg');
    const bgPic = background.querySelector('picture');
    const focalPoint = background.querySelector('p + p');
    if (focalPoint) handleFocalpoint(bgPic, focalPoint, true);
  }
  foreground.classList.add('copy');
}

export default function decorate(block) {
  const rows = block.querySelectorAll(':scope > div');
  rows.forEach((card, i) => {
    card.classList.add(`card-${i}`, 'card');
    decorateCard(block, card);
  });
  if (block.classList.contains('slider-mobile') && !isDesktop.matches) {
    loadCSS(`${window.hlx.codeBasePath}/blocks/slider/slider.css`);
    initSlider(block, rows);
  }
}
