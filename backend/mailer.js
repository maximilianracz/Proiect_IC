const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "centru.donatii@gmail.com",      
    pass: "udsd fbzm utfv wfjc"      
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

async function sendReminderEmail(to, donationDetails) {
  console.log('🔔 DEBUG: Începe procesul de trimitere email reminder');
  console.log('📧 DEBUG: Detalii email:', {
    to,
    donationDetails,
    timestamp: new Date().toISOString()
  });

  const mailOptions = {
    from: "centru.donatii@gmail.com",
    to,
    subject: "⏰ Reminder: Donație în 3 ore!",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2c3e50;">Reminder Donație</h2>
        <p>Salut,</p>
        <p>Acesta este un reminder că ai o donație programată în 3 ore:</p>
        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p><strong>Detalii Donație:</strong></p>
          <ul style="list-style: none; padding: 0;">
            <li>📍 Adresă: ${donationDetails.adresa}</li>
            <li>📅 Data: ${donationDetails.dataDonatie}</li>
            <li>⏰ Ora: ${donationDetails.oraDonatie}</li>
          </ul>
        </div>
        <p>Te rugăm să ajungi la timp pentru donație.</p>
        <p>Îți mulțumim pentru generozitate!</p>
        <hr style="border: 1px solid #eee; margin: 20px 0;">
        <p style="color: #666; font-size: 12px;">Acesta este un mesaj automat. Te rugăm să nu răspunzi la acest email.</p>
      </div>
    `
  };

  try {
    console.log('📤 DEBUG: Se încearcă trimiterea emailului...');
    await transporter.sendMail(mailOptions);
    console.log('✅ DEBUG: Email trimis cu succes către:', to);
    console.log('⏰ DEBUG: Timestamp trimitere:', new Date().toISOString());
    return true;
  } catch (error) {
    console.error('❌ DEBUG: Eroare la trimiterea emailului:', error);
    console.error('🔍 DEBUG: Detalii eroare:', {
      message: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString()
    });
    return false;
  }
}

module.exports = { sendWelcomeEmail, sendPasswordResetEmail, sendReminderEmail };
