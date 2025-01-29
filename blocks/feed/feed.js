import ffetch from '../../scripts/ffetch.js';
import { buildBlock, createOptimizedPicture, loadBlock } from '../../scripts/aem.js';
import { createTag } from '../../libs/utils/utils.js';

let queryIndexEndpoint;
const placeholderCategory = 'Credit and Financing';
let pager = 1;
let limit = 20;
let feedItems = [];

async function setFeedItems() {
  const items = await ffetch(queryIndexEndpoint)
    .filter((entry) => entry.category === placeholderCategory)
    .limit(pager * limit).all();

  feedItems.push(...items);
}

async function buildCards(block) {
  const a = buildBlock('card', [
    [`col-left`, 'col-right'],
    [`col-left`, 'col-right'],
  ])

  const cardBlock = [];

  feedItems.forEach((item, index) => {
    // const mobileImage = createOptimizedPicture(item.mobileImage, item.imageAlt);
    // const tabletImage = createOptimizedPicture(item.tabletImage, item.imageAlt);
    // const desktopImage = createOptimizedPicture(item.image, item.imageAlt);

    // mobileImage.className = 'card-image-mobile';
    // tabletImage.className = 'card-image-tablet';
    // desktopImage.className = 'card-image-desktop';
    const image = createOptimizedPicture(item.image, item.imageAlt);

    const firstCol = createTag('div', null, [image]);

    const heading = createTag('p', null, item.heading);
    const description = createTag('p', null, item.description);
    const link = createTag('a', { href: item.path }, 'Read >');

    const secondCol = createTag('div', null, [heading, description, link]);
    cardBlock[index] = [firstCol, secondCol];
  });
  block.innerHTML = '';
  const card = buildBlock('cards', cardBlock);
  card.dataset.blockName = 'cards';
  console.log('card', card.cloneNode(true))
  const loadedCard = await loadBlock(card);
  loadedCard.classList.add('rounded');
  block.replaceWith(loadedCard);
  console.log(cardBlock);
}

export default async function init(block) {
  Array.from(block.children).forEach((row) => {
    if (row.firstElementChild?.textContent === 'feed') {
      const link = row.lastElementChild?.querySelector('a');
      if (!link) return;
      queryIndexEndpoint = link.href;
    }
  });

  if (!queryIndexEndpoint) return;

  await setFeedItems();
  buildCards(block);
}
