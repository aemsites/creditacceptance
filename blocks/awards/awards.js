import { createOptimizedPicture } from '../../scripts/aem.js';

export default function decorate(block) {
  const ul = document.createElement('ul');
  [...block.children].forEach((row) => {
    const parser = new DOMParser();
    const doc = parser.parseFromString(row.innerHTML, 'text/html');
    const link = doc.querySelector('a');
    if (!link) return;
    const a = document.createElement('a');
    a.href = link.href;
    a.target = '_blank';
    const li = document.createElement('li');
    li.className = 'animation-scale';
    li.append(a);
    const wrapper = document.createElement('div');
    wrapper.className = 'awards-award-inner';
    a.append(wrapper);
    while (row.firstElementChild) {
      wrapper.append(row.firstElementChild);
    }
    [...wrapper.children].forEach((div) => {
      if (div.children.length === 1 && div.querySelector('picture')) {
        div.className = 'awards-award-image';
      } else {
        div.className = 'awards-award-body';
        const nestedLink = div.querySelector('a');
        if (nestedLink) {
          nestedLink.parentNode.innerHTML = nestedLink.innerText;
        }
      }
    });
    ul.append(li);
  });
  ul.querySelectorAll('picture > img').forEach((img) => {
    const optimizedPicture = createOptimizedPicture(img.src, img.alt, false, [{ width: '127' }]);
    img.closest('picture').replaceWith(optimizedPicture);
  });
  block.textContent = '';
  block.append(ul);
}
