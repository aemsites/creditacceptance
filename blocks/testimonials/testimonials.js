import ffetch from '../../scripts/ffetch.js';
import {
  buildBlock,
  createOptimizedPicture,
  decorateIcons,
  loadBlock,
  loadCSS,
} from '../../scripts/aem.js';
import { createTag, getRelativePath } from '../../libs/utils/utils.js';
import { decorateButtons, initSlider } from '../../libs/utils/decorate.js';

const isDesktop = window.matchMedia('(min-width: 960px)');

function getKeyValuePairs(block) {
  const { children } = block;
  let link;
  const people = [];
  let limit = 3;
  let url;
  let ctaLabel = 'More >';

  Array.from(children).forEach((child) => {
    const key = child.children[0].textContent?.toLowerCase().replace(/\s/g, '-');
    let value;
    switch (key) {
      case 'path':
        value = child.children[1].querySelector('a');
        link = value;
        break;

      case 'url':
        url = child.children[1].textContent?.trim();
        break;

      case 'include':
        value = child.children[1].textContent?.split(',');
        value.forEach((person) => people.push(person.trim().toLowerCase()));
        break;

      case 'limit':
        value = child.children[1].textContent?.trim();
        limit = parseInt(value, 10);
        break;

      case 'cta-label':
        ctaLabel = child.children[1].textContent?.trim();
        break;

      default:
        break;
    }
  });

  return {
    link, people, limit, url, ctaLabel,
  };
}

async function decorateCards(block, { reviews, url, ctaLabel }) {
  const cardBlock = [];

  reviews.forEach((item, index) => {
    const {
      name, address, image, review, url: rowUrl,
    } = item;

    const imageElement = createOptimizedPicture(image, name);

    const firstCol = createTag('div', null, [imageElement]);

    const reviewElement = createTag('p', { class: 'card-description' }, review);
    const nameElement = createTag('p', { class: 'card-person-name' }, name);

    const addressWithNewLine = address?.replace(/\n/g, '<br>');
    const addressElement = createTag('p', { class: 'card-person-address' }, addressWithNewLine);

    const secondCol = createTag('div', { class: 'card-body-inner-wrapper' }, [reviewElement, nameElement, addressElement]);
    secondCol.classList.add('url-none');

    if (url !== 'false') {
      const linkElement = createTag('a', { href: getRelativePath(rowUrl || url) }, ctaLabel);
      const secondaryLink = createTag('em', { class: 'button-container' }, linkElement);
      const linkWrapper = createTag('p', null, secondaryLink);

      secondCol.classList.remove('url-none');
      secondCol.append(linkWrapper);
    }

    cardBlock[index] = [firstCol, secondCol];
  });

  const card = buildBlock('cards', cardBlock);
  card.dataset.blockName = 'cards';
  decorateButtons(card);
  decorateIcons(card);

  card.classList.add('rounded', 'block', 'animation', 'three-up');
  card.classList.add(...block.classList);
  const loadedCard = await loadBlock(card);

  block.classList.add(...card.classList);
  block.innerHTML = loadedCard.innerHTML;

  const isSlider = block.classList.contains('slider-mobile');
  if (isSlider && !isDesktop.matches) {
    const sliderContainer = block.querySelector('ul');
    const slides = sliderContainer.querySelectorAll(':scope > li');
    loadCSS(`${window.hlx.codeBasePath}/blocks/slider/slider.css`);
    initSlider(block, slides, sliderContainer);
  }
}

function sortPeople(reviews, people) {
  if (!people.length) return;

  reviews.sort((a, b) => {
    const aIndex = people.indexOf(a.name.toLowerCase());
    const bIndex = people.indexOf(b.name.toLowerCase());
    return aIndex - bIndex;
  });
}

export default async function init(block) {
  const {
    link, people, limit, url, ctaLabel,
  } = getKeyValuePairs(block);
  const reviews = await ffetch(link.href)
    .filter((row) => {
      if (people.length === 0) return true;

      return people.includes(row.name.toLowerCase());
    })
    .limit(limit)
    .all();

  if (!reviews || !reviews.length) return;

  sortPeople(reviews, people);
  await decorateCards(block, { reviews, url, ctaLabel });
}
