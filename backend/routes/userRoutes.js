const express = require("express");
const User = require("../models/User");
const { sendWelcomeEmail } = require("../mailer"); 

const router = express.Router();


router.post("/add", async (req, res) => {
  const { name, email } = req.body;


  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ error: "Email invalid!" });
  }

  try {
    const newUser = new User({ name, email });
    await newUser.save();

   
    await sendWelcomeEmail(email, name);

    res.json(newUser);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


router.get("/", async (req, res) => {
  const users = await User.find();
  res.json(users);
});

module.exports = router;
