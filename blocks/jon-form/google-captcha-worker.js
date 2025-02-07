// Listen for messages from the main thread
onmessage = function (event) {
  if (event.data === 'loadCaptcha') {
    fetch('https://www.google.com/recaptcha/api.js')
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
