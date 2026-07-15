import { onRequest } from "firebase-functions/v2/https";
import { defineSecret } from "firebase-functions/params";
import * as admin from "firebase-admin";
import * as crypto from "crypto";

const razorpayWebhookSecret = defineSecret("RAZORPAY_WEBHOOK_SECRET");

export const razorpayWebhook = onRequest(
  { secrets: [razorpayWebhookSecret] },
  async (req, res) => {
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
      } else {
        console.warn("RAZORPAY_WEBHOOK_SECRET is not set. Signature verification skipped (NOT RECOMMENDED).");
      }

      const event = req.body.event;

      if (event === "payment.captured" || event === "payment.authorized") {
        const payment = req.body.payload.payment.entity;
        const notes = payment.notes || {};

        const firestoreDocId: string = notes.firestoreDocId;
        const collectionName: string = notes.collectionName;

        if (firestoreDocId && collectionName) {
          const updateData: Record<string, unknown> = {
            status: "completed",
            paymentId: payment.id,
          };

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
        } else {
          console.warn("Missing firestoreDocId or collectionName in Razorpay notes:", notes);
        }
      }

      res.status(200).send("Webhook received");
    } catch (error) {
      console.error("Webhook Error:", error);
      res.status(500).send("Internal Server Error");
    }
  }
);
