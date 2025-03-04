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
  const loadHeavyScripts = async () => {
    try {
      const recaptchaScript = 'https://www.google.com/recaptcha/api.js';
      let widgetScript = 'https://s3.us-east-2.amazonaws.com/wwwbucket-join-network.teststatic.creditacceptance.com/join-our-network-widget.js';
      if (isProductionEnvironment()) {
        widgetScript = 'https://wwwbucket-join-network.static.creditacceptance.com/join-our-network-widget.js';
        window.jonEnv = 'prod';
      } else {
        window.jonEnv = 'test';
      }

      preloadScript(recaptchaScript);
      preloadScript(widgetScript);

      setTimeout(() => {
        loadScript(recaptchaScript, { async: true })
          .then(() => loadScript(widgetScript, { async: true }));
      }, 10);

      const webContentJson = {};
      const rows = block.querySelectorAll('div > div');
      rows.forEach((row) => {
        const cells = row.querySelectorAll('div > p');
        if (cells.length === 2) {
          const key = cells[0]?.textContent?.trim();
          const value = cells[1]?.textContent?.trim();
          // If a new widget script is provided in the content, override it.
          if (key === 'script') {
            widgetScript = value;
          } else if (key && value) {
            webContentJson[key] = value;
          }
        }
      });

      block.innerHTML = '';
      block.style.minHeight = '1000px';
      block.style.position = 'relative';

      const formComponent = document.createElement('join-our-network-form');
      formComponent.webContentJson = webContentJson;
      block.replaceChildren(formComponent);

      formComponent.addEventListener('successData', () => {
        window.location.href = '/dealers/join-our-network/confirmation-thank-you';
      });
    } catch (error) {
      console.error('Error in decorate:', error);
    }
  };

  // fallback
  if (!('IntersectionObserver' in window)) {
    loadHeavyScripts();
    return;
  }

  const observer = new IntersectionObserver((entries, observerInstance) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        loadHeavyScripts();
        observerInstance.disconnect();
      }
    });
  });

  observer.observe(block);
}
