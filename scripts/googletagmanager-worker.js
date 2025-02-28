/* eslint-disable func-names */
// Listen for messages from the main thread
onmessage = function (event) {
  if (event.data === 'loadGTMDev') {
    fetch('https://www.googletagmanager.com/gtm.js?id=GTM-NXTTWP')
      .then((response) => response.text())
      .then((data) => {
        // Send the data back to the main thread
        postMessage(data);
      })
      .catch((error) => {
        // Send the error back to the main thread
        postMessage({ error: error.message });
      });
  } else if (event.data === 'loadGTMProd') {
    fetch('https://www.googletagmanager.com/gtm.js?id=GTM-5ZCB74P')
      .then((response) => response.text())
      .then((data) => {
        // Send the data back to the main thread
        postMessage(data);
      })
      .catch((error) => {
        // Send the error back to the main thread
        postMessage({ error: error.message });
      });
  }
};
