import { loadScript } from '../../scripts/aem.js';

export default async function decorate(block) {
  const SCRIPT_URL = 'https://s3.us-east-2.amazonaws.com/wwwbucket-join-network.teststatic.creditacceptance.com/join-our-network-widget.js ';
  if (window.location.host.endsWith('main--creditacceptance--aemsites.aem.live') || window.location.host.endsWith('creditacceptance.com')) {
    window.jonEnv = 'prod';
  } else {
    window.jonEnv = 'test';
  }
  const webContentJson = {};
  const rows = block.querySelectorAll('div > div');
  let script = SCRIPT_URL;

  rows.forEach((row) => {
    const cells = row.querySelectorAll('div > p');
    if (cells.length === 2) {
      const key = cells[0]?.textContent?.trim();
      const value = cells[1]?.textContent?.trim();
      if (key === 'script') {
        script = value;
      } else if (key && value) {
        webContentJson[key] = value;
      }
    }
  });

  block.innerHTML = '';
  // Set block width and height to 1000px
  block.style.minHeight = '1000px';
  block.style.position = 'relative';

  // Add loading animation
  const loadingAnimation = document.createElement('div');
  loadingAnimation.className = 'loading-animation';
  block.appendChild(loadingAnimation);
  await loadScript('https://www.google.com/recaptcha/api.js', { async: true });
  await loadScript(script, { async: true });
  const formComponent = document.createElement('join-our-network-form');
  formComponent.webContentJson = webContentJson;
  block.replaceChildren(formComponent);
  formComponent.addEventListener('successData', () => {
    window.location.href = '/dealers/join-our-network/confirmation-thank-you';
  });
}
