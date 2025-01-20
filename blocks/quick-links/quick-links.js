import { addStyles } from '../../libs/utils/utils.js';
import { decorateIcons } from '../../scripts/aem.js';

export default function decorate(block) {
  const nav = document.createElement('nav');
  const ul = document.createElement('ul');
  nav.append(ul);
  decorateIcons(block);

  Array.from(block.children).forEach((row) => {
    const li = document.createElement('li');
    const a = row.querySelector('a');
    a.className = 'quick-links-item';
    const { textContent } = a;
    a.textContent = '';

    const textSpan = document.createElement('span');
    textSpan.textContent = textContent;
    a.append(textSpan);

    const { src: iconSrc } = row.querySelector('.icon img');
    const maskedDiv = document.createElement('div');
    maskedDiv.className = 'icon-masked';
    maskedDiv.style.mask = `url(${iconSrc}) no-repeat center`;

    a.prepend(maskedDiv);

    li.append(a);
    ul.append(li);
  });

  block.innerHTML = '';
  block.append(nav);
}

// expose as a web component
class AEMQuickLinksWebComponent extends HTMLElement {
  // connect component
  async connectedCallback() {
    const shadow = this.attachShadow({ mode: 'open' });
    const container = document.createElement('div');
    container.className = 'quick-links';

    // Define the slot
    const slot = document.createElement('slot');
    container.appendChild(slot);
    await decorate(shadow);
    shadow.prepend(addStyles('https://web-component--creditacceptance--aemsites.aem.page/blocks/quick-links/quick-links.css'));
    shadow.prepend(addStyles('https://web-component--creditacceptance--aemsites.aem.page/styles/styles.css'));
    shadow.prepend(addStyles('https://web-component--creditacceptance--aemsites.aem.page/styles/fonts.css'));
  }
}

// register component
customElements.define('aem-quick-links', AEMQuickLinksWebComponent);
