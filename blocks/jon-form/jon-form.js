import { loadScript } from '../../scripts/aem.js';

export default async function decorate(block) {
  window.jonEnv = 'test';
  await loadScript('/scripts/join-our-network-widget.js');
  const formComponent = document.createElement('join-our-network');
  setTimeout(() => {
    block.appendChild(formComponent);
  }, 1000);
}
