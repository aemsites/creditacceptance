import { decorateFragmentInBlock } from '../../libs/utils/decorate.js';

// import decorateFragment from '../fragment/fragment.js';

function getMediaHeightValue(e) {
  const match = [...e.classList].find((cls) => cls.startsWith('media-height-'))?.match(/^media-height-(\d+)$/);
  return match ? parseInt(match[1], 10) : null;
}

function applyMediaHeight(block) {
  const heightValue = getMediaHeightValue(block);
  if (!heightValue) return;
  const media = block.querySelector('.media');
  if (window.innerWidth >= 960) {
    media.style.setProperty('height', `${heightValue}px`);
  } else {
    media.removeAttribute('style');
  }
}

// Call applyMediaHeight for all elements with the media-unbound class on initial load
window.addEventListener('resize', () => {
  const mediaUnboundBlocks = document.querySelectorAll('.media-unbound');
  mediaUnboundBlocks.forEach((block) => { applyMediaHeight(block); });
});

export default function decorate(block) {
  const cols = [...block.firstElementChild.children];
  block.classList.add(`columns-${cols.length}-cols`);

  // setup media columns
  cols.forEach((col, i) => {
    if (cols.length === 2) {
      const hasImg = col.querySelector('picture');
      if (hasImg) {
        col.classList.add('media');
        if (i === 0) col.classList.add('media-left');
      } else {
        col.classList.add('copy');
      }
    }
  });
  if (block.classList.contains('media-unbound')) applyMediaHeight(block);
  decorateFragmentInBlock(block);
}
