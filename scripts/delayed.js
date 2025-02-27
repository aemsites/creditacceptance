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

function loadFullStoryDev() {
  const fsScript = document.createElement('script');
  fsScript.innerHTML = 'var uuid = localStorage.getItem(\'uuid\');if(uuid == null){uuid = crypto.randomUUID();localStorage.setItem(\'uuid\',uuid);}window[\'_fs_debug\'] = false;window[\'_fs_host\'] = \'fullstory.com\';window[\'_fs_script\'] = \'edge.fullstory.com/s/fs.js\';window[\'_fs_org\'] = fullStoryId;window[\'_fs_namespace\'] = \'FS\';+(function(m,n,e,t,l,o,g,y){if (e in m) {if(m.console && m.console.log) { m.console.log(\'FullStory namespace conflict. Please set window["_fs_namespace"].\');} return;}g=m[e]=function(a,b,s){g.q?g.q.push([a,b,s]):g._api(a,b,s);};g.q=[];o=n.createElement(t);o.async=1;o.crossOrigin=\'anonymous\';o.src=\'https://\'+_fs_script;y=n.getElementsByTagName(t)[0];y.parentNode.insertBefore(o,y);g.identify=function(i,v,s){g(l,{uid:i},s);if(v)g(l,v,s)};g.setUserVars=function(v,s){g(l,v,s)};g.event=function(i,v,s){g(\'event\',{n:i,p:v},s)};g.anonymize=function(){g.identify(!!0)};g.shutdown=function(){g("rec",!1)};g.restart=function(){g("rec",!0)};g.log = function(a,b){g("log",[a,b])};g.consent=function(a){g("consent",!arguments.length||a)};g.identifyAccount=function(i,v){o=\'account\';v=v||{};v.acctId=i;g(o,v)};g.clearUserCookie=function(){};g.setVars=function(n, p){g(\'setVars\',[n,p]);};g._w={};y=\'XMLHttpRequest\';g._w[y]=m[y];y=\'fetch\';g._w[y]=m[y];if(m[y])m[y]=function(){return g._w[y].apply(this,arguments)};g._v="1.3.0";})(window,document,window[\'_fs_namespace\'],\'script\',\'user\');if(uuid != null) {FS.identify(uuid);}';
  document.head.appendChild(fsScript);
}

function loadFullStoryProd() {
  const fsScript = document.createElement('script');
  fsScript.innerHTML = 'var uuid = localStorage.getItem(\'uuid\');if(uuid == null){uuid = crypto.randomUUID();localStorage.setItem(\'uuid\',uuid);}window[\'_fs_debug\'] = false;window[\'_fs_host\'] = \'fullstory.com\';window[\'_fs_script\'] = \'edge.fullstory.com/s/fs.js\';window[\'_fs_org\'] = fullStoryId;window[\'_fs_namespace\'] = \'FS\';+(function(m,n,e,t,l,o,g,y){if (e in m) {if(m.console && m.console.log) { m.console.log(\'FullStory namespace conflict. Please set window["_fs_namespace"].\');} return;}g=m[e]=function(a,b,s){g.q?g.q.push([a,b,s]):g._api(a,b,s);};g.q=[];o=n.createElement(t);o.async=1;o.crossOrigin=\'anonymous\';o.src=\'https://\'+_fs_script;y=n.getElementsByTagName(t)[0];y.parentNode.insertBefore(o,y);g.identify=function(i,v,s){g(l,{uid:i},s);if(v)g(l,v,s)};g.setUserVars=function(v,s){g(l,v,s)};g.event=function(i,v,s){g(\'event\',{n:i,p:v},s)};g.anonymize=function(){g.identify(!!0)};g.shutdown=function(){g("rec",!1)};g.restart=function(){g("rec",!0)};g.log = function(a,b){g("log",[a,b])};g.consent=function(a){g("consent",!arguments.length||a)};g.identifyAccount=function(i,v){o=\'account\';v=v||{};v.acctId=i;g(o,v)};g.clearUserCookie=function(){};g.setVars=function(n, p){g(\'setVars\',[n,p]);};g._w={};y=\'XMLHttpRequest\';g._w[y]=m[y];y=\'fetch\';g._w[y]=m[y];if(m[y])m[y]=function(){return g._w[y].apply(this,arguments)};g._v="1.3.0";})(window,document,window[\'_fs_namespace\'],\'script\',\'user\');if(uuid != null) {FS.identify(uuid);}';
  document.head.appendChild(fsScript);
}

if (window.location.hostname !== 'localhost') {
  loadAdobeLaunch();
  if (isProd()) {
    loadGoogleTagManagerProd();
    loadFullStoryProd();
  } else {
    loadGoogleTagManagerDev();
    loadFullStoryDev();
  }
}
