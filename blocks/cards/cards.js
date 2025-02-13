import { createOptimizedPicture, loadCSS } from '../../scripts/aem.js';
import { createTag } from '../../libs/utils/utils.js';
import { initSlider } from '../../libs/utils/decorate.js';

const isDesktop = window.matchMedia('(min-width: 960px)');

export function isDateValid(dateStr) {
  if (!dateStr || typeof dateStr !== 'string') return false;

  // eslint-disable-next-line no-restricted-globals
  return !isNaN(new Date(dateStr));
}

function decorateDate(data) {
  if (!data) return;

  if (Array.from(data)) {
    data.forEach((p) => {
      if (isDateValid(p.textContent)) {
        p.classList.add('date');
        p.closest('.cards-card-body')?.classList.add('has-date');
      }
    });
  }
}

function addMobileSlider(block) {
  const isSlider = block.classList.contains('slider-mobile');
  if (isSlider && !isDesktop.matches) {
    const sliderContainer = block.querySelector('ul');
    const slides = sliderContainer.querySelectorAll(':scope > li');
    loadCSS(`${window.hlx.codeBasePath}/blocks/slider/slider.css`);
    initSlider(block, slides, sliderContainer);
  }
}

function isDateValid(dateStr) {
  if (!dateStr || typeof dateStr !== 'string') return false;

  // eslint-disable-next-line no-restricted-globals
  return !isNaN(new Date(dateStr));
}

function decorateDate(data) {
  if (!data) return;

  if (Array.from(data)) {
    data.forEach((p) => {
      if (isDateValid(p.textContent)) {
        p.classList.add('date');
      }
    });
  }
}

export default function decorate(block) {
  const isAnimated = block.classList.contains('animation') && !block.classList.contains('animation-none');
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

        const cardTitle = div.querySelector('h4, h5, h6');
        cardTitle?.classList.add('card-title');

        const paragraphs = div.querySelectorAll('p');
        decorateDate(paragraphs);

        const link = div.querySelector('a');
        if (link) {
          div.classList.add('ellipsed');
        }
      }
      const icon = div.querySelector('.icon img');
      if (icon) {
        const maskedDiv = createTag('div', { class: 'icon-masked', style: `mask-image :url(${icon.src})` });
        icon.parentNode.parentNode.replaceWith(maskedDiv);
      }
    });
    if (heading) li.append(heading);
    li.append(cardWrapper);
    ul.append(li);
  });

  ul.querySelectorAll('picture > img').forEach((img) => {
    const optimizedPicture = createOptimizedPicture(img.src, img.alt, false, [{ width: '750' }]);
    const imgParentPicture = img.closest('picture');
    imgParentPicture.replaceWith(optimizedPicture);
    if (!imgParentPicture.classList.length) return;
    optimizedPicture.classList.add(...imgParentPicture.classList);
  });
  block.textContent = '';
  block.append(ul);

  if (block.classList.contains('careers')) {
    block.classList.add('rounded');
  }

  addMobileSlider(block);
}
