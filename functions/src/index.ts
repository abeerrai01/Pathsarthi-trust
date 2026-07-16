import * as admin from "firebase-admin";

admin.initializeApp();

export * from "./email";
export * from "./payments/razorpay";
export * from "./intern/internCredentials";
