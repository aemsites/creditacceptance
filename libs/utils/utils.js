// Common Utils

import ffetch from '../../scripts/ffetch.js';

let palettePromise;
function fetchPalette() {
  if (!palettePromise) {
    palettePromise = new Promise((resolve, reject) => {
      (async () => {
        try {
          const paletteJson = await ffetch('/tools/taxonomy.json').sheet('palette').all();
          resolve(paletteJson);
        } catch (e) {
          reject(e);
        }
      })();
    });
  }
  return palettePromise;
}

export async function getPalette() {
  return fetchPalette();
}

export async function loadPalette() {
  const palette = await getPalette();
  if (!palette) return;
  palette.forEach((color) => {
    window.CSS.registerProperty({
      name: `--${color['brand-name']}`,
      syntax: '<color> | <image>', // Any valid color or image(URL or a color gradient) value.
      inherits: true,
      initialValue: `${color['color-value']}`,
    });
  });
  document.dispatchEvent(new CustomEvent('paletteLoaded', { detail: { palette } }));
}

export function isInTextNode(node) {
  return node.parentElement.firstChild.nodeType === Node.TEXT_NODE;
}

export function createTag(tag, attributes, html, options = {}) {
  const el = document.createElement(tag);
  if (html) {
    if (html instanceof HTMLElement
      || html instanceof SVGElement
      || html instanceof DocumentFragment) {
      el.append(html);
    } else if (Array.isArray(html)) {
      el.append(...html);
    } else {
      el.insertAdjacentHTML('beforeend', html);
    }
  }
  if (attributes) {
    Object.entries(attributes).forEach(([key, val]) => {
      el.setAttribute(key, val);
    });
  }
  options.parent?.append(el);
  return el;
}

export function addStyles(path) {
  const link = document.createElement('link');
  link.setAttribute('rel', 'stylesheet');
  link.href = path;
  return link;
}

export function isProductionEnvironment() {
  return (/main--.*\.aem\.live$/.test(window.location.host) || window.location.host.endsWith('creditacceptance.com'));
}
