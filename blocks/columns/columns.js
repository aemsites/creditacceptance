import { createTag } from '../../libs/utils/utils.js';

function decorateFlexRows(block) {
  const rows = block.querySelectorAll(':scope > div');
  const colClass = [...block.classList].find((cls) => cls.startsWith('col-'));
  if (!colClass) return;
  const flexBasis = colClass?.match(/-(\d+)$/);
  const flexBasisVal = flexBasis ? parseInt(flexBasis[1], 10) : 'auto';
  const colIndex = colClass?.match(/col-(\d+)-/);
  const colIndexVal = colIndex ? parseInt(colIndex[1], 10) - 1 : 0;
  rows.forEach((row) => {
    const cols = [...row.children];
    if (flexBasis && colIndex) {
      cols[colIndexVal].style.setProperty('flex', `0 1 ${flexBasisVal}%`);
    }
  });
}

// Check for columns with CTA icons
function isIconsCol(col) {
  let parent;
  if (col.children.length === 1 && col.children[0].tagName === 'P') {
    [parent] = col.children;
  } else {
    parent = col;
  }
  const children = [...parent.children];
  const hasOnlyIcons = children.every((child) => {
    if (child.tagName === 'A') {
      const icon = child.querySelector('span.icon');
      return icon !== null;
    }
    return false;
  });
  if (hasOnlyIcons) {
    parent.classList.add('cta-icons');
  }
}

function decorateColumnsCalculation(block) {
  const rows = [...block.children];
  rows.forEach((row) => {
    const cols = [...row.children];
    const separator = createTag('div', { class: 'separator' });
    const firstGroup = createTag('div', { class: 'first-group' }, [cols[0], cols[1], cols[2]]);
    const secondGroup = createTag('div', { class: 'second-group' }, [cols[3], cols[4]]);
    row.append(firstGroup, separator, secondGroup);
  });
}

function decorateColIconGroup(col) {
  const colIcons = col.querySelectorAll('.icon');
  if (!colIcons) return;
  colIcons.forEach((icon) => {
    const parent = icon.parentElement;
    if (parent) {
      const parentTagName = parent.tagName.toLowerCase();
      if (parentTagName === 'p' || parentTagName === 'h1' || parentTagName === 'h2' || parentTagName === 'h3' || parentTagName === 'h4' || parentTagName === 'h5' || parentTagName === 'h6') {
        parent.classList.add('icon-elm');
      }
    }
  });
}

function applyStatsClasses(block) {
  block.classList.add('stats');
}

function getMediaHeightValue(el, fromAttribute = false) {
  if (fromAttribute) {
    const match = [...el.classList].find((cls) => cls.startsWith('media-height-'))?.match(/^media-height-(\d+)$/);
    return match ? parseInt(match[1], 10) : null;
  }
  const mediaImg = el.querySelector('.media-count-1 img');
  return mediaImg?.height || null;
}

function setMediaHeight(mediaContainer, height) {
  if (height !== null && window.matchMedia('(min-width: 960px)').matches) {
    mediaContainer.style.setProperty('height', `${height}px`);
  } else {
    mediaContainer.style.removeProperty('height');
  }
}

function handleMediaBlock(block) {
  const mediaImg = block.querySelector('.media-count-1 img');
  const mediaContainer = block.querySelector('.media');
  const isMediaContain = block.classList.contains('media-contain');
  const useAttributeHeight = !isMediaContain; // Only use attribute height if NOT media-contain

  if (!mediaImg || !mediaContainer) return;

  const initialHeight = getMediaHeightValue(block, useAttributeHeight);
  setMediaHeight(mediaContainer, initialHeight);

  const observer = new ResizeObserver(() => {
    observer.disconnect();
    const resizedHeight = getMediaHeightValue(block); // Get natural image height after resize
    setMediaHeight(mediaContainer, resizedHeight);
  });

  if (mediaImg.complete) {
    observer.observe(mediaContainer);
  } else {
    mediaImg.onload = () => {
      observer.observe(mediaContainer);
    };
  }
}

function initializeMediaHeights() {
  const mediaUnbound = document.querySelectorAll('.media-unbound');
  mediaUnbound.forEach(handleMediaBlock);
}

// Initialize media heights after the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  requestAnimationFrame(initializeMediaHeights);
});

// Apply height again on resize (consider debouncing/throttling for performance)
window.addEventListener('resize', () => {
  requestAnimationFrame(initializeMediaHeights); // Re-apply on resize
});

export default function decorate(block) {
  const rows = [...block.children];
  // setup media columns
  rows.forEach((row) => {
    const cols = [...row.children];
    block.classList.add(`columns-${cols.length}-cols`, 'ca-list');
    cols.forEach((col, i) => {
      if (block.classList.contains('cta-icons')) {
        isIconsCol(col);
      }
      const hasImg = col.querySelector('picture');
      if (hasImg) {
        const isSingleTagPicture = (col.children.length === 1 && col.children[0].tagName === 'PICTURE');
        if (isSingleTagPicture) {
          col.classList.add('media-count-1', 'media');
          if (i === 0) col.classList.add('media-left');
        } else {
          col.classList.add('media-copy');
        }
      } else {
        col.classList.add('copy');
      }
      decorateColIconGroup(col);
    });
  });
  // flex basis
  decorateFlexRows(block);
  if (block.classList.contains('calculation')) decorateColumnsCalculation(block);
  if ([...block.classList].some((cls) => cls.startsWith('stats-'))) applyStatsClasses(block);
  if (block.classList.contains('media-unbound')) handleMediaBlock(block);
}
