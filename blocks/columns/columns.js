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

function getMediaHeightValue(e) {
  const match = [...e.classList].find((cls) => cls.startsWith('media-height-'))?.match(/^media-height-(\d+)$/);
  return match ? parseInt(match[1], 10) : null;
}

function applyMediaHeight(block) {
  const heightValue = getMediaHeightValue(block);
  if (!heightValue) return;
  const media = block.querySelector('.media');
  const isDesktop = window.matchMedia('(min-width: 960px)');
  if (isDesktop.matches) {
    media.style.setProperty('height', `${heightValue}px`);
  } else {
    media.style.removeProperty('height');
  }
}

// Call applyMediaHeight for all elements with the media-unbound class on initial load
window.addEventListener('resize', () => {
  const mediaUnboundBlocks = document.querySelectorAll('.media-unbound');
  mediaUnboundBlocks.forEach((block) => { applyMediaHeight(block); });
});

export default function decorate(block) {
  const cols = [...block.firstElementChild.children];
  block.classList.add(`columns-${cols.length}-cols`, 'ca-list');
  // setup media columns
  cols.forEach((col, i) => {
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
  });
  // flex basis
  decorateFlexRows(block);
  if (block.classList.contains('media-unbound')) applyMediaHeight(block);
}
