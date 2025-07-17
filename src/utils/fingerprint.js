// Utility to generate a unique browser/device fingerprint using FingerprintJS
// Loads FingerprintJS from CDN if not already loaded
export async function getFingerprint() {
  if (!window.FingerprintJS) {
    await new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/@fingerprintjs/fingerprintjs@3/dist/fp.min.js';
      script.async = true;
      script.onload = resolve;
      script.onerror = reject;
      document.body.appendChild(script);
    });
  }
  const fpPromise = window.FingerprintJS.load();
  const fp = await fpPromise;
  const result = await fp.get();
  return result.visitorId;
} 