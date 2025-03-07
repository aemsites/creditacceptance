import { loadScript } from '../../scripts/aem.js';
import { getEnvConfig, getEnv } from '../../libs/utils/utils.js';

export default async function decorate(block) {
  let jonWidgetScript = await getEnvConfig('jon-widget');
  const recaptchaScript = await getEnvConfig('recaptcha-google');

  window.jonEnv = getEnv();

  const webContentJson = {};
  const rows = block.querySelectorAll('div > div');

  rows.forEach((row) => {
    const cells = row.querySelectorAll('div > p');
    if (cells.length === 2) {
      const key = cells[0]?.textContent?.trim();
      const value = cells[1]?.textContent?.trim();
      if (key === 'script') {
        jonWidgetScript = value;
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
  await loadScript(recaptchaScript, { async: true });
  await loadScript(jonWidgetScript, { async: true });
  const formComponent = document.createElement('join-our-network-form');
  formComponent.webContentJson = webContentJson;
  block.replaceChildren(formComponent);
  formComponent.addEventListener('successData', () => {
    window.location.href = '/dealers/join-our-network/confirmation-thank-you';
  });
}
