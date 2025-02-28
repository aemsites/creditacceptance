import {
  buildBlock, decorateIcons, getMetadata, loadBlock,
} from '../../scripts/aem.js';
import { createTag } from '../../libs/utils/utils.js';
import { decorateButtons } from '../../libs/utils/decorate.js';
import { createOptimizedPicture } from '../../scripts/scripts.js';

function getKeyValuePairs(block) {
  const { children } = block;
  const links = [];
  let dateAllowed = true;
  let ctaLabel = 'Read More >';

  Array.from(children).forEach((child) => {
    const key = child.children[0].textContent?.toLowerCase().replace(/\s/g, '-');

    let value;
    switch (key) {
      case 'path':
        value = child.children[1].querySelectorAll('a');
        value.forEach((link) => links.push(new URL(link.href)?.pathname));
        break;
      case 'date':
        value = child.children[1].textContent?.toLowerCase();
        dateAllowed = value === 'true' || value === 'yes';
        break;

      case 'cta-label':
        ctaLabel = child.children[1].textContent?.trim();
        break;

      default:
        break;
    }
  });

  return { links, dateAllowed, ctaLabel };
}

export default async function init(block) {
  const { links, dateAllowed, ctaLabel } = getKeyValuePairs(block);

  const cardBlock = [];

  const promises = Array.from(links).map(async (link, index) => {
    const response = await fetch(link);
    if (!response.ok) return;

    const html = await response.text();
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');

    const title = getMetadata('og:title', doc);
    const description = getMetadata('og:description', doc);
    const image = getMetadata('mobileimage', doc) || getMetadata('og:image', doc);
    const imageAlt = getMetadata('og:image:alt', doc) || title;

    const imageElement = createOptimizedPicture(image, imageAlt);

    const firstCol = createTag('div', null, [imageElement]);
    const heading = createTag('h4', { class: 'card-title' }, [title]);
    const descriptionElement = createTag('p', { class: 'card-description' }, description);

    const linkElement = createTag('a', { href: link }, ctaLabel);
    const secondaryLink = createTag('em', { class: 'button-container' }, linkElement);
    const linkWrapper = createTag('p', null, secondaryLink);

    const secondCol = createTag('div', null, [heading, descriptionElement, linkWrapper]);

    const date = getMetadata('date', doc);
    if (date && dateAllowed) {
      const formattedDate = new Date(date).toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: '2-digit',
        timeZone: 'UTC',
      }).replace(',', '');
      const dateElement = createTag('p', { class: 'card-date' }, formattedDate);
      secondCol.prepend(dateElement);
    }

    cardBlock[index] = [firstCol, secondCol];
  });

  await Promise.all(promises);

  const card = buildBlock('cards', cardBlock);
  card.dataset.blockName = 'cards';
  decorateButtons(card);
  decorateIcons(card);

  card.classList.add('rounded', 'block', 'animation', 'three-up');
  const loadedCard = await loadBlock(card);
  block.innerHTML = loadedCard.innerHTML;
  block.classList.add(...loadedCard.classList);
}
