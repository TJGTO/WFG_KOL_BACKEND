const { createTransport } = require("nodemailer");
const path = require("path");
const Email = require("email-templates");

class EmailService {
  constructor(smtpConfig) {
    this.transporter = smtpConfig ? createTransport(smtpConfig) : null;
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

  async emailTemplates(template, receiver, locals) {
    try {
      const envpassword = process.env.adminEmailPassword;
      const modifiedPass = envpassword.split("_").join(" ");
      const smtpTransport = createTransport({
        host: "smtp.gmail.com",
        port: 587,
        auth: {
          user: process.env.adminEmailId,
          pass: modifiedPass,
        },
      });
      const email = new Email({
        message: {
          from: process.env.adminEmailId,
        },
        send: true,
        preview: false,
        transport: smtpTransport,
        views: {
          options: {
            extension: "ejs",
          },
        },
        juice: true,
        juiceResources: {
          preserveImportant: true,
          webResources: {
            relativeTo: path.join(__dirname, "../build"),
          },
        },
      });

      let emailresponse = await email
        .send({
          template: path.join(__dirname, "..", "emails", template),
          message: { to: receiver },
          locals,
        })
        .then((response) => {
          return response;
        });

      return emailresponse;
    } catch (error) {
      console.log(error);
    }
  }
}

module.exports = EmailService;
