import { loadScript } from '../../scripts/aem.js';
import { isProductionEnvironment } from '../../libs/utils/utils.js';

function preloadScript(src) {
  const link = document.createElement('link');
  link.rel = 'preload';
  link.as = 'script';
  link.href = src;
  document.head.appendChild(link);
}

export default function decorate(block) {
  (async () => {
    const recaptchaScript = 'https://www.google.com/recaptcha/api.js';
    let script = 'https://s3.us-east-2.amazonaws.com/wwwbucket-join-network.teststatic.creditacceptance.com/join-our-network-widget.js';
    if (isProductionEnvironment()) {
      script = 'https://wwwbucket-join-network.static.creditacceptance.com/join-our-network-widget.js';
      window.jonEnv = 'prod';
    } else {
      window.jonEnv = 'test';
    }

    preloadScript(recaptchaScript);
    preloadScript(script);

    await loadScript('https://www.google.com/recaptcha/api.js', { async: true });
    await loadScript(script, { async: true });

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
    // Set block minimum height and relative positioning
    block.style.minHeight = '1000px';
    block.style.position = 'relative';

    const formComponent = document.createElement('join-our-network-form');
    formComponent.webContentJson = webContentJson;
    block.replaceChildren(formComponent);

    formComponent.addEventListener('successData', () => {
      window.location.href = '/dealers/join-our-network/confirmation-thank-you';
    });
  })().catch((error) => {
    // Handle errors here, e.g., log them or notify the user
    console.error('Error in decorate:', error);
  });
}
