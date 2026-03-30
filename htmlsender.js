const nodemailer = require("nodemailer");
const fs = require("fs");

// Email configuration
const fromAddress = "omotayoolaolekan01@gmail.com";

// Read recipient emails from file
const toAddresses = fs
  .readFileSync("recipients.txt", "utf-8")
  .split("\n")
  .map((line) => line.trim())
  .filter((line) => line);

// SMTP configuration
const smtpConfig = {
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: "omotayoolaolekan01@gmail.com",
    pass: "eftf puoi ylmh csph", // ⚠️ Use environment variable in production
  },
};

// HTML content of the email
const htmlBody = `
<html>
  <head></head>
  <body>
    <p><strong>Dear User,</strong></p>
    <p>You need to <strong>reset your password immediately</strong> to secure your account.</p>
    <p><button type="submit" style="background-color: yellow;">
      <a href="https://google.com" style="color: blue; font-weight: bold; text-decoration: none;">Click Here</a></button>
    </p>
    <p>This link will expire in 24 hours.</p>
    <p>Best regards,<br>
       <em>Your IT Team</em>
    </p>
  </body>
</html>
`;

// Create transporter
const transporter = nodemailer.createTransport(smtpConfig);

// Send individual emails to each recipient (BCC - they won't see each other)
async function sendEmails() {
  try {
    for (const toAddress of toAddresses) {
      const mailOptions = {
        from: fromAddress,
        to: toAddress,
        subject: "Important Security Alert",
        html: htmlBody,
      };

      await transporter.sendMail(mailOptions);
      console.log(`Sent to ${toAddress}`);
    }

    console.log("All emails sent successfully!");
  } catch (error) {
    console.error(`Failed to send email: ${error.message}`);
  }
}

sendEmails();
