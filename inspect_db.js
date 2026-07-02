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
  console.log("--- MEMBERSHIPS ---");
  const memSnap = await getDocs(collection(db, "memberships"));
  memSnap.forEach(d => {
    const data = d.data();
    console.log(`Name: ${data.fullName}, Status: ${data.status}`);
  });

  console.log("\n--- JAN SAMPARK ---");
  const janSnap = await getDocs(collection(db, "jan_sampark"));
  janSnap.forEach(d => {
    const data = d.data();
    console.log(`Applicant: ${data.fullName}, Ref: ${data.reference}, Status: ${data.status}`);
  });
  process.exit(0);
}

run().catch(console.error);
