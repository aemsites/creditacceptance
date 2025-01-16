import { getMetadata } from '../../scripts/aem.js';
import { loadFragment } from '../fragment/fragment.js';

function slugify(text) {
  if (!text) return '';

  return text.toString().toLowerCase().trim()
    .replace(/\s+/g, '-')
    .replace(/:$/g, '');
}
/**
 * loads and decorates the footer
 * @param {Element} block The footer block element
 */
export default async function decorate(block) {
  // load footer as fragment
  const footerMeta = getMetadata('footer');
  const footerPath = footerMeta ? new URL(footerMeta, window.location).pathname : '/footer';
  const fragment = await loadFragment(footerPath);

  // decorate footer DOM
  block.textContent = '';
  while (fragment.firstElementChild) block.append(fragment.firstElementChild);

  let footerImagesContainer;
  block.querySelectorAll('.default-content-wrapper > p').forEach((p) => {
    if (slugify(p.textContent) === 'footer-images') {
      footerImagesContainer = p.nextElementSibling;
      p.remove();
    }
  });
  if (footerImagesContainer) {
    footerImagesContainer.className = 'footer-images-container';
  }
}
