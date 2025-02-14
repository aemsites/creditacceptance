// delay loading of GTM script until after the page has loaded

const DEV_LAUNCH_SCRIPT = 'https://assets.adobedtm.com/ad9123205592/67641f4a9897/launch-b238893bfd09-staging.min.js';
const PROD_LAUNCH_SCRIPT = 'https://assets.adobedtm.com/ad9123205592/67641f4a9897/launch-fc986eef9273.min.js';

function loadAdobeLaunch() {
  const tag = document.createElement('script');
  tag.type = 'text/javascript';
  tag.async = true;
  if (/main--.*\.aem\.live$/.test(window.location.host) || window.location.host.endsWith('creditacceptance.com')) {
    tag.src = PROD_LAUNCH_SCRIPT;
  } else {
    tag.src = DEV_LAUNCH_SCRIPT;
  }
  document.querySelector('head').append(tag);
}

if (window.location.hostname !== 'localhost') {
  loadAdobeLaunch();
}
