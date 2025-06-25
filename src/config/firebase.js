// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAZxYtdpGgXjgcTFxFIJaIyCljNoaCgW_Q",
  authDomain: "pathsarthi-trust-admin.firebaseapp.com",
  projectId: "pathsarthi-trust-admin",
  storageBucket: "pathsarthi-trust-admin.appspot.com",
  messagingSenderId: "267179352941",
  appId: "1:267179352941:web:27479d68e3ab233930f064",
  measurementId: "G-HCGN7WHQ41"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
const analytics = getAnalytics(app);