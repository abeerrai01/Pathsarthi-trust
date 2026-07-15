import { onDocumentCreated } from "firebase-functions/v2/firestore";
import { onCall, HttpsError } from "firebase-functions/v2/https";
import {
  brevoApiKey,
  adminEmailSecret,
  sendEmail,
  sendAdminNotification,
  EmailData,
  EmailType,
} from "../utils/brevo";

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** Returns today's date formatted as "16 July 2026" */
const today = () => new Date().toLocaleDateString("en-IN", {
  day: "2-digit",
  month: "long",
  year: "numeric",
});

/** Validates that required fields are present in a callable request */
const requireFields = (data: any, fields: string[]) => {
  const missing = fields.filter((f) => !data || !data[f] || (typeof data[f] === "string" && !data[f].trim()));
  if (missing.length > 0) {
    throw new HttpsError(
      "invalid-argument",
      `Missing required fields: ${missing.join(", ")}`
    );
  }
};

// ─── 1. Donation Page ────────────────────────────────────────────────────────

export const sendDonationEmail = onCall(
  { secrets: [brevoApiKey, adminEmailSecret] },
  async (request) => {
    const data = request.data;
    requireFields(data, ["email", "name", "transactionId"]);

    const emailData: EmailData = {
      email: data.email,
      name: data.name,
      subject: "Thank You for Supporting Path Sarthi Trust",
      preview: "Your contribution is helping us create meaningful change.",
      status: "Donation Successful",
      message: "Thank you for your generous contribution to Path Sarthi Trust. Your support enables us to continue working towards education, youth empowerment, community welfare, and social development.",
      additionalMessage: "Your donation has been recorded successfully. If applicable, your receipt and future updates regarding our initiatives will be shared with you.",
      referenceId: data.transactionId,
      date: today(),
      emailType: EmailType.DONATION,
    };

    try {
      await sendEmail(brevoApiKey.value(), emailData);
      await sendAdminNotification(
        brevoApiKey.value(),
        adminEmailSecret.value(),
        "Donation",
        data.transactionId
      );
      return { success: true };
    } catch (error: any) {
      console.error("Error in sendDonationEmail:", error);
      throw new HttpsError("internal", error?.message || "Failed to send donation email.");
    }
  }
);

// ─── 2. Sponsor Page ─────────────────────────────────────────────────────────

export const sendSponsorEmail = onCall(
  { secrets: [brevoApiKey, adminEmailSecret] },
  async (request) => {
    const data = request.data;
    requireFields(data, ["email", "name", "requestId"]);

    const emailData: EmailData = {
      email: data.email,
      name: data.name,
      subject: "Sponsorship Request Received",
      preview: "Thank you for choosing to support our mission.",
      status: "Request Received",
      message: "We have successfully received your sponsorship request. We sincerely appreciate your willingness to partner with Path Sarthi Trust.",
      additionalMessage: "Our team will carefully review your submission and contact you shortly to discuss the next steps.",
      referenceId: data.requestId,
      date: today(),
      emailType: EmailType.SPONSOR,
    };

    try {
      await sendEmail(brevoApiKey.value(), emailData);
      await sendAdminNotification(
        brevoApiKey.value(),
        adminEmailSecret.value(),
        "Sponsor",
        data.requestId
      );
      return { success: true };
    } catch (error: any) {
      console.error("Error in sendSponsorEmail:", error);
      throw new HttpsError("internal", error?.message || "Failed to send sponsor email.");
    }
  }
);

// ─── 3. Membership Page ──────────────────────────────────────────────────────

export const sendMembershipEmail = onCall(
  { secrets: [brevoApiKey, adminEmailSecret] },
  async (request) => {
    const data = request.data;
    requireFields(data, ["email", "name", "membershipId"]);

    const emailData: EmailData = {
      email: data.email,
      name: data.name,
      subject: "Membership Application Received",
      preview: "Thank you for joining Path Sarthi Trust.",
      status: "Application Received",
      message: "Your membership application has been successfully submitted.",
      additionalMessage: "Our team is currently reviewing your application and will update you as soon as the verification process is completed.",
      referenceId: data.membershipId,
      date: today(),
      emailType: EmailType.MEMBERSHIP,
    };

    try {
      await sendEmail(brevoApiKey.value(), emailData);
      await sendAdminNotification(
        brevoApiKey.value(),
        adminEmailSecret.value(),
        "Membership",
        data.membershipId
      );
      return { success: true };
    } catch (error: any) {
      console.error("Error in sendMembershipEmail:", error);
      throw new HttpsError("internal", error?.message || "Failed to send membership email.");
    }
  }
);

// ─── 4. Premium Membership ───────────────────────────────────────────────────

export const sendPremiumMembershipEmail = onCall(
  { secrets: [brevoApiKey, adminEmailSecret] },
  async (request) => {
    const data = request.data;
    requireFields(data, ["email", "name", "membershipId"]);

    const emailData: EmailData = {
      email: data.email,
      name: data.name,
      subject: "Premium Membership Application Received",
      preview: "Thank you for becoming part of our mission.",
      status: "Application Under Review",
      message: "Your premium membership application has been successfully received.",
      additionalMessage: "Our team will verify your application and communicate the next steps shortly.",
      referenceId: data.membershipId,
      date: today(),
      emailType: EmailType.PREMIUM_MEMBERSHIP,
    };

    try {
      await sendEmail(brevoApiKey.value(), emailData);
      await sendAdminNotification(
        brevoApiKey.value(),
        adminEmailSecret.value(),
        "Premium Membership",
        data.membershipId
      );
      return { success: true };
    } catch (error: any) {
      console.error("Error in sendPremiumMembershipEmail:", error);
      throw new HttpsError("internal", error?.message || "Failed to send premium membership email.");
    }
  }
);

// ─── 5. Jan Sampark ──────────────────────────────────────────────────────────

export const sendJanSamparkEmail = onCall(
  { secrets: [brevoApiKey, adminEmailSecret] },
  async (request) => {
    const data = request.data;
    requireFields(data, ["email", "name", "requestId"]);

    const emailData: EmailData = {
      email: data.email,
      name: data.name,
      subject: "Your Request Has Been Received",
      preview: "Thank you for reaching out to Path Sarthi Trust.",
      status: "Request Received",
      message: "Thank you for contacting us through Jan Sampark.",
      additionalMessage: "Our team is reviewing your request and will get back to you as soon as possible.",
      referenceId: data.requestId,
      date: today(),
      emailType: EmailType.JAN_SAMPARK,
    };

    try {
      await sendEmail(brevoApiKey.value(), emailData);
      await sendAdminNotification(
        brevoApiKey.value(),
        adminEmailSecret.value(),
        "Jan Sampark",
        data.requestId
      );
      return { success: true };
    } catch (error: any) {
      console.error("Error in sendJanSamparkEmail:", error);
      throw new HttpsError("internal", error?.message || "Failed to send Jan Sampark email.");
    }
  }
);

// ─── 6. Internship ───────────────────────────────────────────────────────────

export const sendInternshipEmail = onCall(
  { secrets: [brevoApiKey, adminEmailSecret] },
  async (request) => {
    const data = request.data;
    requireFields(data, ["email", "name", "applicationId"]);

    const emailData: EmailData = {
      email: data.email,
      name: data.name,
      subject: "Internship Application Received",
      preview: "Thank you for applying.",
      status: "Application Received",
      message: "Your internship application has been successfully submitted.",
      additionalMessage: "Our recruitment team will review your profile and notify you regarding further steps.",
      referenceId: data.applicationId,
      date: today(),
      emailType: EmailType.INTERNSHIP,
    };

    try {
      await sendEmail(brevoApiKey.value(), emailData);
      await sendAdminNotification(
        brevoApiKey.value(),
        adminEmailSecret.value(),
        "Internship",
        data.applicationId
      );
      return { success: true };
    } catch (error: any) {
      console.error("Error in sendInternshipEmail:", error);
      throw new HttpsError("internal", error?.message || "Failed to send internship email.");
    }
  }
);

// ─── 7. Query Bot ────────────────────────────────────────────────────────────

export const sendQueryEmail = onCall(
  { secrets: [brevoApiKey, adminEmailSecret] },
  async (request) => {
    const data = request.data;
    requireFields(data, ["email", "name", "ticketNumber"]);

    const emailData: EmailData = {
      email: data.email,
      name: data.name,
      subject: "We Have Received Your Query",
      preview: "Our support team is here to help.",
      status: "Open",
      message: "Thank you for contacting Path Sarthi Trust.",
      additionalMessage: "Our support team is reviewing your query and will respond as soon as possible.",
      referenceId: data.ticketNumber,
      date: today(),
      emailType: EmailType.QUERY,
    };

    try {
      await sendEmail(brevoApiKey.value(), emailData);
      await sendAdminNotification(
        brevoApiKey.value(),
        adminEmailSecret.value(),
        "Query",
        data.ticketNumber
      );
      return { success: true };
    } catch (error: any) {
      console.error("Error in sendQueryEmail:", error);
      throw new HttpsError("internal", error?.message || "Failed to send query email.");
    }
  }
);

// ─── 8. Certificate ──────────────────────────────────────────────────────────

export const sendCertificateEmail = onCall(
  { secrets: [brevoApiKey] },
  async (request) => {
    const data = request.data;
    requireFields(data, ["email", "name", "certificateNumber", "certificateType"]);

    const emailData: EmailData = {
      email: data.email,
      name: data.name,
      subject: "Your Certificate Has Been Issued",
      preview: "Your certificate is now ready.",
      status: "Certificate Generated",
      message: "Congratulations.\n\nYour certificate has been successfully generated by Path Sarthi Trust.",
      additionalMessage: "Please download your certificate using the provided link or attachment.",
      referenceId: data.certificateNumber,
      date: today(),
      emailType: EmailType.CERTIFICATE,
      certificateType: data.certificateType, // e.g. "Appreciation Certificate", "Recognition Certificate"
    };

    try {
      await sendEmail(brevoApiKey.value(), emailData);
      return { success: true };
    } catch (error: any) {
      console.error("Error in sendCertificateEmail:", error);
      throw new HttpsError("internal", error?.message || "Failed to send certificate email.");
    }
  }
);

// ─── 9. Firestore Trigger: New Application ───────────────────────────────────

export const sendEmailOnNewApplication = onDocumentCreated(
  { document: "applications/{id}", secrets: [brevoApiKey, adminEmailSecret] },
  async (event) => {
    const snap = event.data;
    if (!snap) return;

    const data = snap.data();
    if (!data) return;

    const docId = event.params.id;

    try {
      await sendAdminNotification(
        brevoApiKey.value(),
        adminEmailSecret.value(),
        "Application",
        docId
      );
      console.log(`[Admin Notification] Sent for application ${docId}`);
    } catch (error) {
      console.error(`[Admin Notification] Failed for application ${docId}:`, error);
    }
  }
);
