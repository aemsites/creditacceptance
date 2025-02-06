import { loadScript } from '../../scripts/aem.js';

export default async function decorate(block) {
  if (window.location.host.endsWith('.live') || window.location.host.endsWith('creditacceptance.com')) {
    window.jonEnv = 'prod';
  } else {
    window.jonEnv = 'test';
  }
  const webContentJson = {};
  const rows = block.querySelectorAll('div > div');

  rows.forEach((row) => {
    const cells = row.querySelectorAll('div > p');
    if (cells.length === 2) {
      const key = cells[0]?.textContent?.trim();
      const value = cells[1]?.textContent?.trim();
      if (key && value) {
        webContentJson[key] = value;
      }
    }
  });

  await loadScript('/scripts/join-our-network-widget.js');
  const formComponent = document.createElement('join-our-network-form');
  formComponent.webContentJson = webContentJson;
  block.replaceChildren(formComponent);
}
