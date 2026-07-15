/**
 * Email barrel — re-exports all email Cloud Functions.
 */
export {
  sendDonationEmail,
  sendSponsorEmail,
  sendMembershipEmail,
  sendPremiumMembershipEmail,
  sendJanSamparkEmail,
  sendInternshipEmail,
  sendQueryEmail,
  sendCertificateEmail,
  sendEmailOnNewApplication,
} from "./functions";
