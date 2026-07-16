/**
 * backfillInternIds.js
 * One-time script: assigns PSTI-YYYY-NNNN intern IDs to all existing
 * internship_applications that don't already have one.
 *
 * Requires serviceAccountKey.json in the functions/ directory.
 * Run from: d:\PathSarthi\Pathsarthi-trust\functions\
 *   node backfillInternIds.js
 */

const admin = require('firebase-admin');

let serviceAccount;
try {
  serviceAccount = require('./serviceAccountKey.json');
} catch (e) {
  console.error('serviceAccountKey.json not found in functions/ directory.');
  console.error('Please download it from Firebase Console > Project Settings > Service Accounts > Generate New Private Key');
  process.exit(1);
}

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

async function backfill() {
  console.log('Fetching all internship_applications...');
  const snap = await db.collection('internship_applications').get();

  // Separate those with and without internId
  const withId = [];
  const withoutId = [];
  snap.forEach(docSnap => {
    const data = docSnap.data();
    if (data.internId) {
      withId.push({ id: docSnap.id, internId: data.internId });
    } else {
      withoutId.push({ id: docSnap.id, data });
    }
  });

  console.log(`Found ${withId.length} with internId, ${withoutId.length} without.`);

  if (withoutId.length === 0) {
    console.log('Nothing to backfill. All records already have internIds.');
    process.exit(0);
    return;
  }

  // Sort those without an ID by createdAt ascending (oldest first)
  withoutId.sort((a, b) => {
    const ta = a.data.createdAt?._seconds != null
      ? a.data.createdAt._seconds * 1000
      : (a.data.createdAt?.seconds || 0) * 1000;
    const tb = b.data.createdAt?._seconds != null
      ? b.data.createdAt._seconds * 1000
      : (b.data.createdAt?.seconds || 0) * 1000;
    return ta - tb;
  });

  // Find the highest existing sequential number to avoid conflicts
  let maxSeq = withId.reduce((max, item) => {
    const parts = (item.internId || '').split('-');
    const seq = parseInt(parts[parts.length - 1], 10);
    return isNaN(seq) ? max : Math.max(max, seq);
  }, 0);

  const batch = db.batch();
  const year = new Date().getFullYear();

  withoutId.forEach(({ id }) => {
    maxSeq += 1;
    const internId = `PSTI-${year}-${String(maxSeq).padStart(4, '0')}`;
    console.log(`  Assigning ${internId} to doc ${id}`);
    batch.update(db.collection('internship_applications').doc(id), { internId });
  });

  await batch.commit();
  console.log(`\n✅ Backfill complete! Assigned ${withoutId.length} new intern IDs.`);
  process.exit(0);
}

backfill().catch(err => {
  console.error('Backfill failed:', err);
  process.exit(1);
});
