(function() {
    console.log('Hi!');
    registerServiceWorker();

    function registerServiceWorker() {
        // register sw script in supporting browsers
        if ('serviceWorker' in navigator) {
          navigator.serviceWorker.register('sw.js', { scope: '/' }).then(() => {
            console.log('Service Worker registered successfully.');
          }).catch(error => {
            console.log('Service Worker registration failed:', error);
          });
        }
      }

})();