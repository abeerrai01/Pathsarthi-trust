const admin = require('firebase-admin');

// Initialize Firebase Admin (assumes serviceAccountKey is not needed if running locally via ADC,
// but actually, we should just use the service account if available, or default).
// PathSarthi's functions/src/index.ts has admin.initializeApp();
const serviceAccount = require('./serviceAccountKey.json'); // Let's check if this exists, else default

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const createTestUser = async () => {
  const email = 'test@pathsarthi.in';
  const password = 'Admin@123';
  const uid = 'test-intern-uid-123';

  try {
    // 1. Create or update user
    let userRecord;
    try {
      userRecord = await admin.auth().getUserByEmail(email);
      await admin.auth().updateUser(userRecord.uid, { password });
      console.log('Updated existing user password');
    } catch (e) {
      if (e.code === 'auth/user-not-found') {
        userRecord = await admin.auth().createUser({
          uid,
          email,
          password,
          displayName: 'Test Intern',
        });
        console.log('Created new user');
      } else {
        throw e;
      }
    }

    // 2. Set custom claim
    await admin.auth().setCustomUserClaims(userRecord.uid, { role: 'intern' });
    console.log('Set intern custom claim');

    // 3. Create dummy application document
    const appRef = admin.firestore().collection('internship_applications').doc('test-application-123');
    await appRef.set({
      name: 'Test Intern',
      email: email,
      phone: '+919999999999',
      age: '21',
      city: 'Test City',
      state: 'Test State',
      education: 'B.Tech Computer Science',
      field: 'Software Engineering',
      message: 'This is a test application for verifying the intern portal.',
      status: 'approved',
      credEmail: email,
      credPassword: password,
      credUid: userRecord.uid,
      credActive: true,
      credCreatedAt: admin.firestore.FieldValue.serverTimestamp(),
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });
    console.log('Created dummy internship application');

    // 4. Create a dummy task
    await admin.firestore().collection('intern_tasks').add({
      internUid: userRecord.uid,
      internName: 'Test Intern',
      applicationId: 'test-application-123',
      title: 'Complete Onboarding',
      description: 'Review the welcome materials and set up your development environment.',
      category: 'Onboarding',
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
      status: 'pending',
      assignedAt: admin.firestore.FieldValue.serverTimestamp(),
    });
    console.log('Created dummy task');

    console.log('SUCCESS! Test intern created. You can now use the 5-click easter egg.');
    process.exit(0);
  } catch (err) {
    console.error('Error creating test intern:', err);
    process.exit(1);
  }
};

createTestUser();
