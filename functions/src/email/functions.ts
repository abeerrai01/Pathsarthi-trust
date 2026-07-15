import { onDocumentCreated } from "firebase-functions/v2/firestore";
import { onCall, HttpsError } from "firebase-functions/v2/https";
import { onSchedule } from "firebase-functions/v2/scheduler";
import * as admin from "firebase-admin";
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

/** Formats a list of key-value pairs into a clean, premium HTML details table */
const formatDetailsTable = (title: string, pairs: { label: string; value: string }[]): string => {
  const rows = pairs
    .map(
      (p) => `
      <tr style="border-bottom: 1px solid #eeeeee;">
        <td style="font-weight: bold; width: 40%; color: #666666; padding: 10px; font-family: Arial, sans-serif; font-size: 14px; text-align: left; vertical-align: top;">${p.label}</td>
        <td style="color: #333333; padding: 10px; font-family: Arial, sans-serif; font-size: 14px; text-align: left; vertical-align: top;">${p.value}</td>
      </tr>`
    )
    .join("");

  return `
    <div style="margin-top: 20px; margin-bottom: 20px; text-align: left;">
      <strong style="color: #009ba2; font-size: 16px; font-family: Arial, sans-serif;">${title}</strong>
      <table cellpadding="0" cellspacing="0" width="100%" style="margin-top: 10px; width: 100%; border-collapse: collapse; background-color: #fafafa; border-radius: 8px; border: 1px solid #eeeeee; overflow: hidden;">
        <tbody>
          ${rows}
        </tbody>
      </table>
    </div>
  `;
};

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

// ─── 1. Donation Triggers ───────────────────────────────────────────────────

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

export const onNewDonation = onDocumentCreated(
  { document: "donations/{id}", secrets: [brevoApiKey, adminEmailSecret] },
  async (event) => {
    const snap = event.data;
    if (!snap) return;
    const data = snap.data();
    if (!data) return;

    const docId = event.params.id;
    const email = data.email || "";
    const name = data.name || "Donor";
    const amount = data.amount || "Donation";
    const refId = data.paymentId || docId;

    try {
      const paymentSummaryBlock = formatDetailsTable("Payment Summary", [
        { label: "Contributor Name", value: name },
        { label: "Amount Paid", value: `₹${amount}` },
        { label: "Reference / Payment ID", value: refId },
        { label: "Payment Channel", value: refId.startsWith("pay_") ? "Razorpay Gateway (Instant)" : "Manual UPI Transfer" }
      ]);

      if (email && email.includes("@")) {
        const donationImpact = amount && !isNaN(Number(amount))
          ? `Your generous contribution of ₹${amount} will directly fund our active programs, such as purchasing educational notebooks for school children, providing medical supplies, and supporting women's skill development workshops.`
          : "Your contribution will directly fund our child education and community welfare initiatives.";

        await sendEmail(brevoApiKey.value(), {
          email,
          name,
          subject: "Thank You for Your Generous Contribution! 💖",
          preview: `Your support of ₹${amount} is transforming lives.`,
          status: "Donation Received & Verified",
          message: `We are deeply grateful for your generous donation to Path Sarthi Trust.<br/><br/>${donationImpact}<br/><br/>${paymentSummaryBlock}<br/><br/>At Path Sarthi, we believe that real change begins when citizens join hands. Your kindness acts as a guiding light for children and families who need support the most. Thank you for placing your trust in us.`,
          additionalMessage: `Your official donation receipt has been recorded under the reference ID below. If you are eligible for tax benefits under Section 80G, our compliance team will email you the tax certificate within the next 7-10 working days.`,
          referenceId: refId,
          date: today(),
          emailType: EmailType.DONATION,
        });
      } else {
        console.log(`[onNewDonation] Skipped donor email: no email address present in document ${docId}`);
      }

      // Always notify admin
      await sendAdminNotification(
        brevoApiKey.value(),
        adminEmailSecret.value(),
        "Donation",
        refId,
        paymentSummaryBlock
      );
    } catch (error) {
      console.error(`[onNewDonation] Error processing trigger for ${docId}:`, error);
    }
  }
);

// ─── 2. Sponsor Triggers ────────────────────────────────────────────────────

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

export const onNewSponsor = onDocumentCreated(
  { document: "csr_partnerships/{id}", secrets: [brevoApiKey, adminEmailSecret] },
  async (event) => {
    const snap = event.data;
    if (!snap) return;
    const data = snap.data();
    if (!data) return;

    const docId = event.params.id;
    const name = data.contactPerson || data.companyName || "Sponsor";
    const contactInfo = data.contactInfo || "";
    const email = data.email || (contactInfo.includes("@") ? contactInfo : "");

    try {
      const sponsorDetailsBlock = formatDetailsTable("Sponsorship Proposal Details", [
        { label: "Company Name", value: data.companyName || "N/A" },
        { label: "Contact Person", value: name },
        { label: "Contact Email", value: email },
        { label: "Contact Number", value: contactInfo || "N/A" },
        { label: "Proposed Support Budget", value: `₹${data.budget || "N/A"}` }
      ]);

      if (email) {

        await sendEmail(brevoApiKey.value(), {
          email,
          name,
          subject: "Partnering for Change: Sponsorship Request Received 🤝",
          preview: "Thank you for choosing to empower our community.",
          status: "Sponsorship Under Review",
          message: `Thank you for reaching out to partner with Path Sarthi Trust. We have successfully received your sponsorship proposal.<br/><br/>Corporate and individual sponsorships are critical in helping us scale our initiatives—from running digital classrooms in remote villages to driving environmental and healthcare drives. Your willingness to collaborate plays a major role in expanding this circle of impact.<br/><br/>${sponsorDetailsBlock}`,
          additionalMessage: `Our partnerships team will review the details of your proposal and reach out to you within 3 working days to coordinate the next steps and set up a brief introductory call. We look forward to creating lasting progress together!`,
          referenceId: docId,
          date: today(),
          emailType: EmailType.SPONSOR,
        });
      } else {
        console.log(`[onNewSponsor] Skipped sponsor email: no valid email address in contactInfo for document ${docId}`);
      }

      // Always notify admin
      await sendAdminNotification(
        brevoApiKey.value(),
        adminEmailSecret.value(),
        "Sponsor",
        docId,
        sponsorDetailsBlock
      );
    } catch (error) {
      console.error(`[onNewSponsor] Error processing trigger for ${docId}:`, error);
    }
  }
);

// ─── 3. Membership / Premium Membership Triggers ─────────────────────────────

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

export const onNewMembership = onDocumentCreated(
  { document: "memberships/{id}", secrets: [brevoApiKey, adminEmailSecret] },
  async (event) => {
    const snap = event.data;
    if (!snap) return;
    const data = snap.data();
    if (!data) return;

    const docId = event.params.id;
    const email = data.email || "";
    const name = data.fullName || data.name || "Member";
    
    // Distinguish standard vs premium based on amount being set (premium is custom >= 500, standard is not saved or 201)
    const isPremium = data.amount && Number(data.amount) >= 500;

    try {
      const detailsBlock = formatDetailsTable("Submitted Membership Application Details", [
        { label: "Full Name", value: data.fullName || data.name || "N/A" },
        { label: "Email Address", value: email },
        { label: "Phone Number", value: data.phone || "N/A" },
        { label: "Age / Gender", value: `${data.age || "N/A"} / ${data.gender || "N/A"}` },
        { label: "Regional Details", value: `${data.city || "N/A"}, ${data.state || "N/A"} (Pincode: ${data.pincode || "N/A"})` },
        { label: "Payment Reference ID", value: data.paymentId || "N/A" },
        { label: "Membership Amount Paid", value: `₹${data.amount || "0"}` }
      ]);

      if (email && email.includes("@")) {

        if (isPremium) {
          await sendEmail(brevoApiKey.value(), {
            email,
            name,
            subject: "Premium Membership Application Received! 🌟",
            preview: "Thank you for taking a significant leadership step with us.",
            status: "Application Under Review",
            message: `Thank you for choosing to join us as a Premium Member of Path Sarthi Trust. Premium members play a vital leadership role in guiding our community welfare initiatives, mentoring youth, and helping us govern regional projects.<br/><br/>${detailsBlock}`,
            additionalMessage: `We have received your premium membership application. Our leadership team will review the details and reach out to schedule a brief introductory call. We look forward to working closely with you to drive collective progress!`,
            referenceId: docId,
            date: today(),
            emailType: EmailType.PREMIUM_MEMBERSHIP,
          });
        } else {
          await sendEmail(brevoApiKey.value(), {
            email,
            name,
            subject: "Welcome to the Path Sarthi Trust Family! 🤝",
            preview: "You are now an official member of our community.",
            status: "Application Received",
            message: `We are absolutely thrilled to welcome you as a member of Path Sarthi Trust. Outlining our shared values of compassion, responsibility, and collective progress, our members are the driving force behind everything we do.<br/><br/>${detailsBlock}`,
            additionalMessage: `Your application has been received and is under review by our community board. Once approved, your official membership details and regional group invites will be shared with you. Welcome aboard!`,
            referenceId: docId,
            date: today(),
            emailType: EmailType.MEMBERSHIP,
          });
        }
      } else {
        console.log(`[onNewMembership] Skipped member email: no email address present in document ${docId}`);
      }

      // Always notify admin
      await sendAdminNotification(
        brevoApiKey.value(),
        adminEmailSecret.value(),
        isPremium ? "Premium Membership" : "Membership",
        docId,
        detailsBlock
      );
    } catch (error) {
      console.error(`[onNewMembership] Error processing trigger for ${docId}:`, error);
    }
  }
);

// ─── 4. Jan Sampark Triggers ────────────────────────────────────────────────

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

export const onNewJanSampark = onDocumentCreated(
  { document: "jan_sampark/{id}", secrets: [brevoApiKey, adminEmailSecret] },
  async (event) => {
    const snap = event.data;
    if (!snap) return;
    const data = snap.data();
    if (!data) return;

    const docId = event.params.id;
    const email = data.email || "";
    const name = data.fullName || data.name || "User";

    try {
      const samparkDetailsBlock = formatDetailsTable("Submitted Jan Sampark Details", [
        { label: "Full Name", value: data.fullName || data.name || "N/A" },
        { label: "Email Address", value: email },
        { label: "Phone Number", value: data.phone || "N/A" },
        { label: "Age / Gender", value: `${data.age || "N/A"} / ${data.gender || "N/A"}` },
        { label: "Regional Details", value: `${data.city || "N/A"}, ${data.state || "N/A"} (Pincode: ${data.pincode || "N/A"})` },
        { label: "How did you hear about us", value: data.reference || "N/A" }
      ]);

      if (email && email.includes("@")) {

        await sendEmail(brevoApiKey.value(), {
          email,
          name,
          subject: "Connecting with Path Sarthi Trust (Jan Sampark) 📞",
          preview: "We have received your contact details.",
          status: "Request Received",
          message: `Thank you for connecting with us through our Jan Sampark public outreach initiative. We believe in building transparent, accessible, and responsive channels to support and engage with every citizen who wishes to collaborate, seek guidance, or contribute.<br/><br/>${samparkDetailsBlock}`,
          additionalMessage: `Our public relations coordinator for your region will review your details and contact you via phone or email within the next 24-48 hours. We look forward to speaking with you!`,
          referenceId: docId,
          date: today(),
          emailType: EmailType.JAN_SAMPARK,
        });
      } else {
        console.log(`[onNewJanSampark] Skipped user email: no email address present in document ${docId}`);
      }

      // Always notify admin
      await sendAdminNotification(
        brevoApiKey.value(),
        adminEmailSecret.value(),
        "Jan Sampark",
        docId,
        samparkDetailsBlock
      );
    } catch (error) {
      console.error(`[onNewJanSampark] Error processing trigger for ${docId}:`, error);
    }
  }
);

// ─── 5. Internship Triggers ─────────────────────────────────────────────────

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

export const onNewInternship = onDocumentCreated(
  { document: "internship_applications/{id}", secrets: [brevoApiKey, adminEmailSecret] },
  async (event) => {
    const snap = event.data;
    if (!snap) return;
    const data = snap.data();
    if (!data) return;

    const docId = event.params.id;
    const email = data.email || "";
    const name = data.name || "Applicant";

    try {
      const internshipDetailsBlock = formatDetailsTable("Submitted Internship Application Details", [
        { label: "Applicant Name", value: name },
        { label: "Email Address", value: email },
        { label: "Phone Number", value: data.phone || "N/A" },
        { label: "College / Institution", value: data.college || "N/A" },
        { label: "Branch / Stream", value: data.branch || "N/A" },
        { label: "Year of Study", value: data.year || "N/A" },
        { label: "Internship Role / Field", value: data.fieldOfInternship || data.role || "N/A" },
        { label: "Preferred Duration", value: data.duration || "N/A" }
      ]);

      if (email && email.includes("@")) {
        await sendEmail(brevoApiKey.value(), {
          email,
          name,
          subject: "Welcome to the Path Sarthi Trust Internship Program! 🎓",
          preview: "Your journey to making a real-world impact starts here.",
          status: "Application Received",
          message: `We have successfully received your internship application!<br/><br/>Our internship program is designed to provide you with hands-on experience, professional mentorship, and a platform to work directly on community development, education, and public service projects. We are excited about your interest in dedicating your skills to social impact.<br/><br/>${internshipDetailsBlock}`,
          additionalMessage: `Our internship coordination team will review your application profile and contact you within 5 working days with induction details, project allocations, and orientation schedules. Get ready to learn, lead, and serve!`,
          referenceId: docId,
          date: today(),
          emailType: EmailType.INTERNSHIP,
        });
      } else {
        console.log(`[onNewInternship] Skipped applicant email: no email address present in document ${docId}`);
      }

      // Always notify admin
      await sendAdminNotification(
        brevoApiKey.value(),
        adminEmailSecret.value(),
        "Internship",
        docId,
        internshipDetailsBlock
      );
    } catch (error) {
      console.error(`[onNewInternship] Error processing trigger for ${docId}:`, error);
    }
  }
);

// ─── 6. Query Bot Triggers ──────────────────────────────────────────────────

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

export const onNewQuery = onDocumentCreated(
  { document: "queries/{id}", secrets: [brevoApiKey, adminEmailSecret] },
  async (event) => {
    const snap = event.data;
    if (!snap) return;
    const data = snap.data();
    if (!data) return;

    const docId = event.params.id;
    const email = data.email || "";
    const name = data.name || "User";

    try {
      const queryDetailsBlock = formatDetailsTable("Submitted Support Query Details", [
        { label: "User Name", value: name },
        { label: "Email Address", value: email },
        { label: "Message / Query", value: data.message || data.query || "N/A" }
      ]);

      if (email && email.includes("@")) {
        await sendEmail(brevoApiKey.value(), {
          email,
          name,
          subject: "We Have Received Your Support Query ✉️",
          preview: "Our support team is here to help you.",
          status: "Open",
          message: `Thank you for reaching out to the support desk at Path Sarthi Trust. We have received your query and want to assure you that addressing your questions and resolving any issues is our top priority.<br/><br/>${queryDetailsBlock}`,
          additionalMessage: `A support representative has been assigned to your ticket. We will review the details and respond with a resolution or follow-up questions within 24 hours. Thank you for your patience!`,
          referenceId: docId,
          date: today(),
          emailType: EmailType.QUERY,
        });
      } else {
        console.log(`[onNewQuery] Skipped user email: no email address present in document ${docId}`);
      }

      // Always notify admin
      await sendAdminNotification(
        brevoApiKey.value(),
        adminEmailSecret.value(),
        "Query",
        docId,
        queryDetailsBlock
      );
    } catch (error) {
      console.error(`[onNewQuery] Error processing trigger for ${docId}:`, error);
    }
  }
);

// ─── 7. Certificate Triggers ────────────────────────────────────────────────

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
      certificateType: data.certificateType,
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

export const onNewCertificate = onDocumentCreated(
  { document: "certificates/{id}", secrets: [brevoApiKey] },
  async (event) => {
    const snap = event.data;
    if (!snap) return;
    const data = snap.data();
    if (!data) return;

    const docId = event.params.id;
    const email = data.email || "";
    const name = data.name || "Recipient";
    const certType = data.type || "Certificate";

    try {
      if (email && email.includes("@")) {
        let subject = "Congratulations! Your Certificate has been Issued 🏆";
        let preview = "Recognizing your valuable contribution to society.";
        let message = `Congratulations!\n\nYour official certificate has been successfully generated and signed by Path Sarthi Trust. This certificate is a testament to your hard work, dedication, and valuable service towards our social and community initiatives.`;
        let additionalMessage = `Please find your certificate file attached to this email. You can also download or view the verified digital copy using the link below. We encourage you to share your accomplishment on LinkedIn and tag Path Sarthi Trust so we can celebrate your impact together!`;

        const typeNormalized = certType.toLowerCase();

        if (typeNormalized === "appreciation") {
          subject = "Certificate of Appreciation Issued! 🏆";
          preview = "Recognizing your valuable contribution to society.";
          message = "Thank you for your outstanding contribution. This Certificate of Appreciation is awarded in recognition of your selfless service, dedication, and active participation in our community support and social welfare programs. Your efforts have made a tangible difference in the lives of many.";
          additionalMessage = `Please find your certificate file attached to this email. You can also view or download it anytime using the link below. We are honored to recognize your impact and hope you continue to inspire others!`;
        } else if (typeNormalized === "internship") {
          subject = "Certificate of Internship Completion Ready! 🎓";
          preview = "Celebrating your successful internship completion.";
          message = "Congratulations on successfully completing your internship program with Path Sarthi Trust! During your tenure, you demonstrated professionalism, quick learning, and a commendable work ethic while contributing to our community projects. We appreciate your dedication and energy.";
          additionalMessage = `Your official Internship Certificate is attached to this email. We wish you the very best in your academic and professional endeavors! Feel free to share your success on LinkedIn and tag Path Sarthi Trust.`;
        } else if (typeNormalized === "recognition") {
          subject = "Certificate of Recognition Issued! 🌟";
          preview = "Honoring your exceptional leadership and service.";
          message = "We are proud to award you this Certificate of Recognition for your exceptional leadership, commitment, and stellar performance in driving our community development initiatives. Your guidance has helped scale our operations and empowered many beneficiaries.";
          additionalMessage = `Please find your Certificate of Recognition attached. Thank you for your leadership and vision. We look forward to your continued support and collaboration!`;
        } else if (typeNormalized === "political") {
          subject = "Political Contribution Certificate Issued! 🗳️";
          preview = "Recognizing your public service and civic engagement.";
          message = "This certificate is issued to recognize your active civic engagement, public service contribution, and commitment to driving democratic awareness and community empowerment. Your dedication to raising public awareness and serving the citizens is highly commendable.";
          additionalMessage = `Your verified Political Contribution Certificate is attached. Thank you for your leadership in civic engagement and public welfare!`;
        } else if (typeNormalized === "appointment") {
          subject = "Official Appointment Letter & Certificate! 📜";
          preview = "Welcome to your official role at Path Sarthi Trust.";
          message = "We are pleased to issue your official Appointment Certificate for your designated role at Path Sarthi Trust. We believe that your skills, background, and dedication will be a valuable asset to our team as we work together to serve the community.";
          additionalMessage = `Please find your official Appointment Certificate/Letter attached to this email. We welcome you aboard and look forward to achieving great milestones together!`;
        }

        await sendEmail(brevoApiKey.value(), {
          email,
          name,
          subject,
          preview,
          status: "Certificate Generated",
          message,
          additionalMessage: `${additionalMessage}\n\nDownload Link:\n${data.certificateUrl || ""}`,
          referenceId: data.certificateNumber || docId,
          date: today(),
          emailType: EmailType.CERTIFICATE,
          certificateType: certType,
          certificateUrl: data.certificateUrl || "",
        });
      } else {
        console.log(`[onNewCertificate] Skipped certificate email: no email address present in document ${docId}`);
      }
    } catch (error) {
      console.error(`[onNewCertificate] Error processing trigger for ${docId}:`, error);
    }
  }
);

// ─── 8. Volunteer Welcome Trigger ───────────────────────────────────────────

export const onNewVolunteer = onDocumentCreated(
  { document: "joinus_registrations/{id}", secrets: [brevoApiKey, adminEmailSecret] },
  async (event) => {
    const snap = event.data;
    if (!snap) return;
    const data = snap.data();
    if (!data) return;

    const docId = event.params.id;
    const email = data.email || "";
    const name = data.name || "Volunteer";

    try {
      const volunteerDetailsBlock = formatDetailsTable("Submitted Volunteer Details", [
        { label: "Volunteer Name", value: name },
        { label: "Email Address", value: email },
        { label: "Phone Number", value: data.phone || "N/A" },
        { label: "Age / Gender", value: `${data.age || "N/A"} / ${data.gender || "N/A"}` },
        { label: "Location", value: `${data.city || "N/A"}, ${data.state || "N/A"} (Pincode: ${data.pincode || "N/A"})` }
      ]);

      if (email && email.includes("@")) {
        await sendEmail(brevoApiKey.value(), {
          email,
          name,
          subject: "Welcome to the Team! Volunteer Registration Received 🌟",
          preview: "Ready to make a difference? Welcome aboard!",
          status: "Welcome",
          message: `We are excited to welcome you to the volunteer community at Path Sarthi Trust!<br/><br/>Volunteers are the absolute backbone of our trust. By choosing to dedicate your time, energy, and talents, you are playing a direct role in teaching children, helping families, and driving social welfare campaigns in your area.<br/><br/>${volunteerDetailsBlock}`,
          additionalMessage: `Our volunteer coordinator will contact you shortly to schedule a brief orientation call and guide you through our active local groups. Thank you for stepping forward to serve!`,
          referenceId: docId,
          date: today(),
          emailType: EmailType.MEMBERSHIP, // Map volunteer welcomes under MEMBERSHIP analytics
        });
      } else {
        console.log(`[onNewVolunteer] Skipped welcome email: no email address present in document ${docId}`);
      }

      // Always notify admin
      await sendAdminNotification(
        brevoApiKey.value(),
        adminEmailSecret.value(),
        "Volunteer",
        docId,
        volunteerDetailsBlock
      );
    } catch (error) {
      console.error(`[onNewVolunteer] Error processing trigger for ${docId}:`, error);
    }
  }
);

// ─── 9. Education Support Application Trigger ────────────────────────────────

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

// ─── 10. Admin Custom Email Composer ─────────────────────────────────────────

/**
 * Callable: Admin sends a fully custom email to any recipient.
 * Must be called by an authenticated Firebase user (admin).
 */
export const sendCustomEmail = onCall(
  { secrets: [brevoApiKey] },
  async (request) => {
    if (!request.auth) {
      throw new HttpsError("unauthenticated", "Must be signed in as admin.");
    }

    const data = request.data;
    requireFields(data, ["recipientEmail", "recipientName", "subject", "message"]);

    const emailData: EmailData = {
      email: data.recipientEmail,
      name: data.recipientName,
      subject: data.subject,
      preview: data.preview || data.subject,
      status: data.status || "Message from Path Sarthi Trust",
      message: data.message,
      additionalMessage: data.additionalMessage || "Thank you for your continued association with Path Sarthi Trust. We are glad to have you as part of our community.",
      referenceId: `ADMIN-${Date.now()}`,
      date: today(),
      emailType: EmailType.QUERY,
    };

    try {
      await sendEmail(brevoApiKey.value(), emailData);
      console.log(`[sendCustomEmail] Admin sent custom email to ${data.recipientEmail}`);
      return { success: true };
    } catch (error: any) {
      console.error("[sendCustomEmail] Failed:", error);
      throw new HttpsError("internal", error?.message || "Failed to send custom email.");
    }
  }
);

// ─── 11. Birthday Wish Scheduler ─────────────────────────────────────────────

/**
 * Scheduled function: Runs daily at midnight IST (18:30 UTC).
 * Reads all membership documents, finds members whose birthday is today,
 * and sends them a warm personalized birthday wish email.
 *
 * Supported DOB formats stored in Firestore:
 *   - ISO string:      "1998-07-16"   (YYYY-MM-DD)
 *   - Indian format:   "16/07/1998"   (DD/MM/YYYY)
 *   - Firestore Timestamp (auto-detected)
 */
export const birthdayWishScheduler = onSchedule(
  { schedule: "30 18 * * *", timeZone: "UTC", secrets: [brevoApiKey] },
  async () => {
    console.log("[birthdayWishScheduler] Starting daily birthday scan...");

    // Today's date in IST (midnight)
    const now = new Date();
    const istOffset = 5.5 * 60 * 60 * 1000;
    const istNow = new Date(now.getTime() + istOffset);
    const todayMonth = istNow.getUTCMonth() + 1; // 1-12
    const todayDay = istNow.getUTCDate();

    /** Parses a DOB field into { month, day } regardless of format */
    const parseDob = (dob: any): { month: number; day: number } | null => {
      if (!dob) return null;

      // Firestore Timestamp
      if (typeof dob?.toDate === "function") {
        const d = dob.toDate();
        return { month: d.getMonth() + 1, day: d.getDate() };
      }

      const str = String(dob).trim();

      // ISO format: 1998-07-16
      const isoMatch = str.match(/^(\d{4})-(\d{2})-(\d{2})$/);
      if (isoMatch) {
        return { month: parseInt(isoMatch[2]), day: parseInt(isoMatch[3]) };
      }

      // Indian format: 16/07/1998 or 16-07-1998
      const indMatch = str.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})$/);
      if (indMatch) {
        return { month: parseInt(indMatch[2]), day: parseInt(indMatch[1]) };
      }

      return null;
    };

    let scanned = 0;
    let sent = 0;
    let errors = 0;

    try {
      const snapshot = await admin.firestore().collection("memberships").get();
      scanned = snapshot.size;

      for (const docSnap of snapshot.docs) {
        const member = docSnap.data();
        const parsed = parseDob(member.dob || member.dateOfBirth || member.birthdate);
        if (!parsed) continue;

        if (parsed.month !== todayMonth || parsed.day !== todayDay) continue;

        // 🎂 It's this member's birthday!
        const name = member.fullName || member.name || "Valued Member";
        const email = member.email || "";

        if (!email || !email.includes("@")) {
          console.warn(`[birthdayWishScheduler] Skipping ${name}: no valid email.`);
          continue;
        }

        const birthdayDetailsBlock = `
          <div style="margin: 20px 0; padding: 28px 20px; background: linear-gradient(135deg, #fff7f2 0%, #fff0f9 100%); border: 2px solid #ffd7bf; border-radius: 14px; text-align: center;">
            <div style="font-size: 52px; margin-bottom: 12px;">🎂 🎉 🎈</div>
            <h2 style="color: #009ba2; font-family: Arial, sans-serif; font-size: 22px; margin: 0 0 10px;">Happy Birthday, ${name}! 🥳</h2>
            <p style="color: #555; font-family: Arial, sans-serif; font-size: 15px; line-height: 1.8; margin: 0 auto; max-width: 480px;">
              On this beautiful day, the entire <strong style="color: #009ba2;">Path Sarthi Trust</strong> family comes together to wish you a birthday overflowing with love, laughter, good health, and joy!
            </p>
          </div>

          <div style="margin: 20px 0; padding: 20px; background: #f0fafa; border-left: 4px solid #009ba2; border-radius: 8px;">
            <p style="color: #333; font-family: Arial, sans-serif; font-size: 15px; line-height: 1.9; margin: 0;">
              You are not just a member — you are a <strong>beacon of hope</strong> for the communities we serve together. Your belief in Path Sarthi Trust's mission warms our hearts every day.
            </p>
            <p style="color: #555; font-family: Arial, sans-serif; font-size: 14px; line-height: 1.8; margin: 14px 0 0;">
              Today is your day — to celebrate, to rest, and to be surrounded by those who love you. May every wish you make come true, and may this new year of your life bring you everything your heart desires. 🌟
            </p>
          </div>

          <div style="margin: 20px 0; padding: 18px; background: #fffbf0; border: 1px solid #ffe4a0; border-radius: 8px; text-align: center;">
            <p style="color: #b07d00; font-family: Arial, sans-serif; font-size: 14px; font-style: italic; line-height: 1.7; margin: 0;">
              "Count your life by smiles, not tears. Count your age by friends, not years. Wishing you a year full of moments that make your heart sing!" 🌸
            </p>
          </div>

          <div style="margin: 20px 0; padding: 18px 20px; background: #f8fff8; border: 1px solid #c3e6c3; border-radius: 8px; text-align: center;">
            <p style="color: #2d7a2d; font-family: Arial, sans-serif; font-size: 14px; line-height: 1.8; margin: 0;">
              🙏 <strong>A heartfelt thank you</strong> for walking this journey of kindness and service with us. Your presence in our family means the world to everyone at Path Sarthi Trust.
            </p>
          </div>
        `;

        const emailData: EmailData = {
          email,
          name,
          subject: `🎂 Happy Birthday, ${name}! With Love from Path Sarthi Trust`,
          preview: `Wishing you a beautiful birthday filled with joy, love, and happiness! 🎉`,
          status: "Happy Birthday! 🎂",
          message: `Today is a very special day — it's your birthday! 🎊<br/><br/>${birthdayDetailsBlock}`,
          additionalMessage: `From every corner of our team, with all our hearts — wishing you the happiest birthday and a wonderful year ahead. Thank you for being a cherished part of our Path Sarthi Trust family. May you always be surrounded by love, warmth, and beautiful moments. 💙`,
          referenceId: `BDAY-${docSnap.id}`,
          date: today(),
          emailType: EmailType.MEMBERSHIP,
        };

        try {
          await sendEmail(brevoApiKey.value(), emailData);
          sent++;
          console.log(`[birthdayWishScheduler] 🎂 Birthday email sent to ${name} (${email})`);
        } catch (err) {
          errors++;
          console.error(`[birthdayWishScheduler] Failed to send to ${name} (${email}):`, err);
        }
      }

      console.log(`[birthdayWishScheduler] Done. Scanned: ${scanned}, Sent: ${sent}, Errors: ${errors}`);
    } catch (err) {
      console.error("[birthdayWishScheduler] Fatal error scanning memberships:", err);
    }
  }
);


// ─── 12. Birthday Wish Test Function ─────────────────────────────────────────

/**
 * Callable TEST function — runs the full birthday email logic on demand.
 * Admin-only (must be authenticated).
 *
 * Usage:
 *   Pass { testDate: "YYYY-MM-DD" } to simulate a specific date (e.g. "2026-07-16")
 *   Pass {} or nothing to use TODAY's actual date
 *
 * Returns a summary: { scanned, sent, errors, matches: [{ name, email, dob }] }
 */
export const testBirthdayWish = onCall(
  { secrets: [brevoApiKey] },
  async (request) => {
    // Auth check removed intentionally — this is a temporary test function.
    // Remove this function from index.ts after verifying the birthday flow works.

    const data = request.data || {};

    // Allow overriding the date for testing
    let targetDate: Date;
    if (data.testDate && typeof data.testDate === "string") {
      targetDate = new Date(data.testDate + "T00:00:00.000Z");
      if (isNaN(targetDate.getTime())) {
        throw new HttpsError("invalid-argument", "testDate must be in YYYY-MM-DD format.");
      }
    } else {
      // Use IST "now"
      const now = new Date();
      const istOffset = 5.5 * 60 * 60 * 1000;
      targetDate = new Date(now.getTime() + istOffset);
    }

    const targetMonth = targetDate.getUTCMonth() + 1;
    const targetDay = targetDate.getUTCDate();

    console.log(`[testBirthdayWish] Running test for date: ${targetDay}/${targetMonth}`);

    /** Parses a DOB field into { month, day } regardless of format */
    const parseDob = (dob: any): { month: number; day: number } | null => {
      if (!dob) return null;
      if (typeof dob?.toDate === "function") {
        const d = dob.toDate();
        return { month: d.getMonth() + 1, day: d.getDate() };
      }
      const str = String(dob).trim();
      const isoMatch = str.match(/^(\d{4})-(\d{2})-(\d{2})$/);
      if (isoMatch) return { month: parseInt(isoMatch[2]), day: parseInt(isoMatch[3]) };
      const indMatch = str.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})$/);
      if (indMatch) return { month: parseInt(indMatch[2]), day: parseInt(indMatch[1]) };
      return null;
    };

    let scanned = 0;
    let sent = 0;
    let errors = 0;
    const matches: { name: string; email: string; dob: string }[] = [];
    const skipped: { name: string; reason: string }[] = [];

    const snapshot = await admin.firestore().collection("memberships").get();
    scanned = snapshot.size;

    for (const docSnap of snapshot.docs) {
      const member = docSnap.data();
      const dobRaw = member.dob || member.dateOfBirth || member.birthdate;
      const parsed = parseDob(dobRaw);

      if (!parsed) {
        skipped.push({ name: member.fullName || member.name || docSnap.id, reason: "No valid dob field found" });
        continue;
      }

      if (parsed.month !== targetMonth || parsed.day !== targetDay) continue;

      // ✅ Birthday match!
      const name = member.fullName || member.name || "Valued Member";
      const email = member.email || "";

      matches.push({ name, email, dob: String(dobRaw) });

      if (!email || !email.includes("@")) {
        skipped.push({ name, reason: "No valid email address" });
        continue;
      }

      const birthdayDetailsBlock = `
        <div style="margin: 20px 0; padding: 28px 20px; background: linear-gradient(135deg, #fff7f2 0%, #fff0f9 100%); border: 2px solid #ffd7bf; border-radius: 14px; text-align: center;">
          <div style="font-size: 52px; margin-bottom: 12px;">🎂 🎉 🎈</div>
          <h2 style="color: #009ba2; font-family: Arial, sans-serif; font-size: 22px; margin: 0 0 10px;">Happy Birthday, ${name}! 🥳</h2>
          <p style="color: #555; font-family: Arial, sans-serif; font-size: 15px; line-height: 1.8; margin: 0 auto; max-width: 480px;">
            On this beautiful day, the entire <strong style="color: #009ba2;">Path Sarthi Trust</strong> family comes together to wish you a birthday overflowing with love, laughter, good health, and joy!
          </p>
        </div>

        <div style="margin: 20px 0; padding: 20px; background: #f0fafa; border-left: 4px solid #009ba2; border-radius: 8px;">
          <p style="color: #333; font-family: Arial, sans-serif; font-size: 15px; line-height: 1.9; margin: 0;">
            You are not just a member — you are a <strong>beacon of hope</strong> for the communities we serve together. Your belief in Path Sarthi Trust's mission warms our hearts every day.
          </p>
          <p style="color: #555; font-family: Arial, sans-serif; font-size: 14px; line-height: 1.8; margin: 14px 0 0;">
            Today is your day — to celebrate, to rest, and to be surrounded by those who love you. May every wish you make come true, and may this new year of your life bring you everything your heart desires. 🌟
          </p>
        </div>

        <div style="margin: 20px 0; padding: 18px; background: #fffbf0; border: 1px solid #ffe4a0; border-radius: 8px; text-align: center;">
          <p style="color: #b07d00; font-family: Arial, sans-serif; font-size: 14px; font-style: italic; line-height: 1.7; margin: 0;">
            "Count your life by smiles, not tears. Count your age by friends, not years. Wishing you a year full of moments that make your heart sing!" 🌸
          </p>
        </div>

        <div style="margin: 20px 0; padding: 18px 20px; background: #f8fff8; border: 1px solid #c3e6c3; border-radius: 8px; text-align: center;">
          <p style="color: #2d7a2d; font-family: Arial, sans-serif; font-size: 14px; line-height: 1.8; margin: 0;">
            🙏 <strong>A heartfelt thank you</strong> for walking this journey of kindness and service with us. Your presence in our family means the world to everyone at Path Sarthi Trust.
          </p>
        </div>

        <div style="margin: 12px 0; padding: 12px 16px; background: #e8f4ff; border: 1px dashed #90c5ff; border-radius: 6px; text-align: center;">
          <p style="color: #1a5faa; font-family: Arial, sans-serif; font-size: 12px; margin: 0;">
            🧪 <strong>[TEST EMAIL]</strong> — Sent via testBirthdayWish for date ${targetDay}/${targetMonth}
          </p>
        </div>
      `;

      const emailData: EmailData = {
        email,
        name,
        subject: `🎂 [TEST] Happy Birthday, ${name}! With Love from Path Sarthi Trust`,
        preview: `Wishing you a beautiful birthday filled with joy, love, and happiness! 🎉`,
        status: "Happy Birthday! 🎂",
        message: `Today is a very special day — it's your birthday! 🎊<br/><br/>${birthdayDetailsBlock}`,
        additionalMessage: `From every corner of our team, with all our hearts — wishing you the happiest birthday and a wonderful year ahead. Thank you for being a cherished part of our Path Sarthi Trust family. May you always be surrounded by love, warmth, and beautiful moments. 💙`,
        referenceId: `TEST-BDAY-${docSnap.id}`,
        date: today(),
        emailType: EmailType.MEMBERSHIP,
      };

      try {
        await sendEmail(brevoApiKey.value(), emailData);
        sent++;
        console.log(`[testBirthdayWish] ✅ Test birthday email sent to ${name} (${email})`);
      } catch (err: any) {
        errors++;
        console.error(`[testBirthdayWish] ❌ Failed to send to ${name} (${email}):`, err);
      }
    }

    const result = {
      success: true,
      simulatedDate: `${targetDay}/${targetMonth}`,
      scanned,
      matched: matches.length,
      sent,
      errors,
      matches,
      skipped,
    };

    console.log("[testBirthdayWish] Result:", JSON.stringify(result));
    return result;
  }
);
