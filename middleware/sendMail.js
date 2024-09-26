const nodemailer = require("nodemailer");

const sendMail = async (email, subject, text) => {
    const transport = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 465,
      secure: true,
      auth: {
        user: process.env.GMAIL,
        pass: process.env.PASSWORD,
      },
    });
  
    await transport.sendMail({
      from: process.env.GMAIL,
      to: email,
      subject,
      text,
    });
  };

module.exports=sendMail;