"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.testBirthdayWish = exports.birthdayWishScheduler = exports.sendCustomEmail = exports.sendEmailOnNewApplication = exports.onNewVolunteer = exports.onNewCertificate = exports.onNewQuery = exports.onNewInternship = exports.onNewJanSampark = exports.onNewMembership = exports.onNewSponsor = exports.onNewDonation = exports.sendCertificateEmail = exports.sendQueryEmail = exports.sendInternshipEmail = exports.sendJanSamparkEmail = exports.sendPremiumMembershipEmail = exports.sendMembershipEmail = exports.sendSponsorEmail = exports.sendDonationEmail = void 0;
/**
 * Email barrel — re-exports all email Cloud Functions (Callables and Firestore triggers).
 */
var functions_1 = require("./functions");
// Callables (Maintained for debugging/manual trigger capability)
Object.defineProperty(exports, "sendDonationEmail", { enumerable: true, get: function () { return functions_1.sendDonationEmail; } });
Object.defineProperty(exports, "sendSponsorEmail", { enumerable: true, get: function () { return functions_1.sendSponsorEmail; } });
Object.defineProperty(exports, "sendMembershipEmail", { enumerable: true, get: function () { return functions_1.sendMembershipEmail; } });
Object.defineProperty(exports, "sendPremiumMembershipEmail", { enumerable: true, get: function () { return functions_1.sendPremiumMembershipEmail; } });
Object.defineProperty(exports, "sendJanSamparkEmail", { enumerable: true, get: function () { return functions_1.sendJanSamparkEmail; } });
Object.defineProperty(exports, "sendInternshipEmail", { enumerable: true, get: function () { return functions_1.sendInternshipEmail; } });
Object.defineProperty(exports, "sendQueryEmail", { enumerable: true, get: function () { return functions_1.sendQueryEmail; } });
Object.defineProperty(exports, "sendCertificateEmail", { enumerable: true, get: function () { return functions_1.sendCertificateEmail; } });
// Firestore background triggers (Automated emails on data writes)
Object.defineProperty(exports, "onNewDonation", { enumerable: true, get: function () { return functions_1.onNewDonation; } });
Object.defineProperty(exports, "onNewSponsor", { enumerable: true, get: function () { return functions_1.onNewSponsor; } });
Object.defineProperty(exports, "onNewMembership", { enumerable: true, get: function () { return functions_1.onNewMembership; } });
Object.defineProperty(exports, "onNewJanSampark", { enumerable: true, get: function () { return functions_1.onNewJanSampark; } });
Object.defineProperty(exports, "onNewInternship", { enumerable: true, get: function () { return functions_1.onNewInternship; } });
Object.defineProperty(exports, "onNewQuery", { enumerable: true, get: function () { return functions_1.onNewQuery; } });
Object.defineProperty(exports, "onNewCertificate", { enumerable: true, get: function () { return functions_1.onNewCertificate; } });
Object.defineProperty(exports, "onNewVolunteer", { enumerable: true, get: function () { return functions_1.onNewVolunteer; } });
Object.defineProperty(exports, "sendEmailOnNewApplication", { enumerable: true, get: function () { return functions_1.sendEmailOnNewApplication; } });
// Admin tools
Object.defineProperty(exports, "sendCustomEmail", { enumerable: true, get: function () { return functions_1.sendCustomEmail; } });
// Scheduled automations
Object.defineProperty(exports, "birthdayWishScheduler", { enumerable: true, get: function () { return functions_1.birthdayWishScheduler; } });
// Test / Debug functions (remove after verification)
Object.defineProperty(exports, "testBirthdayWish", { enumerable: true, get: function () { return functions_1.testBirthdayWish; } });
//# sourceMappingURL=index.js.map