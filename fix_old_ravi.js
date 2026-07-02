import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, updateDoc, doc } from 'firebase/firestore';

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
  for (const d of memSnap.docs) {
    const data = d.data();
    if (data.firstName === 'Ravi' && data.lastName === 'Rai') {
      console.log(`Found Ravi Rai! Updating to Ravi Prakash Rai...`);
      await updateDoc(doc(db, "memberships", d.id), { fullName: "Ravi Prakash Rai" });
    }
  }
  console.log("Done updating original record.");
  process.exit(0);
}

run().catch(console.error);
