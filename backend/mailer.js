const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "centru.donatii@gmail.com",       // înlocuiește cu adresa ta Gmail
    pass: "udsd fbzm utfv wfjc"       // vezi PASUL 4
  },
});

async function sendWelcomeEmail(to, name) {
  const mailOptions = {
    from: "centru.donatii@gmail.com",
    to,
    subject: "🎉 Bun venit!",
    text: `Salut ${name},\n\nÎți mulțumim că te-ai înregistrat pe platforma noastră!`,
  };

  await transporter.sendMail(mailOptions);
}

async function sendPasswordResetEmail(to, tempPassword) {
  const mailOptions = {
    from: "centru.donatii@gmail.com",
    to,
    subject: "🔑 Resetare parolă",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Resetare parolă</h2>
        <p>Salut,</p>
        <p>A fost solicitată resetarea parolei pentru contul tău.</p>
        <p>Parola ta temporară este: <strong style="background-color: #f0f0f0; padding: 5px 10px; border-radius: 4px;">${tempPassword}</strong></p>
        <p>Te rugăm să te autentifici folosind această parolă și să o schimbi imediat după autentificare.</p>
        <p>Dacă nu ai solicitat această resetare, te rugăm să ignori acest email.</p>
        <p>Cu stimă,<br>Echipa noastră</p>
      </div>
    `,
  };

  await transporter.sendMail(mailOptions);
}

module.exports = { sendWelcomeEmail, sendPasswordResetEmail };
