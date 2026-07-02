import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyAZxYtdpGgXjgcTFxFIJaIyCljNoaCgW_Q",
  authDomain: "pathsarthi-trust-admin.firebaseapp.com",
  projectId: "pathsarthi-trust-admin",
  storageBucket: "pathsarthi-trust-admin.appspot.com",
  messagingSenderId: "267179352941",
  appId: "1:267179352941:web:27479d68e3ab233930f064",
  measurementId: "G-HCGN7WHQ41"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function run() {
  const memSnap = await getDocs(collection(db, "memberships"));
  memSnap.forEach(d => {
    const data = d.data();
    const name = data.fullName || (data.firstName ? data.firstName + " " + (data.lastName || "") : "Unknown");
    console.log(`[${d.id}] Name: ${name}, fullName: ${data.fullName}, firstName: ${data.firstName}, lastName: ${data.lastName}, Status: ${data.status}`);
  });
  process.exit(0);
}

run().catch(console.error);
