/**
 * Email barrel — re-exports all email Cloud Functions (Callables and Firestore triggers).
 */
export {
  // Callables (Maintained for debugging/manual trigger capability)
  sendDonationEmail,
  sendSponsorEmail,
  sendMembershipEmail,
  sendPremiumMembershipEmail,
  sendJanSamparkEmail,
  sendInternshipEmail,
  sendQueryEmail,
  sendCertificateEmail,

  // Firestore background triggers (Automated emails on data writes)
  onNewDonation,
  onNewSponsor,
  onNewMembership,
  onNewJanSampark,
  onNewInternship,
  onNewQuery,
  onNewCertificate,
  onNewVolunteer,
  sendEmailOnNewApplication,

  // Admin tools
  sendCustomEmail,

  // Scheduled automations
  birthdayWishScheduler,
} from "./functions";
