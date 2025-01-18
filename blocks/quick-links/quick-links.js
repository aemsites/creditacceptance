import { addStyles } from '../../libs/utils/utils.js';

export default function decorate(block) {
  const nav = document.createElement('nav');
  const ul = document.createElement('ul');
  nav.append(ul);

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
    await decorate(shadow);
    shadow.prepend(addStyles('/blocks/quick-links/quick-links.css'));
    shadow.prepend(addStyles('/styles/styles.css'));
    shadow.prepend(addStyles('/styles/fonts.css'));
  }
}

// register component
customElements.define('aem-quick-links', AEMQuickLinksWebComponent);
