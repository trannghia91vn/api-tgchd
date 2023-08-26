const nodemailer = require("nodemailer");
module.exports = async function sendEmail(data) {
  let resetPasswordUrl;
  if (data) resetPasswordUrl = data.resetPasswordUrl;
  //1. Cấu hình transporter
  const transporter = nodemailer.createTransport({
    service: "SendGrid",
    auth: {
      user: process.env.SENDGRID_USER,
      pass: process.env.SENDGRID_PASSWORD,
    },
  });

  //2. Cấu hình nội dung gởi mail
  const myMessage = {
    from: "Bot SendGrid",
    to: "trannghia213@gmail.com",
    subject: "Test từ sendgrid",
    text: "Hello from boss basushi nè",
  };

  //3. GỞi mail
  await transporter.sendMail(myMessage);
};
