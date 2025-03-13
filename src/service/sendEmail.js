import nodemailer from "nodemailer";

export const sendEmail = async (to, subject, html, attachments = []) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_SENDER,
      pass: process.env.PASSWORD,
    },
  });

  const info = await transporter.sendMail({
    from: `"Youssef" <${process.env.EMAIL_SENDER}>`,
    to: to ? to : `${process.env.EMAIL_SENDER}`,
    subject: subject ? subject : "Hello ✔",
    html: html ? html : "Hello world?",
    attachments,
  });

  if (info.accepted.length) {
    return true;
  }
  return false;
};