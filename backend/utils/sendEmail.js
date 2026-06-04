const nodemailer = require('nodemailer');

/**
 * Sends an email using SMTP if configured, or prints it to console as fallback.
 * @param {Object} options
 * @param {string} options.email - Recipient email
 * @param {string} options.subject - Email subject
 * @param {string} options.text - Plain text content
 * @param {string} options.html - HTML content
 */
const sendEmail = async ({ email, subject, text, html }) => {
  const hasSMTP = process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS;

  if (hasSMTP) {
    try {
      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT) || 587,
        secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      });

      const mailOptions = {
        from: `"${process.env.SMTP_FROM_NAME || 'Raju Silks & Sarees'}" <${process.env.SMTP_FROM_EMAIL || process.env.SMTP_USER}>`,
        to: email,
        subject: subject,
        text: text,
        html: html,
      };

      await transporter.sendMail(mailOptions);
      console.log(`Email successfully sent to ${email} (via SMTP)`);
      return { success: true, method: 'smtp' };
    } catch (error) {
      console.error(`Failed to send email to ${email} via SMTP. Falling back to console log...`);
      console.error(error);
    }
  }

  // Console fallback banner
  const border = '*'.repeat(60);
  console.log('\n' + border);
  console.log(`* BRAND: RAJU SILKS & SAREES (Password Reset OTP Notification)`);
  console.log(`* TO:    ${email}`);
  console.log(`* SUBJ:  ${subject}`);
  console.log(`* TEXT:  ${text}`);
  console.log(border + '\n');

  return { success: true, method: 'console' };
};

module.exports = sendEmail;
