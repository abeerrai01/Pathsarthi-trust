// src/utils/logVisit.js
import { db } from '../config/firebase';
import { doc, getDoc, setDoc, updateDoc, arrayUnion, increment } from 'firebase/firestore';
import { v4 as uuidv4 } from 'uuid';

function getDeviceType() {
  const ua = navigator.userAgent;
  if (/mobile/i.test(ua)) return 'Mobile';
  if (/tablet/i.test(ua)) return 'Tablet';
  return 'Desktop';
}

function getBrowser() {
  const ua = navigator.userAgent;
  if (ua.indexOf('Firefox') > -1) return 'Firefox';
  if (ua.indexOf('Edg') > -1) return 'Edge';
  if (ua.indexOf('Chrome') > -1) return 'Chrome';
  if (ua.indexOf('Safari') > -1) return 'Safari';
  return 'Other';
}

async function getGeoLocation() {
  try {
    const res = await fetch('https://ipapi.co/json/');
    if (!res.ok) return {};
    const data = await res.json();
    return {
      country: data.country_name,
      region: data.region,
      city: data.city,
      ip: data.ip,
    };
  } catch {
    return {};
  }
}

export const logVisit = async (page = '/') => {
  const visitorId = getVisitorId();
  const docRef = doc(db, 'analytics', 'pathsarthi-in');
  const now = new Date();
  const today = now.toISOString().split('T')[0];
  const deviceType = getDeviceType();
  const browser = getBrowser();
  const userAgent = navigator.userAgent;
  const referrer = document.referrer || null;
  const previousPage = sessionStorage.getItem('last_page') || null;
  sessionStorage.setItem('last_page', page);
  const geo = await getGeoLocation();

  try {
    const docSnap = await getDoc(docRef);
    const dailyEntry = { date: today, views: 1, page, deviceType, browser, userAgent, referrer, previousPage, ...geo };

    if (!docSnap.exists()) {
      await setDoc(docRef, {
        visitors: 1,
        pageViews: 1,
        bounceRate: 0,
        uniqueVisitors: [visitorId],
        daily: [dailyEntry],
      });
    } else {
      const data = docSnap.data();
      const alreadyVisited = data.uniqueVisitors?.includes(visitorId);

      await updateDoc(docRef, {
        pageViews: increment(1),
        [`daily`]: arrayUnion(dailyEntry),
        ...(alreadyVisited ? {} : {
          uniqueVisitors: arrayUnion(visitorId),
          visitors: increment(1),
        }),
      });
    }
    // Per-page analytics
    const pageRef = doc(db, 'analytics', 'pathsarthi-in', 'pages', page);
    const pageSnap = await getDoc(pageRef);
    const pageEntry = { deviceType, browser, userAgent, referrer, previousPage, ...geo };
    if (!pageSnap.exists()) {
      await setDoc(pageRef, {
        pageViews: 1,
        uniqueVisitors: [visitorId],
        devices: { [deviceType]: 1 },
        browsers: { [browser]: 1 },
        userAgents: [userAgent],
        lastVisit: now.toISOString(),
        referrers: referrer ? [referrer] : [],
        previousPages: previousPage ? [previousPage] : [],
        locations: geo.country ? [geo] : [],
      });
    } else {
      const pdata = pageSnap.data();
      await updateDoc(pageRef, {
        pageViews: increment(1),
        [`devices.${deviceType}`]: increment(1),
        [`browsers.${browser}`]: increment(1),
        userAgents: arrayUnion(userAgent),
        lastVisit: now.toISOString(),
        ...(pdata.uniqueVisitors?.includes(visitorId) ? {} : { uniqueVisitors: arrayUnion(visitorId) }),
        ...(referrer ? { referrers: arrayUnion(referrer) } : {}),
        ...(previousPage ? { previousPages: arrayUnion(previousPage) } : {}),
        ...(geo.country ? { locations: arrayUnion(geo) } : {}),
      });
    }
  } catch (error) {
    console.error('Error logging visit:', error);
  }
};

const getVisitorId = () => {
  let id = localStorage.getItem('visitor_id');
  if (!id) {
    id = uuidv4();
    localStorage.setItem('visitor_id', id);
  }
  return id;
}; 