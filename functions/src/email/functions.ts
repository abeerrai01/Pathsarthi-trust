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
          message: `We are deeply grateful for your generous donation to Path Sarthi Trust.\n\n${donationImpact}\n\nAt Path Sarthi, we believe that real change begins when citizens join hands. Your kindness acts as a guiding light for children and families who need support the most. Thank you for placing your trust in us.`,
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
        refId
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
      if (email) {
        await sendEmail(brevoApiKey.value(), {
          email,
          name,
          subject: "Partnering for Change: Sponsorship Request Received 🤝",
          preview: "Thank you for choosing to empower our community.",
          status: "Sponsorship Under Review",
          message: `Thank you for reaching out to partner with Path Sarthi Trust. We have successfully received your sponsorship proposal.\n\nCorporate and individual sponsorships are critical in helping us scale our initiatives—from running digital classrooms in remote villages to driving environmental and healthcare drives. Your willingness to collaborate plays a major role in expanding this circle of impact.`,
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
        docId
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
      if (email && email.includes("@")) {
        if (isPremium) {
          await sendEmail(brevoApiKey.value(), {
            email,
            name,
            subject: "Premium Membership Application Received! 🌟",
            preview: "Thank you for taking a significant leadership step with us.",
            status: "Application Under Review",
            message: `Thank you for choosing to join us as a Premium Member of Path Sarthi Trust. Premium members play a vital leadership role in guiding our community welfare initiatives, mentoring youth, and helping us govern regional projects.`,
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
            message: `We are absolutely thrilled to welcome you as a member of Path Sarthi Trust. Outlining our shared values of compassion, responsibility, and collective progress, our members are the driving force behind everything we do.`,
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
        docId
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
      if (email && email.includes("@")) {
        await sendEmail(brevoApiKey.value(), {
          email,
          name,
          subject: "Connecting with Path Sarthi Trust (Jan Sampark) 📞",
          preview: "We have received your contact details.",
          status: "Request Received",
          message: `Thank you for connecting with us through our Jan Sampark public outreach initiative. We believe in building transparent, accessible, and responsive channels to support and engage with every citizen who wishes to collaborate, seek guidance, or contribute.`,
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
        docId
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
      if (email && email.includes("@")) {
        await sendEmail(brevoApiKey.value(), {
          email,
          name,
          subject: "Welcome to the Path Sarthi Trust Internship Program! 🎓",
          preview: "Your journey to making a real-world impact starts here.",
          status: "Application Received",
          message: `We have successfully received your internship application!\n\nOur internship program is designed to provide you with hands-on experience, professional mentorship, and a platform to work directly on community development, education, and public service projects. We are excited about your interest in dedicating your skills to social impact.`,
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
        docId
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
      if (email && email.includes("@")) {
        await sendEmail(brevoApiKey.value(), {
          email,
          name,
          subject: "We Have Received Your Support Query ✉️",
          preview: "Our support team is here to help you.",
          status: "Open",
          message: `Thank you for reaching out to the support desk at Path Sarthi Trust. We have received your query and want to assure you that addressing your questions and resolving any issues is our top priority.`,
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
        docId
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
      if (email && email.includes("@")) {
        await sendEmail(brevoApiKey.value(), {
          email,
          name,
          subject: "Welcome to the Team! Volunteer Registration Received 🌟",
          preview: "Ready to make a difference? Welcome aboard!",
          status: "Welcome",
          message: `We are excited to welcome you to the volunteer community at Path Sarthi Trust!\n\nVolunteers are the absolute backbone of our trust. By choosing to dedicate your time, energy, and talents, you are playing a direct role in teaching children, helping families, and driving social welfare campaigns in your area.`,
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
        docId
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
