const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const listApps = async () => {
  try {
    const snap = await admin.firestore().collection('internship_applications').get();
    console.log(`Total internship applications in DB: ${snap.size}`);
    snap.forEach(d => {
      const data = d.data();
      console.log(`- ID: ${d.id}, Name: ${data.name || data.fullName || data.firstName}, Email: ${data.email}, Status: ${data.status}, credUid: ${data.credUid}`);
    });
  } catch (err) {
    console.error('Error listing:', err);
  }
  process.exit(0);
};

listApps();
