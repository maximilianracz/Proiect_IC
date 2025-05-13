const express = require("express");
const router = express.Router();
const Donation = require("../models/Donatie");
const User = require("../models/User");

router.get("/", async (req, res) => {
  const donatii = await Donation.find({ status: { $ne: "inchis" } });
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

router.put("/:id/doneaza", async (req, res) => {
  const { userId, produsIndex } = req.body;
  const donatieId = req.params.id;

  try {
    const donatie = await Donation.findById(donatieId);
    if (!donatie) return res.status(404).json({ error: "Donația nu a fost găsită." });

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: "Utilizatorul nu a fost găsit." });

    // Mark the specific product as donated
    if (produsIndex >= 0 && produsIndex < donatie.produse.length) {
      donatie.produse[produsIndex].donat = true;
      donatie.produse[produsIndex].donatedBy = userId;
      
      // Add points for this item
      user.puncte += 10 * donatie.produse[produsIndex].cantitate;
      await user.save();

      // Update donation status
      const allDonated = donatie.produse.every(p => p.donat);
      const someDonated = donatie.produse.some(p => p.donat);
      
      if (allDonated) {
        donatie.status = "inchis";
      } else if (someDonated) {
        donatie.status = "partial";
      }

      await donatie.save();
      res.json({ message: "Produsul a fost donat cu succes." });
    } else {
      res.status(400).json({ error: "Index produs invalid." });
    }
  } catch (err) {
    res.status(500).json({ error: "Eroare la procesarea donației." });
  }
});

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

    // Find all products donated by this user across all donations
    const donations = await Donation.find({
      "produse.donatedBy": userId
    });

    const donatedItems = [];
    donations.forEach(donation => {
      donation.produse.forEach(produs => {
        if (produs.donatedBy && produs.donatedBy.toString() === userId) {
          donatedItems.push({
            donationId: donation._id,
            nume: donation.nume,
            adresa: donation.adresa,
            produs: produs
          });
        }
      });
    });

    res.json({
      user,
      donatedItems,
    });
  } catch (err) {
    res.status(500).json({ error: "Eroare la obținerea datelor de profil." });
  }
});

module.exports = router;