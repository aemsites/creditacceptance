// delay loading of GTM script until after the page has loaded
import { isProd } from '../libs/utils/utils.js';

const DEV_LAUNCH_SCRIPT = 'https://assets.adobedtm.com/ad9123205592/67641f4a9897/launch-b238893bfd09-staging.min.js';
const PROD_LAUNCH_SCRIPT = 'https://assets.adobedtm.com/ad9123205592/67641f4a9897/launch-fc986eef9273.min.js';

function loadAdobeLaunch() {
  const tag = document.createElement('script');
  tag.type = 'text/javascript';
  tag.async = true;
  if (isProd()) {
    tag.src = PROD_LAUNCH_SCRIPT;
  } else {
    tag.src = DEV_LAUNCH_SCRIPT;
  }
  document.querySelector('head').append(tag);
}

function loadGoogleTagManagerDev() {
  const gtmScript = document.createElement('script');
  gtmScript.type = 'text/javascript';
  gtmScript.innerHTML = `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','GTM-53N8ZWC');`;
  gtmScript.async = true;

  const noscriptElement = document.createElement('noscript');
  const iframeElement = document.createElement('iframe');
  iframeElement.src = 'https://www.googletagmanager.com/ns.html?id=GTM-53N8ZWC';
  iframeElement.height = '0';
  iframeElement.width = '0';
  iframeElement.style.display = 'none';
  iframeElement.style.visibility = 'hidden';
  noscriptElement.appendChild(iframeElement);

  document.head.appendChild(gtmScript);
  document.body.insertAdjacentElement('afterbegin', noscriptElement);
}

function loadGoogleTagManagerProd() {
  const gtmScript = document.createElement('script');
  gtmScript.type = 'text/javascript';
  gtmScript.innerHTML = `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','GTM-5ZCB74P');`;
  gtmScript.async = true;

  const noscriptElement = document.createElement('noscript');
  const iframeElement = document.createElement('iframe');
  iframeElement.src = 'https://www.googletagmanager.com/ns.html?id=GTM-5ZCB74P';
  iframeElement.height = '0';
  iframeElement.width = '0';
  iframeElement.style.display = 'none';
  iframeElement.style.visibility = 'hidden';
  noscriptElement.appendChild(iframeElement);

  document.head.appendChild(gtmScript);
  document.body.insertAdjacentElement('afterbegin', noscriptElement);
}

if (window.location.hostname !== 'localhost') {
  loadAdobeLaunch();
  if (isProd()) {
    loadGoogleTagManagerProd();
  } else {
    loadGoogleTagManagerDev();
  }
}
