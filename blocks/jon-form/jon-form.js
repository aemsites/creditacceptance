import { loadScript } from '../../scripts/aem.js';
import { isProductionEnvironment, addPrefetch } from '../../libs/utils/utils.js';

const ORIGINS = [
  'https://www.google.com',
  'https://wwwbucket-join-network.static.creditacceptance.com',
  'https://s3.us-east-2.amazonaws.com',
];

function preconnectOrigins(orgins) {
  orgins.forEach((origin) => {
    addPrefetch('preconnect', origin);
  });
}

export default function decorate(block) {
  let script = 'https://s3.us-east-2.amazonaws.com/wwwbucket-join-network.teststatic.creditacceptance.com/join-our-network-widget.js ';
  if (isProductionEnvironment()) {
    script = 'https://wwwbucket-join-network.static.creditacceptance.com/join-our-network-widget.js';
    window.jonEnv = 'prod';
  } else {
    window.jonEnv = 'test';
  }

  preconnectOrigins(ORIGINS);

  loadScript('https://www.google.com/recaptcha/api.js', { async: true }).then(() => loadScript(script, { async: true }));
  const webContentJson = {};
  const rows = block.querySelectorAll('div > div');

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

  const formComponent = document.createElement('join-our-network-form');
  formComponent.webContentJson = webContentJson;
  block.replaceChildren(formComponent);
  formComponent.addEventListener('successData', () => {
    window.location.href = '/dealers/join-our-network/confirmation-thank-you';
  });
}
