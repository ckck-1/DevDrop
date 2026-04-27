const nodemailer = require('nodemailer');
const logger = require('../../utils/logger');

class NotificationService {
  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
  }

  async sendWelcomeEmail(email, name) {
    const mailOptions = {
      from: `"AI Dev Marketplace" <${process.env.EMAIL_FROM}>`,
      to: email,
      subject: 'Welcome to the Future of Hiring',
      html: `<h1>Hi ${name}!</h1><p>Your AI-powered profile is being indexed...</p>`,
    };

    return await this.transporter.sendMail(mailOptions);
  }

  async sendApplicationAlert(email, developerName, jobTitle) {
    const mailOptions = {
      from: `"AI Dev Marketplace" <${process.env.EMAIL_FROM}>`,
      to: email,
      subject: `New Applicant: ${developerName}`,
      html: `<p>${developerName} just applied for <strong>${jobTitle}</strong>.</p>`,
    };

    return await this.transporter.sendMail(mailOptions);
  }
  async sendVerificationEmail(email, url) {
    const mailOptions = {
      from: `"AI Dev Marketplace" <${process.env.EMAIL_FROM}>`,
      to: email,
      subject: 'Verify your email address',
      html: `
        <h1>Verify your account</h1>
        <p>Click the link below to verify your email and start matching with roles:</p>
        <a href="${url}" style="padding: 10px 20px; background: #007bff; color: white; text-decoration: none;">Verify Email</a>
        <p>This link expires in 24 hours.</p>
      `,
    };

    return await this.transporter.sendMail(mailOptions);
  }
}

module.exports = new NotificationService();