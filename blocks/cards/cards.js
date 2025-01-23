import { createOptimizedPicture } from '../../scripts/aem.js';
import { createTag } from '../../libs/utils/utils.js';

export default function decorate(block) {
  const isAnimated = block.classList.contains('animation');
  const ul = createTag('ul');
  [...block.children].forEach((row) => {
    const li = createTag('li');
    if (isAnimated) li.classList.add('animation-scale');
    const cardWrapper = createTag('div', { class: 'card-wrapper' });
    while (row.firstElementChild) cardWrapper.append(row.firstElementChild);
    let heading = null;
    [...cardWrapper.children].forEach((div) => {
      if (div.children.length === 1 && div.querySelector('picture')) {
        div.className = 'cards-card-image';
      } else {
        div.className = 'cards-card-body';
        const h3 = div.querySelector('h3');
        if (h3) {
          heading = h3;
          div.removeChild(h3);
        }
      }
      const icon = div.querySelector('.icon img');
      if (icon) {
        const maskedDiv = createTag('div', { class: 'icon-masked', style: `mask:url(${icon.src}) no-repeat center` });
        icon.parentNode.parentNode.replaceWith(maskedDiv);
      }
    });
    if (heading) li.append(heading);
    li.append(cardWrapper);
    ul.append(li);
  });
  ul.querySelectorAll('picture > img').forEach((img) => img.closest('picture').replaceWith(createOptimizedPicture(img.src, img.alt, false, [{ width: '750' }])));
  block.textContent = '';
  block.append(ul);
}
