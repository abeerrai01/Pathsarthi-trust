const functions = require("firebase-functions");
const nodemailer = require("nodemailer");
const admin = require("firebase-admin");
const crypto = require("crypto");

admin.initializeApp();

exports.sendEmailOnNewApplication = functions.firestore
  .document("applications/{id}")
  .onCreate(async (snap, context) => {
    const data = snap.data();

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: "pathsarthi2022@gmail.com",
        pass: "2022@Pathsarthi",
      },
    });

    const mailOptions = {
      from: "pathsarthi2022@gmail.com",
      to: "pathsarthi2022@gmail.com",
      subject: "New Student Application",
      text: `
        Name: ${data.firstName} ${data.lastName}
        Email: ${data.email}
        Phone: ${data.phone}
        Highest Qualification: ${data.qualification}
        Support Type: ${data.supportType}
        Education Details: ${data.educationDetails}
        Location: ${data.city}, ${data.state}
      `,
    };

    await transporter.sendMail(mailOptions);
  });

exports.razorpayWebhook = functions.https.onRequest(async (req, res) => {
  try {
    // Ideally configure this using Firebase Environment Configuration:
    // firebase functions:config:set razorpay.webhook_secret="your_secret"
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET || functions.config().razorpay?.webhook_secret;
    
    if (webhookSecret) {
      const signature = req.headers["x-razorpay-signature"];
      if (!signature) {
        console.error("Missing Razorpay signature");
        return res.status(400).send("Missing signature");
      }
      
      const expectedSignature = crypto
        .createHmac("sha256", webhookSecret)
        .update(JSON.stringify(req.body))
        .digest("hex");
        
      if (expectedSignature !== signature) {
        console.error("Invalid Razorpay signature");
        return res.status(400).send("Invalid signature");
      }
    } else {
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
          status: 'completed',
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
});
