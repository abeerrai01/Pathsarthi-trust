"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendEmailOnNewApplication = exports.onNewVolunteer = exports.onNewCertificate = exports.sendCertificateEmail = exports.onNewQuery = exports.sendQueryEmail = exports.onNewInternship = exports.sendInternshipEmail = exports.onNewJanSampark = exports.sendJanSamparkEmail = exports.onNewMembership = exports.sendPremiumMembershipEmail = exports.sendMembershipEmail = exports.onNewSponsor = exports.sendSponsorEmail = exports.onNewDonation = exports.sendDonationEmail = void 0;
const firestore_1 = require("firebase-functions/v2/firestore");
const https_1 = require("firebase-functions/v2/https");
const brevo_1 = require("../utils/brevo");
// ─── Helpers ─────────────────────────────────────────────────────────────────
/** Returns today's date formatted as "16 July 2026" */
const today = () => new Date().toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "long",
    year: "numeric",
});
/** Validates that required fields are present in a callable request */
const requireFields = (data, fields) => {
    const missing = fields.filter((f) => !data || !data[f] || (typeof data[f] === "string" && !data[f].trim()));
    if (missing.length > 0) {
        throw new https_1.HttpsError("invalid-argument", `Missing required fields: ${missing.join(", ")}`);
    }
};
// ─── 1. Donation Triggers ───────────────────────────────────────────────────
exports.sendDonationEmail = (0, https_1.onCall)({ secrets: [brevo_1.brevoApiKey, brevo_1.adminEmailSecret] }, async (request) => {
    const data = request.data;
    requireFields(data, ["email", "name", "transactionId"]);
    const emailData = {
        email: data.email,
        name: data.name,
        subject: "Thank You for Supporting Path Sarthi Trust",
        preview: "Your contribution is helping us create meaningful change.",
        status: "Donation Successful",
        message: "Thank you for your generous contribution to Path Sarthi Trust. Your support enables us to continue working towards education, youth empowerment, community welfare, and social development.",
        additionalMessage: "Your donation has been recorded successfully. If applicable, your receipt and future updates regarding our initiatives will be shared with you.",
        referenceId: data.transactionId,
        date: today(),
        emailType: brevo_1.EmailType.DONATION,
    };
    try {
        await (0, brevo_1.sendEmail)(brevo_1.brevoApiKey.value(), emailData);
        await (0, brevo_1.sendAdminNotification)(brevo_1.brevoApiKey.value(), brevo_1.adminEmailSecret.value(), "Donation", data.transactionId);
        return { success: true };
    }
    catch (error) {
        console.error("Error in sendDonationEmail:", error);
        throw new https_1.HttpsError("internal", (error === null || error === void 0 ? void 0 : error.message) || "Failed to send donation email.");
    }
});
exports.onNewDonation = (0, firestore_1.onDocumentCreated)({ document: "donations/{id}", secrets: [brevo_1.brevoApiKey, brevo_1.adminEmailSecret] }, async (event) => {
    const snap = event.data;
    if (!snap)
        return;
    const data = snap.data();
    if (!data)
        return;
    const docId = event.params.id;
    const email = data.email || "";
    const name = data.name || "Donor";
    const amount = data.amount || "Donation";
    const refId = data.paymentId || docId;
    try {
        if (email && email.includes("@")) {
            await (0, brevo_1.sendEmail)(brevo_1.brevoApiKey.value(), {
                email,
                name,
                subject: "Thank You for Supporting Path Sarthi Trust",
                preview: "Your contribution is helping us create meaningful change.",
                status: "Donation Successful",
                message: "Thank you for your generous contribution to Path Sarthi Trust. Your support enables us to continue working towards education, youth empowerment, community welfare, and social development.",
                additionalMessage: `Your donation of ₹${amount} has been recorded successfully. If applicable, your receipt and future updates regarding our initiatives will be shared with you.`,
                referenceId: refId,
                date: today(),
                emailType: brevo_1.EmailType.DONATION,
            });
        }
        else {
            console.log(`[onNewDonation] Skipped donor email: no email address present in document ${docId}`);
        }
        // Always notify admin
        await (0, brevo_1.sendAdminNotification)(brevo_1.brevoApiKey.value(), brevo_1.adminEmailSecret.value(), "Donation", refId);
    }
    catch (error) {
        console.error(`[onNewDonation] Error processing trigger for ${docId}:`, error);
    }
});
// ─── 2. Sponsor Triggers ────────────────────────────────────────────────────
exports.sendSponsorEmail = (0, https_1.onCall)({ secrets: [brevo_1.brevoApiKey, brevo_1.adminEmailSecret] }, async (request) => {
    const data = request.data;
    requireFields(data, ["email", "name", "requestId"]);
    const emailData = {
        email: data.email,
        name: data.name,
        subject: "Sponsorship Request Received",
        preview: "Thank you for choosing to support our mission.",
        status: "Request Received",
        message: "We have successfully received your sponsorship request. We sincerely appreciate your willingness to partner with Path Sarthi Trust.",
        additionalMessage: "Our team will carefully review your submission and contact you shortly to discuss the next steps.",
        referenceId: data.requestId,
        date: today(),
        emailType: brevo_1.EmailType.SPONSOR,
    };
    try {
        await (0, brevo_1.sendEmail)(brevo_1.brevoApiKey.value(), emailData);
        await (0, brevo_1.sendAdminNotification)(brevo_1.brevoApiKey.value(), brevo_1.adminEmailSecret.value(), "Sponsor", data.requestId);
        return { success: true };
    }
    catch (error) {
        console.error("Error in sendSponsorEmail:", error);
        throw new https_1.HttpsError("internal", (error === null || error === void 0 ? void 0 : error.message) || "Failed to send sponsor email.");
    }
});
exports.onNewSponsor = (0, firestore_1.onDocumentCreated)({ document: "csr_partnerships/{id}", secrets: [brevo_1.brevoApiKey, brevo_1.adminEmailSecret] }, async (event) => {
    const snap = event.data;
    if (!snap)
        return;
    const data = snap.data();
    if (!data)
        return;
    const docId = event.params.id;
    const name = data.contactPerson || data.companyName || "Sponsor";
    // Check if contactInfo contains email format
    const contactInfo = data.contactInfo || "";
    const email = contactInfo.includes("@") ? contactInfo : "";
    try {
        if (email) {
            await (0, brevo_1.sendEmail)(brevo_1.brevoApiKey.value(), {
                email,
                name,
                subject: "Sponsorship Request Received",
                preview: "Thank you for choosing to support our mission.",
                status: "Request Received",
                message: "We have successfully received your sponsorship request. We sincerely appreciate your willingness to partner with Path Sarthi Trust.",
                additionalMessage: "Our team will carefully review your submission and contact you shortly to discuss the next steps.",
                referenceId: docId,
                date: today(),
                emailType: brevo_1.EmailType.SPONSOR,
            });
        }
        else {
            console.log(`[onNewSponsor] Skipped sponsor email: no valid email address in contactInfo for document ${docId}`);
        }
        // Always notify admin
        await (0, brevo_1.sendAdminNotification)(brevo_1.brevoApiKey.value(), brevo_1.adminEmailSecret.value(), "Sponsor", docId);
    }
    catch (error) {
        console.error(`[onNewSponsor] Error processing trigger for ${docId}:`, error);
    }
});
// ─── 3. Membership / Premium Membership Triggers ─────────────────────────────
exports.sendMembershipEmail = (0, https_1.onCall)({ secrets: [brevo_1.brevoApiKey, brevo_1.adminEmailSecret] }, async (request) => {
    const data = request.data;
    requireFields(data, ["email", "name", "membershipId"]);
    const emailData = {
        email: data.email,
        name: data.name,
        subject: "Membership Application Received",
        preview: "Thank you for joining Path Sarthi Trust.",
        status: "Application Received",
        message: "Your membership application has been successfully submitted.",
        additionalMessage: "Our team is currently reviewing your application and will update you as soon as the verification process is completed.",
        referenceId: data.membershipId,
        date: today(),
        emailType: brevo_1.EmailType.MEMBERSHIP,
    };
    try {
        await (0, brevo_1.sendEmail)(brevo_1.brevoApiKey.value(), emailData);
        await (0, brevo_1.sendAdminNotification)(brevo_1.brevoApiKey.value(), brevo_1.adminEmailSecret.value(), "Membership", data.membershipId);
        return { success: true };
    }
    catch (error) {
        console.error("Error in sendMembershipEmail:", error);
        throw new https_1.HttpsError("internal", (error === null || error === void 0 ? void 0 : error.message) || "Failed to send membership email.");
    }
});
exports.sendPremiumMembershipEmail = (0, https_1.onCall)({ secrets: [brevo_1.brevoApiKey, brevo_1.adminEmailSecret] }, async (request) => {
    const data = request.data;
    requireFields(data, ["email", "name", "membershipId"]);
    const emailData = {
        email: data.email,
        name: data.name,
        subject: "Premium Membership Application Received",
        preview: "Thank you for becoming part of our mission.",
        status: "Application Under Review",
        message: "Your premium membership application has been successfully received.",
        additionalMessage: "Our team will verify your application and communicate the next steps shortly.",
        referenceId: data.membershipId,
        date: today(),
        emailType: brevo_1.EmailType.PREMIUM_MEMBERSHIP,
    };
    try {
        await (0, brevo_1.sendEmail)(brevo_1.brevoApiKey.value(), emailData);
        await (0, brevo_1.sendAdminNotification)(brevo_1.brevoApiKey.value(), brevo_1.adminEmailSecret.value(), "Premium Membership", data.membershipId);
        return { success: true };
    }
    catch (error) {
        console.error("Error in sendPremiumMembershipEmail:", error);
        throw new https_1.HttpsError("internal", (error === null || error === void 0 ? void 0 : error.message) || "Failed to send premium membership email.");
    }
});
exports.onNewMembership = (0, firestore_1.onDocumentCreated)({ document: "memberships/{id}", secrets: [brevo_1.brevoApiKey, brevo_1.adminEmailSecret] }, async (event) => {
    const snap = event.data;
    if (!snap)
        return;
    const data = snap.data();
    if (!data)
        return;
    const docId = event.params.id;
    const email = data.email || "";
    const name = data.fullName || data.name || "Member";
    // Distinguish standard vs premium based on amount being set (premium is custom >= 500, standard is not saved or 201)
    const isPremium = data.amount && Number(data.amount) >= 500;
    try {
        if (email && email.includes("@")) {
            if (isPremium) {
                await (0, brevo_1.sendEmail)(brevo_1.brevoApiKey.value(), {
                    email,
                    name,
                    subject: "Premium Membership Application Received",
                    preview: "Thank you for becoming part of our mission.",
                    status: "Application Under Review",
                    message: "Your premium membership application has been successfully received.",
                    additionalMessage: "Our team will verify your application and communicate the next steps shortly.",
                    referenceId: docId,
                    date: today(),
                    emailType: brevo_1.EmailType.PREMIUM_MEMBERSHIP,
                });
            }
            else {
                await (0, brevo_1.sendEmail)(brevo_1.brevoApiKey.value(), {
                    email,
                    name,
                    subject: "Membership Application Received",
                    preview: "Thank you for joining Path Sarthi Trust.",
                    status: "Application Received",
                    message: "Your membership application has been successfully submitted.",
                    additionalMessage: "Our team is currently reviewing your application and will update you as soon as the verification process is completed.",
                    referenceId: docId,
                    date: today(),
                    emailType: brevo_1.EmailType.MEMBERSHIP,
                });
            }
        }
        else {
            console.log(`[onNewMembership] Skipped member email: no email address present in document ${docId}`);
        }
        // Always notify admin
        await (0, brevo_1.sendAdminNotification)(brevo_1.brevoApiKey.value(), brevo_1.adminEmailSecret.value(), isPremium ? "Premium Membership" : "Membership", docId);
    }
    catch (error) {
        console.error(`[onNewMembership] Error processing trigger for ${docId}:`, error);
    }
});
// ─── 4. Jan Sampark Triggers ────────────────────────────────────────────────
exports.sendJanSamparkEmail = (0, https_1.onCall)({ secrets: [brevo_1.brevoApiKey, brevo_1.adminEmailSecret] }, async (request) => {
    const data = request.data;
    requireFields(data, ["email", "name", "requestId"]);
    const emailData = {
        email: data.email,
        name: data.name,
        subject: "Your Request Has Been Received",
        preview: "Thank you for reaching out to Path Sarthi Trust.",
        status: "Request Received",
        message: "Thank you for contacting us through Jan Sampark.",
        additionalMessage: "Our team is reviewing your request and will get back to you as soon as possible.",
        referenceId: data.requestId,
        date: today(),
        emailType: brevo_1.EmailType.JAN_SAMPARK,
    };
    try {
        await (0, brevo_1.sendEmail)(brevo_1.brevoApiKey.value(), emailData);
        await (0, brevo_1.sendAdminNotification)(brevo_1.brevoApiKey.value(), brevo_1.adminEmailSecret.value(), "Jan Sampark", data.requestId);
        return { success: true };
    }
    catch (error) {
        console.error("Error in sendJanSamparkEmail:", error);
        throw new https_1.HttpsError("internal", (error === null || error === void 0 ? void 0 : error.message) || "Failed to send Jan Sampark email.");
    }
});
exports.onNewJanSampark = (0, firestore_1.onDocumentCreated)({ document: "jan_sampark/{id}", secrets: [brevo_1.brevoApiKey, brevo_1.adminEmailSecret] }, async (event) => {
    const snap = event.data;
    if (!snap)
        return;
    const data = snap.data();
    if (!data)
        return;
    const docId = event.params.id;
    const email = data.email || "";
    const name = data.fullName || data.name || "User";
    try {
        if (email && email.includes("@")) {
            await (0, brevo_1.sendEmail)(brevo_1.brevoApiKey.value(), {
                email,
                name,
                subject: "Your Request Has Been Received",
                preview: "Thank you for reaching out to Path Sarthi Trust.",
                status: "Request Received",
                message: "Thank you for contacting us through Jan Sampark.",
                additionalMessage: "Our team is reviewing your request and will get back to you as soon as possible.",
                referenceId: docId,
                date: today(),
                emailType: brevo_1.EmailType.JAN_SAMPARK,
            });
        }
        else {
            console.log(`[onNewJanSampark] Skipped user email: no email address present in document ${docId}`);
        }
        // Always notify admin
        await (0, brevo_1.sendAdminNotification)(brevo_1.brevoApiKey.value(), brevo_1.adminEmailSecret.value(), "Jan Sampark", docId);
    }
    catch (error) {
        console.error(`[onNewJanSampark] Error processing trigger for ${docId}:`, error);
    }
});
// ─── 5. Internship Triggers ─────────────────────────────────────────────────
exports.sendInternshipEmail = (0, https_1.onCall)({ secrets: [brevo_1.brevoApiKey, brevo_1.adminEmailSecret] }, async (request) => {
    const data = request.data;
    requireFields(data, ["email", "name", "applicationId"]);
    const emailData = {
        email: data.email,
        name: data.name,
        subject: "Internship Application Received",
        preview: "Thank you for applying.",
        status: "Application Received",
        message: "Your internship application has been successfully submitted.",
        additionalMessage: "Our recruitment team will review your profile and notify you regarding further steps.",
        referenceId: data.applicationId,
        date: today(),
        emailType: brevo_1.EmailType.INTERNSHIP,
    };
    try {
        await (0, brevo_1.sendEmail)(brevo_1.brevoApiKey.value(), emailData);
        await (0, brevo_1.sendAdminNotification)(brevo_1.brevoApiKey.value(), brevo_1.adminEmailSecret.value(), "Internship", data.applicationId);
        return { success: true };
    }
    catch (error) {
        console.error("Error in sendInternshipEmail:", error);
        throw new https_1.HttpsError("internal", (error === null || error === void 0 ? void 0 : error.message) || "Failed to send internship email.");
    }
});
exports.onNewInternship = (0, firestore_1.onDocumentCreated)({ document: "internship_applications/{id}", secrets: [brevo_1.brevoApiKey, brevo_1.adminEmailSecret] }, async (event) => {
    const snap = event.data;
    if (!snap)
        return;
    const data = snap.data();
    if (!data)
        return;
    const docId = event.params.id;
    const email = data.email || "";
    const name = data.name || "Applicant";
    try {
        if (email && email.includes("@")) {
            await (0, brevo_1.sendEmail)(brevo_1.brevoApiKey.value(), {
                email,
                name,
                subject: "Internship Application Received",
                preview: "Thank you for applying.",
                status: "Application Received",
                message: "Your internship application has been successfully submitted.",
                additionalMessage: "Our recruitment team will review your profile and notify you regarding further steps.",
                referenceId: docId,
                date: today(),
                emailType: brevo_1.EmailType.INTERNSHIP,
            });
        }
        else {
            console.log(`[onNewInternship] Skipped applicant email: no email address present in document ${docId}`);
        }
        // Always notify admin
        await (0, brevo_1.sendAdminNotification)(brevo_1.brevoApiKey.value(), brevo_1.adminEmailSecret.value(), "Internship", docId);
    }
    catch (error) {
        console.error(`[onNewInternship] Error processing trigger for ${docId}:`, error);
    }
});
// ─── 6. Query Bot Triggers ──────────────────────────────────────────────────
exports.sendQueryEmail = (0, https_1.onCall)({ secrets: [brevo_1.brevoApiKey, brevo_1.adminEmailSecret] }, async (request) => {
    const data = request.data;
    requireFields(data, ["email", "name", "ticketNumber"]);
    const emailData = {
        email: data.email,
        name: data.name,
        subject: "We Have Received Your Query",
        preview: "Our support team is here to help.",
        status: "Open",
        message: "Thank you for contacting Path Sarthi Trust.",
        additionalMessage: "Our support team is reviewing your query and will respond as soon as possible.",
        referenceId: data.ticketNumber,
        date: today(),
        emailType: brevo_1.EmailType.QUERY,
    };
    try {
        await (0, brevo_1.sendEmail)(brevo_1.brevoApiKey.value(), emailData);
        await (0, brevo_1.sendAdminNotification)(brevo_1.brevoApiKey.value(), brevo_1.adminEmailSecret.value(), "Query", data.ticketNumber);
        return { success: true };
    }
    catch (error) {
        console.error("Error in sendQueryEmail:", error);
        throw new https_1.HttpsError("internal", (error === null || error === void 0 ? void 0 : error.message) || "Failed to send query email.");
    }
});
exports.onNewQuery = (0, firestore_1.onDocumentCreated)({ document: "queries/{id}", secrets: [brevo_1.brevoApiKey, brevo_1.adminEmailSecret] }, async (event) => {
    const snap = event.data;
    if (!snap)
        return;
    const data = snap.data();
    if (!data)
        return;
    const docId = event.params.id;
    const email = data.email || "";
    const name = data.name || "User";
    try {
        if (email && email.includes("@")) {
            await (0, brevo_1.sendEmail)(brevo_1.brevoApiKey.value(), {
                email,
                name,
                subject: "We Have Received Your Query",
                preview: "Our support team is here to help.",
                status: "Open",
                message: "Thank you for contacting Path Sarthi Trust.",
                additionalMessage: "Our support team is reviewing your query and will respond as soon as possible.",
                referenceId: docId,
                date: today(),
                emailType: brevo_1.EmailType.QUERY,
            });
        }
        else {
            console.log(`[onNewQuery] Skipped user email: no email address present in document ${docId}`);
        }
        // Always notify admin
        await (0, brevo_1.sendAdminNotification)(brevo_1.brevoApiKey.value(), brevo_1.adminEmailSecret.value(), "Query", docId);
    }
    catch (error) {
        console.error(`[onNewQuery] Error processing trigger for ${docId}:`, error);
    }
});
// ─── 7. Certificate Triggers ────────────────────────────────────────────────
exports.sendCertificateEmail = (0, https_1.onCall)({ secrets: [brevo_1.brevoApiKey] }, async (request) => {
    const data = request.data;
    requireFields(data, ["email", "name", "certificateNumber", "certificateType"]);
    const emailData = {
        email: data.email,
        name: data.name,
        subject: "Your Certificate Has Been Issued",
        preview: "Your certificate is now ready.",
        status: "Certificate Generated",
        message: "Congratulations.\n\nYour certificate has been successfully generated by Path Sarthi Trust.",
        additionalMessage: "Please download your certificate using the provided link or attachment.",
        referenceId: data.certificateNumber,
        date: today(),
        emailType: brevo_1.EmailType.CERTIFICATE,
        certificateType: data.certificateType,
    };
    try {
        await (0, brevo_1.sendEmail)(brevo_1.brevoApiKey.value(), emailData);
        return { success: true };
    }
    catch (error) {
        console.error("Error in sendCertificateEmail:", error);
        throw new https_1.HttpsError("internal", (error === null || error === void 0 ? void 0 : error.message) || "Failed to send certificate email.");
    }
});
exports.onNewCertificate = (0, firestore_1.onDocumentCreated)({ document: "certificates/{id}", secrets: [brevo_1.brevoApiKey] }, async (event) => {
    const snap = event.data;
    if (!snap)
        return;
    const data = snap.data();
    if (!data)
        return;
    const docId = event.params.id;
    const email = data.email || "";
    const name = data.name || "Recipient";
    const certType = data.type || "Certificate";
    try {
        if (email && email.includes("@")) {
            await (0, brevo_1.sendEmail)(brevo_1.brevoApiKey.value(), {
                email,
                name,
                subject: "Your Certificate Has Been Issued",
                preview: "Your certificate is now ready.",
                status: "Certificate Generated",
                message: `Congratulations.\n\nYour certificate has been successfully generated by Path Sarthi Trust.`,
                additionalMessage: `Please download your certificate using the following link:\n${data.certificateUrl || ""}`,
                referenceId: data.certificateNumber || docId,
                date: today(),
                emailType: brevo_1.EmailType.CERTIFICATE,
                certificateType: certType,
                certificateUrl: data.certificateUrl || "",
            });
        }
        else {
            console.log(`[onNewCertificate] Skipped certificate email: no email address present in document ${docId}`);
        }
    }
    catch (error) {
        console.error(`[onNewCertificate] Error processing trigger for ${docId}:`, error);
    }
});
// ─── 8. Volunteer Welcome Trigger ───────────────────────────────────────────
exports.onNewVolunteer = (0, firestore_1.onDocumentCreated)({ document: "joinus_registrations/{id}", secrets: [brevo_1.brevoApiKey, brevo_1.adminEmailSecret] }, async (event) => {
    const snap = event.data;
    if (!snap)
        return;
    const data = snap.data();
    if (!data)
        return;
    const docId = event.params.id;
    const email = data.email || "";
    const name = data.name || "Volunteer";
    try {
        if (email && email.includes("@")) {
            await (0, brevo_1.sendEmail)(brevo_1.brevoApiKey.value(), {
                email,
                name,
                subject: "Welcome to Path Sarthi Trust",
                preview: "Thank you for choosing to volunteer with us.",
                status: "Welcome",
                message: "Thank you for registering as a volunteer with Path Sarthi Trust. We are excited to have you join our mission.",
                additionalMessage: "Our team will review your registration and get in touch with you shortly to coordinate onboarding.",
                referenceId: docId,
                date: today(),
                emailType: brevo_1.EmailType.MEMBERSHIP, // Map volunteer welcomes under MEMBERSHIP analytics
            });
        }
        else {
            console.log(`[onNewVolunteer] Skipped welcome email: no email address present in document ${docId}`);
        }
        // Always notify admin
        await (0, brevo_1.sendAdminNotification)(brevo_1.brevoApiKey.value(), brevo_1.adminEmailSecret.value(), "Volunteer", docId);
    }
    catch (error) {
        console.error(`[onNewVolunteer] Error processing trigger for ${docId}:`, error);
    }
});
// ─── 9. Education Support Application Trigger ────────────────────────────────
exports.sendEmailOnNewApplication = (0, firestore_1.onDocumentCreated)({ document: "applications/{id}", secrets: [brevo_1.brevoApiKey, brevo_1.adminEmailSecret] }, async (event) => {
    const snap = event.data;
    if (!snap)
        return;
    const data = snap.data();
    if (!data)
        return;
    const docId = event.params.id;
    try {
        await (0, brevo_1.sendAdminNotification)(brevo_1.brevoApiKey.value(), brevo_1.adminEmailSecret.value(), "Application", docId);
        console.log(`[Admin Notification] Sent for application ${docId}`);
    }
    catch (error) {
        console.error(`[Admin Notification] Failed for application ${docId}:`, error);
    }
});
//# sourceMappingURL=functions.js.map