/**
 * Quick backend test script.
 * Run from the functions/ directory: node test-backend.js
 */

const admin = require("firebase-admin");

admin.initializeApp({ projectId: "pathsarthi-trust-admin" });

const db = admin.firestore();

async function run() {
  console.log("\n🧪 PathSarthi Backend Test\n");

  // ─── Test 1: Firestore connectivity ─────────────────────────────────────────
  console.log("1️⃣  Testing Firestore connectivity...");
  try {
    const testRef = await db.collection("_test_").add({ ping: true, ts: admin.firestore.FieldValue.serverTimestamp() });
    console.log("   ✅ Firestore write OK — doc ID:", testRef.id);
    await testRef.delete();
    console.log("   ✅ Firestore delete OK\n");
  } catch (err) {
    console.error("   ❌ Firestore error:", err.message, "\n");
  }

  // ─── Test 2: Trigger sendEmailOnNewApplication ────────────────────────────
  console.log("2️⃣  Creating test application (triggers sendEmailOnNewApplication)...");
  try {
    const ref = await db.collection("applications").add({
      firstName: "Test",
      lastName: "Trigger",
      email: "pathsarthi2022@gmail.com",
      phone: "9999999999",
      qualification: "B.Tech",
      supportType: "Scholarship",
      educationDetails: "Backend test",
      city: "Mumbai",
      state: "Maharashtra",
      _isTest: true,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });
    console.log("   ✅ Test application created — ID:", ref.id);
    console.log("   📧 Check pathsarthi2022@gmail.com inbox in ~30 seconds");
    console.log("   📋 Or check Firebase Console → Functions → Logs\n");

    // Clean up after 10s
    setTimeout(async () => {
      await ref.delete();
      console.log("   🗑️  Test document cleaned up\n");
      process.exit(0);
    }, 10000);
  } catch (err) {
    console.error("   ❌ Application create error:", err.message, "\n");
    process.exit(1);
  }
}

run();
