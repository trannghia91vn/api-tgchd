const nodemailer = require("nodemailer");

const sendMailNewOrder = async (info) => {
  const { time, totalPayment, name } = info;
  const timeView = new Date(time).toLocaleString("en-GB", {
    day: "numeric",
    month: "numeric",
    year: "numeric",
  });
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.HOST_GMAIL_NAME,
      pass: process.env.HOST_GMAIL_PASSWORD,
    },
  });
  const myMessage = {
    from: process.env.HOST_GMAIL_NAME,
    to: "tranggiaocu@gmail.com",
    subject: "Đơn về tiền về !!!",
    html: `<div><p>Ngày đặt hàng: ${timeView}</p><br><p>Tổng tiền: ${totalPayment} đ</p><br><p>Khách hàng: ${name}</p></div>`,
  };
  await transporter.sendMail(myMessage);
};

module.exports = sendMailNewOrder;
