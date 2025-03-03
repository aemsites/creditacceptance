/* eslint-disable no-console */
/* eslint-disable func-names */

// delay loading of GTM script until after the page has loaded
import { isProductionEnvironment } from '../libs/utils/utils.js';

function enableGoogleTagManagerDev() {
  // Create an instance of the Web Worker
  const gtmWorker = new Worker(`${window.hlx.codeBasePath}/scripts/googletagmanager-worker.js`);

  // Send a message to the Web Worker to load the GTM script
  gtmWorker.postMessage('loadGTMDev');

  // Listen for messages from the Web Worker
  gtmWorker.onmessage = function (event) {
    if (event.data.error) {
      console.error('Error in GTM Web Worker:', event.data.error);
    } else {
      // Inject the received GTM script into the page
      const gtmScript = document.createElement('script');
      gtmScript.type = 'text/javascript';
      gtmScript.innerHTML = event.data;
      document.head.appendChild(gtmScript);

      // Create and insert the <noscript> fallback for GTM
      const noscriptElement = document.createElement('noscript');
      const iframeElement = document.createElement('iframe');
      iframeElement.src = 'https://www.googletagmanager.com/ns.html?id=GTM-53N8ZWC';
      iframeElement.height = '0';
      iframeElement.width = '0';
      iframeElement.style.display = 'none';
      iframeElement.style.visibility = 'hidden';
      noscriptElement.appendChild(iframeElement);
      document.body.insertAdjacentElement('afterbegin', noscriptElement);
    }
  };

  // Handle errors from the Web Worker
  gtmWorker.onerror = function (error) {
    console.error('Error in Web Worker:', error);
  };
}

function enableGoogleTagManagerProd() {
  // Create an instance of the Web Worker
  const gtmWorker = new Worker(`${window.hlx.codeBasePath}/scripts/googletagmanager-worker.js`);

  // Send a message to the Web Worker to load the GTM script
  gtmWorker.postMessage('loadGTMProd');

  // Listen for messages from the Web Worker
  gtmWorker.onmessage = function (event) {
    if (event.data.error) {
      console.error('Error in GTM Web Worker:', event.data.error);
    } else {
      // Inject the received GTM script into the page
      const gtmScript = document.createElement('script');
      gtmScript.type = 'text/javascript';
      gtmScript.innerHTML = event.data;
      document.head.appendChild(gtmScript);

      // Create and insert the <noscript> fallback for GTM
      const noscriptElement = document.createElement('noscript');
      const iframeElement = document.createElement('iframe');
      iframeElement.src = 'https://www.googletagmanager.com/ns.html?id=GTM-5ZCB74P';
      iframeElement.height = '0';
      iframeElement.width = '0';
      iframeElement.style.display = 'none';
      iframeElement.style.visibility = 'hidden';
      noscriptElement.appendChild(iframeElement);
      document.body.insertAdjacentElement('afterbegin', noscriptElement);
    }
  };

  // Handle errors from the Web Worker
  gtmWorker.onerror = function (error) {
    console.error('Error in Web Worker:', error);
  };
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
  if (isProductionEnvironment()) {
    enableGoogleTagManagerProd();
    loadFullStoryProd();
  } else {
    enableGoogleTagManagerDev();
    loadFullStoryDev();
  }
}
