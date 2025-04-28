const express = require("express");
const router = express.Router();
const Donation = require("../models/Donatie");
const User = require("../models/User");


router.get("/", async (req, res) => {
  const donatii = await Donation.find({ status: "deschis" });
  res.json(donatii);
});


router.post("/", async (req, res) => {
  const { nume, adresa, produse } = req.body;
  try {
    const nouaDonatie = new Donation({ nume, adresa, produse });
    await nouaDonatie.save();
    res.status(201).json(nouaDonatie);
  } catch (err) {
    res.status(500).json({ error: "Eroare la salvarea donației" });
  }
});

// ✅ DONEAZĂ - marchează donația ca donată și adaugă puncte userului
router.put("/:id/doneaza", async (req, res) => {
  const { userId } = req.body; // ID-ul utilizatorului este în corpul cererii
  const donatieId = req.params.id; // ID-ul donației este din URL

  //console.log("ID-ul donației primit în backend:", donatieId, userId);  // Verifică ce ID se primește
 // console.log("ID-ul userului primit în backend:", userId);  // Verifică ce ID se primește

  try {
    const donatie = await Donation.findById(donatieId);
    if (!donatie) return res.status(404).json({ error: "Donația nu a fost găsită." });

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: "Utilizatorul nu a fost găsit." });

    const numarArticole = donatie.produse.reduce((total, p) => total + p.cantitate, 0);
    user.puncte += numarArticole * 10;
    await user.save();

    donatie.status = "inchis"; 
    donatie.donatedBy = userId;
    await donatie.save();

    res.json({ message: "Donația a fost procesată cu succes." });
  } catch (err) {
    res.status(500).json({ error: "Eroare la procesarea donației." });
  }
});





// ✅ Top 10 donatori
router.get("/top", async (req, res) => {
  try {
    const topUsers = await User.find({ puncte: { $gt: 0 } })
      .sort({ puncte: -1 })
      .limit(10)
      .select("username puncte");

    res.json(topUsers);
  } catch (err) {
    res.status(500).json({ error: "Eroare la generarea clasamentului." });
  }
});

router.get("/profil/:userId", async (req, res) => {
  const { userId } = req.params;

  try {
    const user = await User.findById(userId).select("username puncte");
    if (!user) return res.status(404).json({ error: "Utilizatorul nu a fost găsit." });

    const donatiiUser = await Donation.find({ donatedBy: userId });

    res.json({
      user,
      donatii: donatiiUser,
    });
  } catch (err) {
    res.status(500).json({ error: "Eroare la obținerea datelor de profil." });
  }
});


module.exports = router;

