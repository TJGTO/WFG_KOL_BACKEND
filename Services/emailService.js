const nodemailer = require("nodemailer");

class EmailService {
  constructor(smtpConfig) {
    this.transporter = nodemailer.createTransport(smtpConfig);
  }

  async sendEmail(emailOptions) {
    try {
      const info = await this.transporter.sendMail(emailOptions);
      console.log("Message sent: %s", info.messageId);
      return info.messageId;
    } catch (error) {
      console.error("Error occurred:", error);
      throw error;
    }
  }
}

module.exports = EmailService;
