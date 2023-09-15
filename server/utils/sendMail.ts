require("dotenv").config();
import nodemailer, { Transporter } from "nodemailer";
import ejs from "ejs";
import path from "path";

interface EmailOptions {
  email: string;
  subject: string;
  template: string;
  data: {
    [key: string]: any;
  };
}

const smtp_host = process.env.SMTP_HOST;
const smtp_port = parseInt(process.env.SMTP_PORT || "587");
const smtp_service = process.env.SMTP_SERVICE;
const smtp_mail_user = process.env.SMTP_MAIL_USER;
const smtp_mail_password = process.env.SMTP_MAIL_PASSWORD;

const sendMail = async (options: EmailOptions): Promise<void> => {
  const transporter: Transporter = nodemailer.createTransport({
    host: smtp_host,
    port: smtp_port,
    service: smtp_service,
    auth: {
      user: smtp_mail_user,
      pass: smtp_mail_password,
    },
  });

  const { email, subject, template, data } = options;

  // get the path to the email

  const templatePath = path.join(__dirname, "../mails", template);

  //render the email template with ejs
  const html: string = await ejs.renderFile(templatePath, data);

  const mailOptions = {
    from: smtp_mail_user,
    to: email,
    subject,
    html,
  };

  await transporter.sendMail(mailOptions);
};

export default sendMail;
