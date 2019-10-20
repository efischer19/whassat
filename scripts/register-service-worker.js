if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/service-worker.js')
    .then(function(registration) {
      console.log('Registered:', registration);
    })
    .catch(function(error) {
      console.log('Registration failed: ', error);
    });
}

// I'm not doing anything fancy, if the add to home screen prompt fires go for it
window.addEventListener('beforeinstallprompt', function(e) {e.prompt();});
