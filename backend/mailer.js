const nodemailer = require("nodemailer");

async function sendWelcomeEmail(to, name) {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: "rujaroxana31@gmail.com",       // înlocuiește cu adresa ta Gmail
      pass: "pbim dlvg vecr cizd"       // vezi PASUL 4
    },
  });

  const mailOptions = {
    from: "adresa-ta@gmail.com",
    to,
    subject: "🎉 Bun venit!",
    text: `Salut ${name},\n\nÎți mulțumim că te-ai înregistrat pe platforma noastră!`,
  };

  await transporter.sendMail(mailOptions);
}

module.exports = { sendWelcomeEmail };
