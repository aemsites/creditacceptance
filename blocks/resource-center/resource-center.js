import { buildBlock, decorateBlock, loadBlock } from '../../scripts/aem.js';

export default function decorate(block) {
  const cols = [...block.firstElementChild.children];
  block.classList.add(`columns-${cols.length}-cols`);

  // setup image columns
  [...block.children].forEach((row) => {
    [...row.children].forEach((col) => {
      // for each list item li, append a div with the class of link-button
      const listItems = col.querySelectorAll('li');
      listItems.forEach((li) => {
        const link = li.querySelector('a');
        if (!link) return;
        const href = link.getAttribute('href');
        const p = document.createElement('p');
        p.className = 'button-container link-button';
        const a = document.createElement('a');
        a.className = 'button secondary';
        a.textContent = '>';
        a.href = href;
        p.appendChild(a);
        li.appendChild(p);
      });

      const pic = col.querySelector('picture');
      if (pic) {
        const picWrapper = pic.closest('div');
        if (picWrapper && picWrapper.children.length === 1) {
          // picture is only content in column
          picWrapper.classList.add('columns-img-col');
        }
      }
      const a = col.querySelector('a');
      if (a && a.href.includes('vimeo')) {
        const embedBlock = buildBlock('embed', a.cloneNode(true));
        const parent = a.closest('div');
        const list = parent.querySelector('ul');
        if (list) {
          parent.insertBefore(embedBlock, list);
          decorateBlock(embedBlock);
          loadBlock(embedBlock);
        }
      }

      const links = col.querySelectorAll('a');
      links.forEach((link) => {
        if (a.href.includes('vimeo')) {
          const parent = link.closest('div');
          const list = parent.querySelector('ul');
          link.addEventListener('click', (event) => {
            event.preventDefault();
            // Remove any existing embed block
            const existingEmbedBlock = parent.querySelector('.block.embed');
            if (existingEmbedBlock) {
              existingEmbedBlock.remove();
            }
            const embedBlockOnClick = buildBlock('embed', link.cloneNode(true));
            parent.insertBefore(embedBlockOnClick, list);
            decorateBlock(embedBlockOnClick);
            loadBlock(embedBlockOnClick);
          });
        }
      });
    });
  });
}
