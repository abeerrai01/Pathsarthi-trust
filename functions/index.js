const functions = require("firebase-functions");
const nodemailer = require("nodemailer");

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
