// Shared block decorate functions

/**
 * Checks if a hex color value is dark or light
 *
 * @param {string} color - Hex color value
 */
export function isDarkHexColor(color) {
  const hexColor = (color.charAt(0) === '#') ? color.substring(1, 7) : color;
  const r = parseInt(hexColor.substring(0, 2), 16); // hexToR
  const g = parseInt(hexColor.substring(2, 4), 16); // hexToG
  const b = parseInt(hexColor.substring(4, 6), 16); // hexToB
  return ((r * 0.299) + (g * 0.587) + (b * 0.114)) <= 186;
}

/**
 * Checks if a given URL points to an image file.
 *
 * @param {string} url - The URL to check.
 * @returns {boolean} - Returns `true` if the URL points to an image file, otherwise `false`.
 */
export function isImagePath(url) {
  if (!url) return false;
  const urlWithoutParams = url.split('?')[0];
  return /\.(jpg|jpeg|png|gif|bmp|svg|webp)$/i.test(urlWithoutParams);
}

/**
 * Decorates buttons within a given element by adding
 * appropriate classes based on their parent elements.
 *
 * The function searches for buttons within the provided element that
 * match the selectors 'em a', 'strong a', and 'p > a strong'.
 * It then assigns classes to these buttons based on their parent elements
 * and any custom classes found in the button text.
 *
 * @param {HTMLElement} el - container element
 */
export function decorateButtons(el) {
  const buttons = el.querySelectorAll('em a, strong a, p > a strong');
  if (buttons.length === 0) return;
  const buttonTypeMap = { STRONG: 'primary', EM: 'secondary', A: 'link' };
  buttons.forEach((button) => {
    let target = button;
    const parent = button.parentElement;
    const buttonType = buttonTypeMap[parent.nodeName] || 'primary';
    if (button.nodeName === 'STRONG') {
      target = parent;
    } else {
      parent.insertAdjacentElement('afterend', button);
      parent.remove();
    }
    target.classList.add('button', buttonType);
    const customClasses = target.textContent && [...target.textContent.matchAll(/#_button-([a-zA-Z-]+)/g)];
    if (customClasses) {
      customClasses.forEach((match) => {
        target.textContent = target.textContent.replace(match[0], '');
        target.classList.add(match[1]);
      });
    }
    button.parentElement?.classList.add('button-container');
  });
}

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
