import {
  buildBlock, createOptimizedPicture, loadBlock, decorateIcons, decorateButtons,
} from '../../scripts/aem.js';
import { createTag } from '../../libs/utils/utils.js';
import { formatCardLocaleDate } from './feed-helper.js';

let queryIndexEndpoint;
let pager = 1;
let limit = 7;
let feedItems = [];

let selectedCategory;
const categoryMap = {};
let categories = [];

let featuredCard = 2;
let dateAllowed = true;

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

function updateFeedItems(block, end = pager * limit) {
  feedItems = categoryMap[selectedCategory].slice(0, end);

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
  const end = featuredCard ? (pager * (limit + 1)) - 1 : pager * limit;
  updateFeedItems(block, end);
}

function setFeaturedCard(block) {
  if (featuredCard === 0) return;
  block.querySelector(`:scope > ul > li:nth-child(${featuredCard})`).classList.add('featured-card');
}

async function buildCards(block) {
  const cardBlock = [];

  feedItems.forEach((item, index) => {
    const imageElement = createOptimizedPicture(item.mobileImage, item.imageAlt);
    const tabletImageElement = createOptimizedPicture(item.tabletImage, item.imageAlt);
    imageElement.className = 'card-image-all';
    tabletImageElement.className = 'card-image-tablet';

    const firstCol = createTag('div', null, [imageElement, tabletImageElement]);

    const heading = createTag('p', { class: 'card-title' }, `<strong>${item.title}</strong>`);
    const description = createTag('p', { class: 'card-description' }, item.description);

    const link = createTag('a', { href: item.path }, 'Read >');
    const secondaryLink = createTag('em', { class: 'button-container' }, link);
    const linkWrapper = createTag('p', null, secondaryLink);

    const secondCol = createTag('div', null, [heading, description, linkWrapper]);

    if (dateAllowed) {
      const date = item.date ?? item.lastModified;
      const dateElement = createTag('p', { class: 'card-date' }, formatCardLocaleDate(date));
      secondCol.prepend(dateElement);
    }

    cardBlock[index] = [firstCol, secondCol];
  });

  const card = buildBlock('cards', cardBlock);
  card.dataset.blockName = 'cards';
  decorateButtons(card);
  decorateIcons(card);
  const loadedCard = await loadBlock(card);
  loadedCard.classList.add('rounded', 'block', 'gap-sm');
  block.innerHTML = loadedCard.innerHTML;
  block.classList.add(...loadedCard.classList);

  setFeaturedCard(block);
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
      selectedCategory = category;
      updateFeedItems(block);
      await buildCards(block);

      listItem.classList.add('active');
      listItem.parentElement.childNodes.forEach((item) => {
        if (item !== listItem) {
          item.classList.remove('active');
        }
      });
    });
    return listItem;
  });

  listItems[0].classList.add('active');
  const ul = createTag('ul', { class: 'feed-tabs-list-desktop', role: 'tablist' }, listItems);

  const select = createTag('select', { class: 'feed-tabs-select-mobile' }, categories.map((category) => {
    const option = createTag('option', { value: category }, category);
    return option;
  }));

  select.addEventListener('change', async (event) => {
    pager = 1;
    selectedCategory = event.target.value;
    updateFeedItems(block);
    await buildCards(block);
  });

  const tabs = createTag('div', { class: 'feed-tabs' }, [ul, select]);

  const section = createTag('div', { class: 'section feed-tabs-wrapper', 'data-section-status': 'loaded' }, tabs);
  const newSectionOuter = createTag('div', { class: 'section-outer feed-tabs', 'data-section-status': 'loaded' }, section);
  const sectionOuter = block.closest('.section-outer');
  sectionOuter.insertAdjacentElement('beforebegin', newSectionOuter);
}

export default async function init(block) {
  const { children } = block;
  Array.from(children).forEach((child) => {
    const key = child.children[0].textContent?.toLowerCase();
    const value = child.children[1].textContent?.toLowerCase();

    switch (key) {
      case 'path':
        queryIndexEndpoint = new URL(value)?.pathname;
        break;
      case 'limit':
        limit = parseInt(value, 10);
        break;
      case 'featured-card':
        featuredCard = parseInt(value, 10);
        break;
      case 'date':
        dateAllowed = value === 'true' || value === 'yes';
        break;
      default:
        break;
    }
  });

  if (!queryIndexEndpoint) return;

  await fetchData();
  await buildCategory(block);
  updateFeedItems(block);
  await buildCards(block);
  buildPager(block);
}
