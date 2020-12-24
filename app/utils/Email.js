const nodemailer = require('nodemailer');

export default class Email {
  constructor() {
    this.config();
  }

  async config() {
      this.mailTransport = nodemailer.createTransport({
        host: process.env.smtpHost,
        port: process.env.smtpPort,
        secure: false,
        requireTLS: true,
        auth: {
          user: process.env.smtpUser,
          pass: process.env.smtpPassword,
        },
      });
      this.mailOptions = {
        from: `"Chitty finace" ${process.env.adminEmail}`,
        to: '',
        subject: '',
        html: '',
      };
    
  }

  send(to, subject, message) {
    this.mailOptions.to = to;
    this.mailOptions.subject = subject;
    this.mailOptions.html = message;
    return this.mailTransport.sendMail(this.mailOptions);
  }
}
