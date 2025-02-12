import { decorateBlockBg } from '../../libs/utils/decorate.js';

export default function decorate(block) {
  block.classList.add('text-block'); // .text is too generic
  const rows = block.querySelectorAll(':scope > div');
  const foreground = rows[rows.length - 1];
  const background = rows.length > 1 ? rows[0] : null;
  if (background) {
    decorateBlockBg(block, background, { useHandleFocalpoint: true });
    block.classList.add('has-bg');
  }
  foreground.classList.add('foreground');
}
