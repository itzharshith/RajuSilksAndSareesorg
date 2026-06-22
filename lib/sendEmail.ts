import nodemailer from 'nodemailer';

interface EmailOptions {
  email: string;
  subject: string;
  text?: string;
  html?: string;
}

export async function sendEmail({ email, subject, text, html }: EmailOptions) {
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT) || 587,
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  await transporter.sendMail({
    from: `"${process.env.SMTP_FROM_NAME || 'Raju Silks & Sarees'}" <${process.env.SMTP_FROM_EMAIL}>`,
    to: email,
    subject,
    text,
    html,
  });
}
