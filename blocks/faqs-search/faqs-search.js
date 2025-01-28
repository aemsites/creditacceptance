import { createTag } from '../../libs/utils/utils.js';

function fetchResults(section, searchString) {
  const results = [];

  section.querySelectorAll(':scope > .accordion-wrapper .accordion-item').forEach((item) => {
    const accordionLabel = item.querySelector('.accordion-item-label')?.lastElementChild.textContent?.toLowerCase();
    const accordionContent = item.querySelector('.accordion-item-body')?.textContent?.toLowerCase();

    if (accordionLabel.includes(searchString) || accordionContent.includes(searchString)) {
      const clone = item.cloneNode(true);
      results.push(clone);
    }
  });

  return results;
}

function clearSearchResults(block) {
  const wrapper = block.querySelector('.search-form + .accordion-wrapper');
  if (wrapper) {
    wrapper.remove();
  }
}

function buildSearchResults(results, block) {
  let accordion = block.querySelector('.accordion');
  if (!accordion) {
    accordion = createTag('div', { class: 'accordion faqs block', 'data-block-name': 'accordion' });
    accordion.append(...results);
    const accordionWrapper = createTag('div', { class: 'accordion-wrapper' }, accordion);
    block.append(accordionWrapper);
  } else {
    accordion.innerHTML = '';
    accordion.append(...results);
  }
}

async function decorateSearch(block) {
  const section = block.closest('.section');
  section.dataset.searched = false;
  const search = section.querySelector('block.search');
  if (search) return;

  const children = Array.from(block.children);
  const label = children[0];
  const button = children[1];
  const result = children[2];
  if (!label || !button || !result) return;

  const labelElement = createTag('label', { class: 'search-label', for: 'faqs-search-form' }, label.lastElementChild?.firstElementChild?.textContent);
  const inputElement = createTag('input', {
    class: 'search-input', id: 'faqs-search-form', name: 'faqs-search-form', type: 'text',
  });
  inputElement.style.background = "url('/icons/magnifying-glass-solid.svg') no-repeat right 10px center";

  const buttonElement = createTag('button', { class: 'search-button', type: 'submit', value: '' }, button.lastElementChild?.firstElementChild?.textContent);
  const inputElementWrapper = createTag('div', { class: 'search-input-wrapper' }, [inputElement, buttonElement]);

  const resultElementTextContent = result.lastElementChild?.firstElementChild?.textContent;
  const resultElement = createTag('div', { class: 'search-result' }, resultElementTextContent);
  const form = createTag('form', { class: 'search-form' }, [labelElement, inputElementWrapper, resultElement]);

  function handleFormSubmit(event) {
    event.preventDefault();
    const searchString = inputElement.value.trim();

    if (!searchString) return;

    section.dataset.searched = true;
    const results = fetchResults(section, searchString);
    const count = results.length;

    buildSearchResults(results, block);
    if (resultElementTextContent) {
      resultElement.textContent = resultElement.textContent.replace(/{search-string}/, `"${searchString}"`).replace(/{count}/, count);
    }
  }

  function handleInput(event) {
    if (event.target.value === '') {
      section.dataset.searched = false;
      clearSearchResults(block);
      if (resultElementTextContent) {
        resultElement.textContent = resultElementTextContent;
      }
    }
  }

  form.addEventListener('submit', handleFormSubmit);
  inputElement.addEventListener('input', handleInput);

  block.innerHTML = '';
  block.append(form);
}

export default async function init(block) {
  await decorateSearch(block);
}
