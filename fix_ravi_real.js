import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, deleteDoc, doc } from 'firebase/firestore';

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
  let count = 0;
  for (const d of memSnap.docs) {
    const data = d.data();
    count++;
    
    // Check if it's the dummy data I added and delete it
    if (data.fullName === "Ravi Prakash Rai" && !data.phone && !data.email) {
       console.log(`Deleting dummy Ravi: ${d.id}`);
       await deleteDoc(doc(db, "memberships", d.id));
       continue;
    }
    if (data.fullName === "Abeer Rai" && !data.phone && !data.email) {
       console.log(`Deleting dummy Abeer: ${d.id}`);
       await deleteDoc(doc(db, "memberships", d.id));
       continue;
    }

    if (!data.fullName) {
      console.log(`Missing fullName! Doc ID: ${d.id}, Data:`, data);
    } else if (data.fullName.toLowerCase().includes("ravi") || data.fullName.toLowerCase().includes("abeer")) {
      console.log(`Found matching name! Doc ID: ${d.id}, Data:`, data);
    }
  }
  console.log(`Total members: ${count}`);
  process.exit(0);
}

run().catch(console.error);
