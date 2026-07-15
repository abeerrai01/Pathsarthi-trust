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
exports.razorpayWebhook = void 0;
const https_1 = require("firebase-functions/v2/https");
const params_1 = require("firebase-functions/params");
const admin = __importStar(require("firebase-admin"));
const crypto = __importStar(require("crypto"));
const razorpayWebhookSecret = (0, params_1.defineSecret)("RAZORPAY_WEBHOOK_SECRET");
exports.razorpayWebhook = (0, https_1.onRequest)({ secrets: [razorpayWebhookSecret] }, async (req, res) => {
    try {
        const webhookSecret = razorpayWebhookSecret.value();
        if (webhookSecret) {
            const signature = req.headers["x-razorpay-signature"];
            if (!signature || typeof signature !== "string") {
                console.error("Missing Razorpay signature");
                res.status(400).send("Missing signature");
                return;
            }
            const expectedSignature = crypto
                .createHmac("sha256", webhookSecret)
                .update(JSON.stringify(req.body))
                .digest("hex");
            if (expectedSignature !== signature) {
                console.error("Invalid Razorpay signature");
                res.status(400).send("Invalid signature");
                return;
            }
        }
        else {
            console.warn("RAZORPAY_WEBHOOK_SECRET is not set. Signature verification skipped (NOT RECOMMENDED).");
        }
        const event = req.body.event;
        if (event === "payment.captured" || event === "payment.authorized") {
            const payment = req.body.payload.payment.entity;
            const notes = payment.notes || {};
            const firestoreDocId = notes.firestoreDocId;
            const collectionName = notes.collectionName;
            if (firestoreDocId && collectionName) {
                const updateData = {
                    status: "completed",
                    paymentId: payment.id,
                };
                if (payment.email) {
                    updateData.email = payment.email;
                }
                if (payment.contact) {
                    updateData.phone = payment.contact;
                }
                // Memberships need validity dates
                if (collectionName === "memberships") {
                    const validFrom = new Date();
                    const validTo = new Date();
                    validTo.setFullYear(validFrom.getFullYear() + 1);
                    updateData.validFrom = admin.firestore.Timestamp.fromDate(validFrom);
                    updateData.validTo = admin.firestore.Timestamp.fromDate(validTo);
                }
                await admin.firestore().collection(collectionName).doc(firestoreDocId).update(updateData);
                console.log(`Successfully updated document ${firestoreDocId} in ${collectionName}`);
            }
            else {
                console.warn("Missing firestoreDocId or collectionName in Razorpay notes:", notes);
            }
        }
        res.status(200).send("Webhook received");
    }
    catch (error) {
        console.error("Webhook Error:", error);
        res.status(500).send("Internal Server Error");
    }
});
//# sourceMappingURL=razorpay.js.map