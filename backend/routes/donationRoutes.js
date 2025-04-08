const express = require("express");
const router = express.Router();
const Donatie = require("../models/Donatie");

// POST
router.post("/", async (req, res) => {
  try {
    const donatie = new Donatie(req.body);
    await donatie.save();
    res.status(201).json(donatie);
  } catch (err) {
    res.status(500).json({ message: "Eroare la salvare" });
  }
});

// GET
router.get("/", async (req, res) => {
  try {
    const donatii = await Donatie.find();
    res.json(donatii);
  } catch (err) {
    res.status(500).json({ message: "Eroare la preluare" });
  }
});

module.exports = router;
