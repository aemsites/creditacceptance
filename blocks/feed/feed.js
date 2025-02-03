import {
  buildBlock, createOptimizedPicture, loadBlock, decorateIcons, decorateButtons,
} from '../../scripts/aem.js';
import { createTag } from '../../libs/utils/utils.js';
import { formatCardLocaleDate } from './feed-helper.js';

let queryIndexEndpoint;
let pager = 1;
let limit = 8;
let feedItems = [];

let selectedCategory;
const categoryMap = {};
let categories = [];

async function fetchData() {
  const response = await fetch(queryIndexEndpoint);
  if (!response.ok) return;
  const data = await response.json();

  data.data.forEach((dataItem) => {
    if (dataItem.category) {
      if (!categoryMap[dataItem.category]) {
        categoryMap[dataItem.category] = [];
      }
      categoryMap[dataItem.category].push(dataItem);
    }
  });
}

function updateFeedItems(block) {
  feedItems = categoryMap[selectedCategory].slice(0, pager * limit);

  const loadMoreButtonElement = block.closest('.section').querySelector('.load-more');
  if (!loadMoreButtonElement) return;

  if (feedItems.length >= categoryMap[selectedCategory].length) {
    loadMoreButtonElement.style.display = 'none';
  } else {
    loadMoreButtonElement.style.display = 'block';
  }
}

async function loadMoreFeedItems(block) {
  pager += 1;
  updateFeedItems(block);
}

async function buildCards(block) {
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

    const date = item.date ?? item.lastModified;
    const dateElement = createTag('p', { class: 'card-date' }, formatCardLocaleDate(date));

    const heading = createTag('p', { class: 'card-title' }, `<strong>${item.title}</strong>`);
    const description = createTag('p', { class: 'card-description' }, item.description);

    const link = createTag('a', { href: item.path }, 'Read >');
    const secondaryLink = createTag('em', { class: 'button-container' }, link);
    const linkWrapper = createTag('p', null, secondaryLink);

    const secondCol = createTag('div', null, [dateElement, heading, description, linkWrapper]);
    cardBlock[index] = [firstCol, secondCol];
  });

  const card = buildBlock('cards', cardBlock);
  card.dataset.blockName = 'cards';
  decorateButtons(card);
  decorateIcons(card);
  const loadedCard = await loadBlock(card);
  loadedCard.classList.add('rounded', 'block');
  loadedCard.classList.add()
  block.innerHTML = loadedCard.innerHTML;
  block.classList.add(...loadedCard.classList);
}

function buildPager(block) {
  const loadMoreButton = createTag('button', { class: 'load-more' }, 'Load More');
  loadMoreButton.addEventListener('click', async () => {
    await loadMoreFeedItems(block);
    await buildCards(block);
  });
  const loadMoreButtonWrapper = createTag('div', { class: 'load-more-wrapper' }, loadMoreButton);
  block.insertAdjacentElement('afterend', loadMoreButtonWrapper);
}

async function buildCategory(block) {
  categories = Object.keys(categoryMap);

  [selectedCategory] = categories;

  const listItems = categories.map((category) => {
    const button = createTag('button', { class: 'feed-tab' }, category);
    const listItem = createTag('li', { class: 'feed-tab-item', role: 'tab' }, button);
    button.addEventListener('click', async () => {
      pager = 1;
      limit = 8;
      selectedCategory = category;
      updateFeedItems(block);
      await buildCards(block);

      // when clicked add active class to the selected tab and remove from the rest
      listItem.classList.add('active');
      listItem.parentElement.childNodes.forEach((item) => {
        if (item !== listItem) {
          item.classList.remove('active');
        }
      });
    });
    return listItem;
  });

  // add active class to the first tab at first load
  listItems[0].classList.add('active');
  const ul = createTag('ul', { class: 'feed-tabs-list-desktop', role: 'tablist' }, listItems);

  // mobile tabs as select
  const select = createTag('select', { class: 'feed-tabs-select-mobile' }, categories.map((category) => {
    const option = createTag('option', { value: category.title }, category.title);
    return option;
  }));

  select.addEventListener('change', async (event) => {
    pager = 1;
    limit = 8;
    selectedCategory = categoryMap.find((category) => category.title === event.target.value);
    updateFeedItems(block);
    await buildCards(block);
  });

  const tabs = createTag('div', { class: 'feed-tabs' }, [ul, select]);

  const section = createTag('div', { class: 'section feed-tabs-wrapper', 'data-section-status': 'loaded' }, tabs);
  const sectionOuter = createTag('div', { class: 'section-outer feed-tabs', 'data-section-status': 'loaded' }, section);
  block.closest('.section-outer').insertAdjacentElement('beforebegin', sectionOuter);
}

export default async function init(block) {
  const link = block.querySelector('a');
  if (!link) return;
  queryIndexEndpoint = link.href;

  if (!queryIndexEndpoint) return;

  await fetchData();
  await buildCategory(block);
  updateFeedItems(block);
  await buildCards(block);
  buildPager(block);
}
