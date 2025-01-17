// Shared block decorate functions

/**
 * Adjusts the focal point of an image within a picture element
 * based on the provided child element's content.
 *
 * @param {HTMLElement} pic - The picture element containing the image.
 * @param {HTMLElement} child - The child element containing focal point data.
 * @param {boolean} removeChild - Flag indicating whether to remove the child element
 * or its text nodes after processing.
 */
export function handleFocalpoint(pic, child, removeChild) {
  const image = pic.querySelector('img');
  if (!child || !image) return;
  let text = '';
  if (child.childElementCount === 2) {
    const dataElement = child.querySelectorAll('p')[1];
    text = dataElement?.textContent;
    if (removeChild) dataElement?.remove();
  } else if (child.textContent) {
    text = child.textContent;
    const childData = child.childNodes;
    if (removeChild) childData.forEach((c) => c.nodeType === Node.TEXT_NODE && c.remove());
  }
  if (!text) return;
  const directions = text.trim().toLowerCase().split(',');
  const [x, y = ''] = directions;
  image.style.objectPosition = `${x} ${y}`;
}

/**
 * Decorates a block background by adding classes and handling focal points for images or videos.
 *
 * @param {HTMLElement} block - The block element to decorate.
 * @param {HTMLElement} node - The node containing child elements to be processed.
 * @param {Object} [options] - Optional settings.
 * @param {boolean} [options.useHandleFocalpoint=false] - Whether to handle focal points for images.
 * @param {string} [options.className='background'] - The class name to add to the node.
 * @returns {Promise<void>} A promise that resolves when the decoration is complete.
 */
export async function decorateBlockBg(block, node, { useHandleFocalpoint = false, className = 'background' } = {}) {
  const childCount = node.childElementCount;
  if (node.querySelector('img, video') || childCount > 1) {
    node.classList.add(className);
    const twoVP = [['mobile-only'], ['tablet-only', 'desktop-only']];
    const threeVP = [['mobile-only'], ['tablet-only'], ['desktop-only']];
    const viewports = childCount === 2 ? twoVP : threeVP;
    [...node.children].forEach((child, i) => {
      if (childCount > 1) child.classList.add(...viewports[i]);
      const pic = child.querySelector('picture');
      if (useHandleFocalpoint && pic
        && (child.childElementCount === 2 || child.textContent?.trim())) {
        handleFocalpoint(pic, child, true);
      }
    });
  } else {
    block.style.background = node.textContent;
    node.remove();
  }
}
