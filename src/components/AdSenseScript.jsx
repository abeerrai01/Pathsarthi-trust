import { useEffect } from "react";
import { useLocation } from "react-router-dom";

const ADSENSE_SRC = "https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-7309815339615980";
const ADSENSE_ID = "google-adsense-script";

function shouldInjectAdsense(pathname) {
  if (pathname === "/donate" || pathname === "/sponsor-us") return false;
  if (pathname.startsWith("/admin")) return false;
  return true;
}

const AdSenseScript = () => {
  const location = useLocation();

  useEffect(() => {
    const { pathname } = location;
    const shouldInject = shouldInjectAdsense(pathname);
    const existingScript = document.getElementById(ADSENSE_ID);

    if (shouldInject && !existingScript) {
      const script = document.createElement("script");
      script.id = ADSENSE_ID;
      script.async = true;
      script.src = ADSENSE_SRC;
      script.crossOrigin = "anonymous";
      document.head.appendChild(script);
    } else if (!shouldInject && existingScript) {
      existingScript.remove();
    }
    // Optionally, clean up on unmount
    return () => {
      const script = document.getElementById(ADSENSE_ID);
      if (script && !shouldInjectAdsense(location.pathname)) {
        script.remove();
      }
    };
  }, [location]);

  return null;
};

export default AdSenseScript; 