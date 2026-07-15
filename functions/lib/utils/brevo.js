"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendAdminNotification = exports.sendEmail = exports.EmailType = exports.BREVO_CONFIG = exports.adminEmailSecret = exports.brevoApiKey = void 0;
const brevo = __importStar(require("@getbrevo/brevo"));
const params_1 = require("firebase-functions/params");
const admin = __importStar(require("firebase-admin"));
// ─── Secrets ─────────────────────────────────────────────────────────────────
exports.brevoApiKey = (0, params_1.defineSecret)("BREVO_API_KEY");
exports.adminEmailSecret = (0, params_1.defineSecret)("ADMIN_EMAIL");
// ─── Configurable Constants ──────────────────────────────────────────────────
exports.BREVO_CONFIG = {
    MASTER_TEMPLATE_ID: 3,
};
// ─── Centralized Email Types ─────────────────────────────────────────────────
var EmailType;
(function (EmailType) {
    EmailType["DONATION"] = "DONATION";
    EmailType["SPONSOR"] = "SPONSOR";
    EmailType["MEMBERSHIP"] = "MEMBERSHIP";
    EmailType["PREMIUM_MEMBERSHIP"] = "PREMIUM_MEMBERSHIP";
    EmailType["JAN_SAMPARK"] = "JAN_SAMPARK";
    EmailType["INTERNSHIP"] = "INTERNSHIP";
    EmailType["QUERY"] = "QUERY";
    EmailType["CERTIFICATE"] = "CERTIFICATE";
    EmailType["ADMIN"] = "ADMIN";
})(EmailType = exports.EmailType || (exports.EmailType = {}));
// ─── Reusable Email Helper ───────────────────────────────────────────────────
/**
 * Validates the core required fields for an email payload
 */
const validateEmailData = (data) => {
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
const sendEmail = async (apiKey, data) => {
    var _a, _b;
    // Validate request parameters first
    validateEmailData(data);
    const apiInstance = new brevo.TransactionalEmailsApi();
    apiInstance.setApiKey(brevo.TransactionalEmailsApiApiKeys.apiKey, apiKey);
    const payload = {
        templateId: exports.BREVO_CONFIG.MASTER_TEMPLATE_ID,
        to: [{ email: data.email, name: data.name }],
        params: {
            name: data.name,
            subject: data.subject,
            preview: data.preview,
            message: data.message,
            referenceId: data.referenceId,
            status: data.status,
            date: data.date,
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
        console.log(`[Brevo Email Sent]\n` +
            `Type: ${data.emailType}\n` +
            `Recipient: ${data.email}\n` +
            `Reference: ${data.referenceId}\n` +
            `Status: Sent (HTTP ${result.response.statusCode})`);
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
        }
        catch (dbError) {
            console.error("[Firestore Log Failed] Failed to record email log to database:", dbError);
        }
        return result;
    }
    catch (error) {
        const errorMessage = ((_b = (_a = error === null || error === void 0 ? void 0 : error.response) === null || _a === void 0 ? void 0 : _a.body) === null || _b === void 0 ? void 0 : _b.message) || (error === null || error === void 0 ? void 0 : error.message) || "Unknown Brevo API error";
        // Structured FAILURE Log (Console)
        console.error(`[Brevo Email Failed]\n` +
            `Type: ${data.emailType}\n` +
            `Recipient: ${data.email}\n` +
            `Reference: ${data.referenceId}\n` +
            `Reason: ${errorMessage}`);
        // Write Failure Log to Firestore
        try {
            await admin.firestore().collection("emailLogs").add({
                recipient: data.email,
                emailType: data.emailType,
                subject: data.subject,
                referenceId: data.referenceId,
                status: "failed",
                sentAt: admin.firestore.FieldValue.serverTimestamp(),
                error: errorMessage,
            });
        }
        catch (dbError) {
            console.error("[Firestore Log Failed] Failed to record failure email log to database:", dbError);
        }
        throw error;
    }
};
exports.sendEmail = sendEmail;
// ─── Admin Notification Helper ───────────────────────────────────────────────
const sendAdminNotification = async (apiKey, adminEmailAddress, formType, referenceId) => {
    const todayStr = new Date().toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "long",
        year: "numeric",
    });
    const adminName = "Path Sarthi Admin";
    await (0, exports.sendEmail)(apiKey, {
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
exports.sendAdminNotification = sendAdminNotification;
//# sourceMappingURL=brevo.js.map