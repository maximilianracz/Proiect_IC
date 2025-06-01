const nodemailer = require('nodemailer');


const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});


const sendReminderEmail = async (userEmail, donationDetails) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: userEmail,
    subject: '⏰ Reminder: Donation in 3 hours!',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2c3e50;">Donation Reminder</h2>
        <p>Hello,</p>
        <p>This is a friendly reminder that you have a donation scheduled in 3 hours:</p>
        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p><strong>Donation Details:</strong></p>
          <ul style="list-style: none; padding: 0;">
            <li>📍 Address: ${donationDetails.adresa}</li>
            <li>📅 Date: ${donationDetails.dataDonatie}</li>
            <li>⏰ Time: ${donationDetails.oraDonatie}</li>
          </ul>
        </div>
        <p>Please make sure to arrive on time for your donation.</p>
        <p>Thank you for your generosity!</p>
        <hr style="border: 1px solid #eee; margin: 20px 0;">
        <p style="color: #666; font-size: 12px;">This is an automated message. Please do not reply to this email.</p>
      </div>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Reminder email sent to ${userEmail}`);
    return true;
  } catch (error) {
    console.error('Error sending reminder email:', error);
    return false;
  }
};

module.exports = { sendReminderEmail }; 