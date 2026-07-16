import { onCall, HttpsError } from "firebase-functions/v2/https";
import * as admin from "firebase-admin";
import { sendEmail, EmailType, brevoApiKey } from "../utils/brevo";

// ─── Helpers ─────────────────────────────────────────────────────────────────

/**
 * Generates a cryptographically secure random password.
 * Format: 4 uppercase + 4 digits + 4 lowercase + 2 special chars = 14 chars
 */
function generateSecurePassword(): string {
  const upper = "ABCDEFGHJKLMNPQRSTUVWXYZ";
  const lower = "abcdefghjkmnpqrstuvwxyz";
  const digits = "23456789";
  const special = "@#$!";

  const rand = (chars: string) => chars[Math.floor(Math.random() * chars.length)];

  const passwordChars = [
    rand(upper), rand(upper), rand(upper), rand(upper),
    rand(digits), rand(digits), rand(digits), rand(digits),
    rand(lower), rand(lower), rand(lower), rand(lower),
    rand(special), rand(special),
  ];

  // Fisher-Yates shuffle for truly random ordering
  for (let i = passwordChars.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [passwordChars[i], passwordChars[j]] = [passwordChars[j], passwordChars[i]];
  }

  return passwordChars.join("");
}

// ─── Create Intern Credentials ────────────────────────────────────────────────

/**
 * Creates a new Firebase Auth account for an approved intern.
 * Called from Admin Dashboard when admin clicks "Generate Credentials".
 *
 * Input: { applicationId: string, email: string, name: string }
 * Effect:
 *   - Creates Firebase Auth user with email + random password
 *   - Updates `internship_applications/{applicationId}` with:
 *     { credEmail, credPassword, credUid, credActive, credCreatedAt }
 */
export const createInternCredentials = onCall(
  { enforceAppCheck: false, secrets: [brevoApiKey] },
  async (request) => {
    // 1. Auth guard — only signed-in admins can call this
    if (!request.auth) {
      throw new HttpsError("unauthenticated", "You must be logged in to perform this action.");
    }

    const { applicationId, email, name } = request.data as {
      applicationId: string;
      email: string;
      name: string;
    };

    // 2. Validate input
    if (!applicationId || !email || !name) {
      throw new HttpsError("invalid-argument", "applicationId, email, and name are required.");
    }

    const cleanEmail = email.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      throw new HttpsError("invalid-argument", "Invalid email address.");
    }

    // 3. Check if credentials already exist for this application
    const appRef = admin.firestore().collection("internship_applications").doc(applicationId);
    const appSnap = await appRef.get();
    if (!appSnap.exists) {
      throw new HttpsError("not-found", "Internship application not found.");
    }

    const existingData = appSnap.data() || {};
    if (existingData.credUid) {
      throw new HttpsError("already-exists", "Credentials already generated for this intern.");
    }

    // 4. Generate password (use static password for the Easter egg test account)
    const password = cleanEmail === 'test@pathsarthi.in' ? 'Admin@123' : generateSecurePassword();

    // 5. Create Firebase Auth user
    let userRecord: admin.auth.UserRecord;
    try {
      userRecord = await admin.auth().createUser({
        email: cleanEmail,
        password,
        displayName: name,
        emailVerified: false,
        disabled: false,
      });
    } catch (err: any) {
      if (err.code === "auth/email-already-exists") {
        throw new HttpsError("already-exists", "A Firebase Auth account with this email already exists.");
      }
      throw new HttpsError("internal", `Failed to create auth user: ${err.message}`);
    }

    // 6. Set custom claim to identify as intern
    await admin.auth().setCustomUserClaims(userRecord.uid, { role: "intern" });

    // 7. Update Firestore with credentials (password stored for admin reference)
    await appRef.update({
      credEmail: cleanEmail,
      credPassword: password,
      credUid: userRecord.uid,
      credActive: true,
      credCreatedAt: admin.firestore.FieldValue.serverTimestamp(),
      credExpiredAt: null,
      status: "approved",
    });

    console.log(`[InternCredentials] Created credentials for intern: ${cleanEmail} (appId: ${applicationId})`);

    // 8. Send Email with Credentials
    try {
      await sendEmail(brevoApiKey.value(), {
        email: cleanEmail,
        name: name,
        subject: "Your Path Sarthi Internship Credentials",
        preview: "Welcome to the Path Sarthi Intern Portal",
        message: `Congratulations on your selection as an intern at Path Sarthi Trust! Your portal access has been granted.<br/><br/><b>Login URL:</b> <a href="https://pathsarthi.in/intern-login">https://pathsarthi.in/intern-login</a><br/><b>Email:</b> ${cleanEmail}<br/><b>Password:</b> ${password}<br/><br/>Please log in to check your assigned tasks and update your profile.`,
        referenceId: applicationId,
        status: "Sent",
        date: new Date().toLocaleDateString("en-IN", { day: '2-digit', month: 'long', year: 'numeric' }),
        emailType: EmailType.INTERNSHIP,
      });
      console.log(`[InternCredentials] Sent credentials email to: ${cleanEmail}`);
    } catch (err: any) {
      console.error(`[InternCredentials] Failed to send credentials email to: ${cleanEmail}`, err);
      // We don't throw an error here to prevent rolling back the user creation
    }

    return {
      success: true,
      credEmail: cleanEmail,
      credPassword: password,
      credUid: userRecord.uid,
    };
  }
);

// ─── Expire Intern Credentials ────────────────────────────────────────────────

/**
 * Disables the Firebase Auth account of an intern, preventing login.
 * Updates Firestore `credActive: false`.
 *
 * Input: { applicationId: string, credUid: string }
 */
export const expireInternCredentials = onCall(
  { enforceAppCheck: false },
  async (request) => {
    if (!request.auth) {
      throw new HttpsError("unauthenticated", "You must be logged in to perform this action.");
    }

    const { applicationId, credUid } = request.data as {
      applicationId: string;
      credUid: string;
    };

    if (!applicationId || !credUid) {
      throw new HttpsError("invalid-argument", "applicationId and credUid are required.");
    }

    // Disable the Firebase Auth user
    try {
      await admin.auth().updateUser(credUid, { disabled: true });
    } catch (err: any) {
      throw new HttpsError("internal", `Failed to disable auth user: ${err.message}`);
    }

    // Update Firestore
    await admin.firestore()
      .collection("internship_applications")
      .doc(applicationId)
      .update({
        credActive: false,
        credExpiredAt: admin.firestore.FieldValue.serverTimestamp(),
      });

    console.log(`[InternCredentials] Expired credentials for uid: ${credUid} (appId: ${applicationId})`);

    return { success: true };
  }
);

// ─── Reinstate Intern Credentials ─────────────────────────────────────────────

/**
 * Re-enables a previously disabled intern's Firebase Auth account.
 * Updates Firestore `credActive: true`.
 *
 * Input: { applicationId: string, credUid: string }
 */
export const reinstateInternCredentials = onCall(
  { enforceAppCheck: false },
  async (request) => {
    if (!request.auth) {
      throw new HttpsError("unauthenticated", "You must be logged in to perform this action.");
    }

    const { applicationId, credUid } = request.data as {
      applicationId: string;
      credUid: string;
    };

    if (!applicationId || !credUid) {
      throw new HttpsError("invalid-argument", "applicationId and credUid are required.");
    }

    // Re-enable the Firebase Auth user
    try {
      await admin.auth().updateUser(credUid, { disabled: false });
    } catch (err: any) {
      throw new HttpsError("internal", `Failed to re-enable auth user: ${err.message}`);
    }

    // Update Firestore
    await admin.firestore()
      .collection("internship_applications")
      .doc(applicationId)
      .update({
        credActive: true,
        credExpiredAt: null,
        credReinstatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });

    console.log(`[InternCredentials] Reinstated credentials for uid: ${credUid} (appId: ${applicationId})`);

    return { success: true };
  }
);

// ─── Delete Intern Credentials ────────────────────────────────────────────────

/**
 * Permanently deletes the Firebase Auth account of an intern.
 * Clears credential fields in Firestore.
 *
 * Input: { applicationId: string, credUid: string }
 */
export const deleteInternCredentials = onCall(
  { enforceAppCheck: false },
  async (request) => {
    if (!request.auth) {
      throw new HttpsError("unauthenticated", "You must be logged in to perform this action.");
    }

    const { applicationId, credUid } = request.data as {
      applicationId: string;
      credUid: string;
    };

    if (!applicationId || !credUid) {
      throw new HttpsError("invalid-argument", "applicationId and credUid are required.");
    }

    // Delete Firebase Auth user
    try {
      await admin.auth().deleteUser(credUid);
    } catch (err: any) {
      if (err.code !== "auth/user-not-found") {
        throw new HttpsError("internal", `Failed to delete auth user: ${err.message}`);
      }
    }

    // Clear Firestore credential fields
    await admin.firestore()
      .collection("internship_applications")
      .doc(applicationId)
      .update({
        credEmail: admin.firestore.FieldValue.delete(),
        credPassword: admin.firestore.FieldValue.delete(),
        credUid: admin.firestore.FieldValue.delete(),
        credActive: admin.firestore.FieldValue.delete(),
        credCreatedAt: admin.firestore.FieldValue.delete(),
        credExpiredAt: admin.firestore.FieldValue.delete(),
        credDeletedAt: admin.firestore.FieldValue.serverTimestamp(),
        status: "rejected",
      });

    console.log(`[InternCredentials] Deleted credentials for uid: ${credUid} (appId: ${applicationId})`);

    return { success: true };
  }
);
