/*! coi-serviceworker v0.1.7 - Guido Zuidhof and contributors, MIT License */
(async () => {
  // avoid double reloads
  const reloadedBySelf = new URL(location).searchParams.has('reloaded-by-service-worker');

  if (!('serviceWorker' in navigator)) return;

  // Only register once
  if (window.coi?.shouldRegister?.() === false) return;

  try {
    const registration = await navigator.serviceWorker.register('coi-sw.js', { scope: './' });

    // After the SW is active, reload once with a flag
    if (!reloadedBySelf) {
      const url = new URL(location);
      url.searchParams.set('reloaded-by-service-worker', '1');
      location.replace(url);
    }
  } catch (err) {
    console.error('ServiceWorker registration failed:', err);
  }
})();
