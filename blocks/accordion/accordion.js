import { loadFragment } from '../fragment/fragment.js';
import { createTag } from '../../libs/utils/utils.js';

function decorate(block) {
  [...block.children].forEach((row) => {
    const label = row.children[0];
    const summary = createTag('summary', { class: 'accordion-item-label' }, [...label.childNodes]);

    const plus = createTag('span', { class: 'accordion-item-plus' }, '+');
    const minus = createTag('span', { class: 'accordion-item-minus' }, '-');
    summary.prepend(plus, minus);

    const body = row.children[1];
    body.className = 'accordion-item-body';

    const details = createTag('details', { class: 'accordion-item' }, [summary, body]);
    row.replaceWith(details);
  });
}

function rearrangeSectionContents(section) {
  Array.from(section.children).forEach((child) => {
    if (!child?.classList.contains('default-content-wrapper')) {
      child.previousElementSibling?.append(child);
    } else if (child?.classList.contains('default-content-wrapper') && !child?.firstElementChild.matches('h2,h3,h4,h5,h6')) {
      const contents = [child.firstElementChild];
      let nextElement = child.firstElementChild?.nextElementSibling;

      while (nextElement && !nextElement.matches('h3,h4,h5,h6')) {
        contents.push(nextElement);
        nextElement = nextElement.nextElementSibling;
      }
      child.previousElementSibling?.append(...contents);
    }
  });
}

function buildAccordionSection(section) {
  rearrangeSectionContents(section);

  const heading = section.querySelector('h1,h2');
  const defaultContentWrapper = createTag('div', { class: 'default-content-wrapper' }, heading);
  const accordion = createTag('div', { class: 'accordion faqs block', 'data-block-name': 'accordion' });
  const accordionWrapper = createTag('div', { class: 'accordion-wrapper' }, accordion);

  const accordionItemLabels = Array.from(section.querySelectorAll('h3,h4,h5,h6'));
  accordionItemLabels.forEach((label) => {
    let content = label.nextElementSibling;
    const contentElements = [];

    while (content && !accordionItemLabels.includes(content)) {
      contentElements.push(content);
      content = content.nextElementSibling;
    }

    const accordionItemLabelCol = createTag('div', null, [label]);
    const accordionItemContentCol = createTag('div', null, [...contentElements]);
    const accordionItemRow = createTag('div', null, [accordionItemLabelCol, accordionItemContentCol]);

    accordion.append(accordionItemRow);

    accordion.dataset.blockStatus = 'loaded';
  });

  section.innerHTML = '';
  section.append(defaultContentWrapper, accordionWrapper);
}

async function decorateFAQs(block) {
  const fragment = block.querySelector('a');
  if (!fragment) return;

  const path = fragment.getAttribute('href');
  const content = await loadFragment(path);
  const fragmentSection = content.querySelector('.section');

  if (!fragmentSection) return;

  buildAccordionSection(fragmentSection);
  fragmentSection.querySelectorAll('.accordion').forEach((accordion) => {
    decorate(accordion);
  });

  const blockSection = block.closest('.section');
  blockSection.classList.add(...fragmentSection.classList);

  block.closest('.accordion-wrapper').replaceWith(...fragmentSection.childNodes);
  fragmentSection.remove();
}

export default async function init(block) {
  if (block.classList.contains('faqs')) {
    await decorateFAQs(block);
    return;
  }

  decorate(block);
}
