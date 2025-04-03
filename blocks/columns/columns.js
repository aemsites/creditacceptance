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

function getMediaHeightValue(el, fromAttribute = false) {
  if (fromAttribute) {
    const match = [...el.classList].find((cls) => cls.startsWith('media-height-'))?.match(/^media-height-(\d+)$/);
    return match ? parseInt(match[1], 10) : null;
  }
  const media = el.querySelector('.media-count-1 img');
  return media?.height || null;
}

function applyMediaHeight(block, fromAttribute = false) {
  const heightValue = getMediaHeightValue(block, fromAttribute);
  const media = block.querySelector('.media');
  if (!media) return;
  const isDesktop = window.matchMedia('(min-width: 960px)').matches;
  if (heightValue && isDesktop) {
    media.style.setProperty('height', `${heightValue}px`);
  } else {
    media.style.removeProperty('height');
  }
}

function applyMediaHeightAfterScaling(block) {
  const media = block.querySelector('.media-count-1 img');
  const mediaContainer = block.querySelector('.media');

  if (!media || !mediaContainer) return;

  const observer = new ResizeObserver(() => {
    observer.disconnect();
    setTimeout(() => {
      applyMediaHeight(block, false);
    }, 0);
  });

  if (media.complete) {
    observer.observe(mediaContainer);
  } else {
    media.onload = () => {
      observer.observe(mediaContainer);
    };
  }
}

function initializeMediaHeights() {
  const mediaUnbound = document.querySelectorAll('.media-unbound');
  const mediaUnboundContain = document.querySelectorAll('.media-unbound.media-contain');
  setTimeout(() => {
    mediaUnbound?.forEach((block) => {
      if (block) applyMediaHeight(block, true);
    });
    mediaUnboundContain?.forEach((block) => {
      if (block) applyMediaHeight(block, false);
    });
  }, 0);
}

// Call applyMediaHeight for all elements with the media-unbound class on initial load
window.addEventListener('resize', initializeMediaHeights);

// Initialize media heights immediately
if (document.readyState === 'loading') {
  window.addEventListener('load', initializeMediaHeights);
} else {
  initializeMediaHeights();
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
  if (block.classList.contains('media-unbound')) applyMediaHeightAfterScaling(block);
}
