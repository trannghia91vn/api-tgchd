const nodemailer = require("nodemailer");

const forgotPasswordMail = async (url) => {
  //1.Cấu hình transporter
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.HOST_GMAIL_NAME,
      pass: process.env.HOST_GMAIL_PASSWORD,
    },
  });
  //2. Nội dung gởi mail
  const myMessage = {
    from: process.env.HOST_GMAIL_NAME,
    to: "tranggiaocu@gmail.com",
    subject: "Đổi password nè.",
    text: "Link đổi password đê:" + url,
  };
  //3. gởi mail
  await transporter.sendMail(myMessage);
};

module.exports = forgotPasswordMail;
