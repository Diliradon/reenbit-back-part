import "dotenv/config";
import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
});

const sendEmail = async ({ to, subject, text, html }) => {
  try {
    const info = await transporter.sendMail({
      // sender address
      to, // list of receivers
      subject, // Subject line
      text, // plain text body
      html, // html body
    });

    console.log("Email sent:", info.messageId);
  } catch (error) {
    console.error("Error sending email:", error);
  }
};

const sendActivationEmail = async ({ email, token }) => {
  const link = `${process.env.CLIENT_HOST}/auth/activate/${token}`;

  return await sendEmail({
    to: email,
    subject: "Activate your account",
    text: `Please click on the link to activate your account: ${link}`,
    html: `<a href="${link}">Activate your account</a>`,
  });
};

export const emailService = {
  sendActivationEmail,
  sendEmail,
};
