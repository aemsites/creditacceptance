// import { decorateBlockBg } from '../../libs/utils/decorate.js';

export default function decorate(block) {
  const rows = block.querySelectorAll(':scope > div');
  rows[0].classList.add('container');
}
