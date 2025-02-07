import { loadScript } from '../../scripts/aem.js';

export default async function decorate(block) {
  const SCRIPT_URL = 'https://s3.us-east-2.amazonaws.com/wwwbucket-join-network.teststatic.creditacceptance.com/join-our-network-widget.js ';
  if (window.location.host.endsWith('.live') || window.location.host.endsWith('creditacceptance.com')) {
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
  block.style.position = 'relative';

  // Add loading animation
  const loadingAnimation = document.createElement('div');
  loadingAnimation.className = 'loading-animation';
  block.appendChild(loadingAnimation);

  const captchaWorker = new Worker(`${window.hlx.codeBasePath}/blocks/jon-form/google-captcha-worker.js`);

  // Send a message to the Web Worker to load the Popupsmart script
  captchaWorker.postMessage('loadCaptcha');

  // Optional: Listen for messages from the Web Worker
  captchaWorker.onmessage = async function (event) {
    if (event.data.error) {
      console.error('Error in Captcha Web Worker:', event.data.error);
    } else {
      const captchaScript = document.createElement('script');
      captchaScript.type = 'text/javascript';
      captchaScript.innerHTML = event.data;
      captchaScript.async = true;
      document.head.append(captchaScript);
      await loadScript(script);
      const formComponent = document.createElement('join-our-network-form');
      formComponent.webContentJson = webContentJson;
      block.replaceChildren(formComponent);

      formComponent.addEventListener('successData', () => {
        window.location.href = '/dealers/join-our-network/confirmation-thank-you';
      });
    }
  };
}
