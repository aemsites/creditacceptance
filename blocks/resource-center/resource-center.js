import { buildBlock, decorateBlock, loadBlock } from '../../scripts/aem.js';

export default function decorate(block) {
  const cols = [...block.firstElementChild.children];
  block.classList.add(`columns-${cols.length}-cols`);

  // setup image columns
  [...block.children].forEach((row) => {
    [...row.children].forEach((col) => {
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
      });
    });
  });
}
