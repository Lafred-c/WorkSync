import dotenv from "dotenv";
import nodemailer from "nodemailer";

dotenv.config({path: "./config.env"});

const sendTestEmail = async () => {
  console.log("Testing email sending...");
  console.log("Host:", process.env.EMAIL_HOST);
  console.log("Port:", process.env.EMAIL_PORT);
  console.log("User:", process.env.EMAIL_USERNAME);

  try {
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD,
      },
      // debug: true, // Enable debug output
      // logger: true // Log information to console
    });

    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to: "test@example.com",
      subject: "Test Email",
      text: "This is a test email.",
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent successfully!", info.messageId);
  } catch (err) {
    console.error("Error sending email:", err);
  }
};

sendTestEmail();
