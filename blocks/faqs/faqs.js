import { createTag } from '../../libs/utils/utils.js';

function fetchResults(section, searchString) {
  const results = [];

  section.querySelectorAll('.accordion-item').forEach((item) => {
    const accordionLabel = item.querySelector('.accordion-item-label')?.lastElementChild.textContent?.toLowerCase();
    const accordionContent = item.querySelector('.accordion-item-body')?.textContent?.toLowerCase();
    if (accordionLabel.includes(searchString) || accordionContent.includes(searchString)) {
      results.push(item);
    }
  });

  return results;
}

function buildSearchResults(results, section) {
  const faqsWrapper = section.querySelector('.faqs-wrapper');

  section.innerHTML = '';
  const accordion = createTag('div', { class: 'accordion faqs block', 'data-block-name': 'accordion' });
  accordion.append(...results);
  const accordionWrapper = createTag('div', { class: 'accordion-wrapper' }, accordion);
  section.append(faqsWrapper, accordionWrapper);
}

function decorateSearch(block) {
  const section = block.closest('.section');
  section.dataset.searched = false;
  const search = section.querySelector('block.search');
  if (search) return;

  const children = Array.from(block.children);
  const label = children[0];
  const button = children[1];
  const result = children[2];

  const labelElement = createTag('label', { class: 'search-label' }, label.lastElementChild.firstElementChild.textContent);
  const inputElement = createTag('input', { class: 'search-input', id: 'search-input', type: 'text' });
  const buttonElement = createTag('button', { class: 'search-button', type: 'submit', value: '' }, button.lastElementChild.firstElementChild.textContent);
  const resultElement = createTag('div', { class: 'search-result' }, result.lastElementChild.firstElementChild.textContent);
  const form = createTag('form', { class: 'search-form' }, [labelElement, inputElement, buttonElement, resultElement]);

  let savedSection;

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    if (section.dataset.searched === 'false') {
      savedSection = section.cloneNode(true);
      section.dataset.searched = true;
    }

    const searchString = inputElement.value;

    const results = fetchResults(section, searchString);
    const count = results.length;
    resultElement.textContent = resultElement.textContent.replace(/{search-string}/, `"${searchString}"`).replace(/{count}/, count);

    buildSearchResults(results, section);
  });

  inputElement.addEventListener('input', (event) => {
    if (event.target.value === '') {
      section.innerHTML = '';
      section.replaceWith(savedSection);
    }
  });

  block.innerHTML = '';
  block.append(form);
}

export default function init(block) {
  if (block.classList.contains('search')) {
    decorateSearch(block);
  }
}
