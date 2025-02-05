import ffetch from '../../scripts/ffetch.js';
import {
  buildBlock, createOptimizedPicture, decorateIcons, loadBlock,
} from '../../scripts/aem.js';
import { createTag } from '../../libs/utils/utils.js';
import { decorateButtons } from '../../libs/utils/decorate.js';

function getKeyValuePairs(block) {
  const { children } = block;
  let link;
  const people = [];
  let limit = 3;
  Array.from(children).forEach((child) => {
    const key = child.children[0].textContent?.toLowerCase();

    let value;
    switch (key) {
      case 'path':
        value = child.children[1].querySelector('a');
        link = value;
        break;

      case 'include':
        value = child.children[1].textContent?.split(',');
        value.forEach((person) => people.push(person.trim().toLowerCase()));
        break;

      case 'limit':
        value = child.children[1].textContent?.trim();
        limit = parseInt(value, 10);
        break;
      default:
        break;
    }
  });

  return { link, people, limit };
}

async function decorateCards(reviews, block) {
  const cardBlock = [];

  reviews.forEach((item, index) => {
    const {
      name, address, image, review, url,
    } = item;
    const imageElement = createOptimizedPicture(image, name);
    imageElement.classList.add('card-image-person');

    const firstCol = createTag('div', null, [imageElement]);

    const reviewElement = createTag('p', { class: 'card-description' }, review);
    const nameElement = createTag('p', { class: 'card-person-name' }, name);
    const addressElement = createTag('p', { class: 'card-person-address' }, address);

    const linkElement = createTag('a', { href: url }, 'Read >');
    const secondaryLink = createTag('em', { class: 'button-container' }, linkElement);
    const linkWrapper = createTag('p', null, secondaryLink);

    const secondCol = createTag('div', null, [reviewElement, nameElement, addressElement, linkWrapper]);

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
}

export default async function init(block) {
  const { link, people, limit } = getKeyValuePairs(block);
  const reviews = await ffetch(link.href)
    .filter((row) => {
      if (people.length === 0) return true;

      return people.includes(row.name.toLowerCase());
    })
    .limit(limit)
    .all();

  if (!reviews || !reviews.length) return;

  await decorateCards(reviews, block);
}
