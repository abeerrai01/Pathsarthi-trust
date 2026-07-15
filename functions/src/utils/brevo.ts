import * as brevo from "@getbrevo/brevo";
import { defineSecret } from "firebase-functions/params";
import * as admin from "firebase-admin";

// ─── Secrets ─────────────────────────────────────────────────────────────────
export const brevoApiKey = defineSecret("BREVO_API_KEY");
export const adminEmailSecret = defineSecret("ADMIN_EMAIL");

// ─── Configurable Constants ──────────────────────────────────────────────────
export const BREVO_CONFIG = {
  MASTER_TEMPLATE_ID: 3,
};

// ─── Centralized Email Types ─────────────────────────────────────────────────
export enum EmailType {
  DONATION = "DONATION",
  SPONSOR = "SPONSOR",
  MEMBERSHIP = "MEMBERSHIP",
  PREMIUM_MEMBERSHIP = "PREMIUM_MEMBERSHIP",
  JAN_SAMPARK = "JAN_SAMPARK",
  INTERNSHIP = "INTERNSHIP",
  QUERY = "QUERY",
  CERTIFICATE = "CERTIFICATE",
  ADMIN = "ADMIN",
}

export interface EmailData {
  email: string;
  name: string;
  subject: string;
  preview: string;
  message: string;
  referenceId: string;
  status: string;
  date: string;
  additionalMessage?: string;
  emailType: EmailType;
  certificateType?: string; // Optional: Recognition, Appointment, Internship, etc.
  certificateUrl?: string; // Optional: download/preview link to attach
}

// ─── Reusable Email Helper ───────────────────────────────────────────────────

/**
 * Validates the core required fields for an email payload
 */
const validateEmailData = (data: EmailData) => {
  if (!data.email || !data.email.trim() || !data.email.includes("@")) {
    throw new Error("Invalid or missing recipient email address");
  }
  if (!data.name || !data.name.trim()) {
    throw new Error("Recipient name is required");
  }
  if (!data.subject || !data.subject.trim()) {
    throw new Error("Email subject is required");
  }
  if (!data.message || !data.message.trim()) {
    throw new Error("Email message body is required");
  }
  if (!data.emailType) {
    throw new Error("Email type tracking field is required");
  }
};

/**
 * Reusable email helper that sends a transactional email using the Master Template ID
 * and logs the result (success or failure) to the Firestore `emailLogs` collection.
 */
export const sendEmail = async (apiKey: string, data: EmailData) => {
  // Validate request parameters first
  validateEmailData(data);

  const apiInstance = new brevo.TransactionalEmailsApi();
  apiInstance.setApiKey(brevo.TransactionalEmailsApiApiKeys.apiKey, apiKey);

  const payload: brevo.SendSmtpEmail = {
    templateId: BREVO_CONFIG.MASTER_TEMPLATE_ID,
    to: [{ email: data.email, name: data.name }],
    params: {
      name: data.name || "",
      subject: data.subject || "",
      preview: data.preview || "",
      message: data.message || "",
      referenceId: data.referenceId || "",
      status: data.status || "",
      date: data.date || "",
      additionalMessage: data.additionalMessage || "",
      year: new Date().getFullYear(),
      emailType: data.emailType,
      certificateType: data.certificateType || "",
    },
  };

  if (data.certificateUrl) {
    payload.attachment = [
      {
        url: data.certificateUrl,
        name: `${data.name.replace(/\s+/g, "_")}_certificate.png`,
      },
    ];
  }

  try {
    const result = await apiInstance.sendTransacEmail(payload);

    // Structured SUCCESS Log (Console)
    console.log(
      `[Brevo Email Sent]\n` +
      `Type: ${data.emailType}\n` +
      `Recipient: ${data.email}\n` +
      `Reference: ${data.referenceId}\n` +
      `Status: Sent (HTTP ${result.response.statusCode})`
    );

    // Write Log to Firestore
    try {
      await admin.firestore().collection("emailLogs").add({
        recipient: data.email,
        emailType: data.emailType,
        subject: data.subject,
        referenceId: data.referenceId,
        status: "success",
        sentAt: admin.firestore.FieldValue.serverTimestamp(),
        error: null,
      });
    } catch (dbError) {
      console.error("[Firestore Log Failed] Failed to record email log to database:", dbError);
    }

    return result;
  } catch (error: any) {
    const errorBody = error?.response?.body || error?.body || error?.response || {};
    const errorMessage = errorBody.message || error?.message || "Unknown Brevo API error";
    const fullErrorDetails = error?.response?.body 
      ? `Brevo API Error (${error.response.statusCode || error.response.status}): ${JSON.stringify(error.response.body)}` 
      : (error?.message || JSON.stringify(error));

    // Structured FAILURE Log (Console)
    console.error(
      `[Brevo Email Failed]\n` +
      `Type: ${data.emailType}\n` +
      `Recipient: ${data.email}\n` +
      `Reference: ${data.referenceId}\n` +
      `Reason: ${errorMessage}\n` +
      `Full Body Details: ${fullErrorDetails}`
    );

    // Write Failure Log to Firestore
    try {
      await admin.firestore().collection("emailLogs").add({
        recipient: data.email,
        emailType: data.emailType,
        subject: data.subject,
        referenceId: data.referenceId,
        status: "failed",
        sentAt: admin.firestore.FieldValue.serverTimestamp(),
        error: fullErrorDetails,
      });
    } catch (dbError) {
      console.error("[Firestore Log Failed] Failed to record failure email log to database:", dbError);
    }

    throw error;
  }
};

// ─── Admin Notification Helper ───────────────────────────────────────────────

export const sendAdminNotification = async (
  apiKey: string,
  adminEmailAddress: string,
  formType: string,
  referenceId: string
) => {
  const todayStr = new Date().toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

  const adminName = "Path Sarthi Admin";

  await sendEmail(apiKey, {
    email: adminEmailAddress,
    name: adminName,
    subject: `New ${formType} Submission Received`,
    preview: `A new ${formType} submission requires your attention.`,
    message: `A new ${formType} submission has been received.`,
    referenceId,
    status: "New",
    date: todayStr,
    additionalMessage: "Please log in to the admin dashboard to review the details.",
    emailType: EmailType.ADMIN,
  });
};
