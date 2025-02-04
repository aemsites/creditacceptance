import { addStyles, createTag } from '../../libs/utils/utils.js';

export default function decorate(block) {
  Array.from(block.children).forEach((child) => {
    const picture = child.querySelector('picture');
    const title = child.querySelector('h1,h2,h3,h4,h5,h6');

    const description = Array.from(child.querySelectorAll('p')).find((p) => p.textContent.trim() === p.textContent);

    const link = child.querySelector('a');

    child.innerHTML = '';
    child.classList.add('aem-web-component-poc-item');

    const a = createTag('a', { href: link.getAttribute('href') });
    const img = createTag('img', { src: picture.querySelector('img').getAttribute('src'), alt: '' });
    img.classList.add('aem-web-component-poc-item-image');

    const content = createTag('div', { class: 'aem-web-component-poc-item-content' });
    content.append(title, description);

    a.append(img, content);
    child.append(a);
  });
}

class CustomBlockModifier extends HTMLElement {
  constructor() {
    super();
    this.shadow = this.attachShadow({ mode: 'open' });
  }

  connectedCallback() {
    // baseURL
    const scriptEl = document.querySelector('script[src$="/aem-web-component-poc/aem-web-component-poc.js"]');
    const baseURL = new URL(scriptEl.src).origin;

    // add style to shadow DOM, use full absolute path
    const css = addStyles(`${baseURL}/blocks/aem-web-component-poc/aem-web-component-poc.css`);
    this.shadow.appendChild(css);

    const rawHTML = this.innerHTML;
    const dataAttribute = this.getAttribute('data-aem-test');

    // remove undecoated HTML
    this.innerHTML = '';

    // start decorating
    const block = createTag('div', null, rawHTML);
    block.classList.add('aem-web-component-poc');
    decorate(block);

    // adding data attribute/prop value separately in the block
    const dataAttr = createTag('div', { class: 'aem-web-component-poc-data-attribute' });
    dataAttr.textContent = dataAttribute;
    block.append(dataAttr);

    this.shadow.append(block);
  }
}

customElements.define('aem-block-element', CustomBlockModifier);
