import nodemailer from "nodemailer";
import mailerConfig from "./MailerConfig.js";

const sendEmail = async ({ to, subject, html }) => {
  const transporter = nodemailer.createTransport(mailerConfig);

  try {
    await transporter.sendMail({
      from: '"Admin" <admin@email.com>',
      to,
      subject,
      html,
    });
    console.log('Email sent successfully');
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
};

export default sendEmail;
