const twilio = require("twilio");

class TwilioService {
  constructor(accountSid, authToken) {
    this.client = twilio(accountSid, authToken);
  }

  async sendMessage(from, to, body) {
    try {
      const message = await this.client.messages.create({
        from: `whatsapp:${from}`,
        body: body,
        to: `whatsapp:${to}`,
      });
      return message;
    } catch (error) {
      console.log(error);
      throw error;
    }
  }
}

module.exports = TwilioService;
