export default function decorate(block) {
  const rows = block.querySelectorAll(':scope > div');
  rows[0].classList.add('intro-row');
  rows[1].classList.add('pride-row');
  const introCols = rows[0].querySelectorAll(':scope > div');
  introCols[0].classList.add('copy');
  introCols[1].classList.add('media');
}
