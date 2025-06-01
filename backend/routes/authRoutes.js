const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { sendWelcomeEmail, sendPasswordResetEmail } = require("../mailer");

const router = express.Router();


router.post("/signup", async (req, res) => {
  const { username, email, password } = req.body;


  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ message: "Email invalid!" });
  }

  try {
    const userExists = await User.findOne({ email });
    if (userExists) return res.status(400).json({ message: "Email deja folosit!" });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new User({ username, email, password: hashedPassword });
    await newUser.save();

    await sendWelcomeEmail(email, username);

    res.status(201).json({ message: "Utilizator creat cu succes!" });
  } catch (error) {
    console.error("Eroare la înregistrare:", error);
    res.status(500).json({ message: "Eroare la server!" });
  }
});


router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "Utilizator inexistent!" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Parolă incorectă!" });

    const token = jwt.sign({ id: user._id }, "secretKey", { expiresIn: "1h" });

    res.json({ token, user: { id: user._id, username: user.username, email: user.email } });
  } catch (error) {
    res.status(500).json({ message: "Eroare la server!" });
  }
});


router.post("/forgot-password", async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "Utilizatorul nu a fost găsit!" });
    }

  
    const tempPassword = Math.random().toString(36).slice(-8);
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(tempPassword, salt);

   
    user.password = hashedPassword;
    await user.save();

    
    await sendPasswordResetEmail(email, tempPassword);

    res.json({ message: "Un email cu parola temporară a fost trimis!" });
  } catch (error) {
    console.error("Eroare la resetarea parolei:", error);
    res.status(500).json({ message: "Eroare la server!" });
  }
});


router.post("/reset-password", async (req, res) => {
  const { tempPassword, newPassword } = req.body;

  try {
    const users = await User.find(); 

    let foundUser = null;

    for (const user of users) {
      const match = await bcrypt.compare(tempPassword, user.password);
      if (match) {
        foundUser = user;
        break;
      }
    }

    if (!foundUser) {
      return res.status(400).json({ message: "Parola temporară este greșită sau a expirat." });
    }

    
    const salt = await bcrypt.genSalt(10);
    const hashedNewPassword = await bcrypt.hash(newPassword, salt);
    foundUser.password = hashedNewPassword;
    await foundUser.save();

    res.json({ message: "Parola a fost schimbată cu succes!" });
  } catch (error) {
    console.error("Eroare la schimbarea parolei:", error);
    res.status(500).json({ message: "Eroare la server!" });
  }
});

module.exports = router;
