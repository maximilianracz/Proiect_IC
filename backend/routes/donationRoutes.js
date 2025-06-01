const express = require("express");
const router = express.Router();
const multer = require("multer");
const Donation = require("../models/Donatie");
const User = require("../models/User");


const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, 
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Doar fișiere imagine sunt permise!'));
    }
  }
});

router.get("/", async (req, res) => {
  const donatii = await Donation.find({ status: { $ne: "inchis" } });
  res.json(donatii);
});

router.post("/", async (req, res) => {
  try {
    console.log("Received request body:", req.body);
    
    const { nume, adresa, produse } = req.body;
    
    if (!nume || !adresa) {
      console.error("Missing required fields:", { nume, adresa });
      return res.status(400).json({ 
        error: "Lipsesc câmpuri obligatorii",
        details: { nume: !nume, adresa: !adresa }
      });
    }

    if (!Array.isArray(produse) || produse.length === 0) {
      console.error("No products provided or invalid format");
      return res.status(400).json({ 
        error: "Trebuie să adăugați cel puțin un produs"
      });
    }

    
    for (const produs of produse) {
      if (!produs.tip || !produs.marime || !produs.cantitate) {
        return res.status(400).json({
          error: "Toate câmpurile produselor sunt obligatorii",
          details: { produs }
        });
      }
    }

    console.log("Creating donation with products:", produse);

    const nouaDonatie = new Donation({
      nume,
      adresa,
      produse,
      status: "deschis"
    });

    console.log("Saving donation:", nouaDonatie);
    await nouaDonatie.save();
    console.log("Donation saved successfully");
    
    res.status(201).json(nouaDonatie);
  } catch (err) {
    console.error("Eroare la salvarea donației:", err);
    res.status(500).json({ 
      error: "Eroare la salvarea donației",
      details: err.message,
      stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
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

   
    if (produsIndex >= 0 && produsIndex < donatie.produse.length) {
      donatie.produse[produsIndex].donat = true;
      donatie.produse[produsIndex].donatedBy = userId;
      
      
      user.puncte += 10 * donatie.produse[produsIndex].cantitate;
      await user.save();

      
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
    console.error("Eroare la obținerea datelor de profil:", err);
    res.status(500).json({ error: "Eroare la obținerea datelor de profil." });
  }
});


router.get("/:donationId/produs/:produsIndex/imagine", async (req, res) => {
  try {
    const donatie = await Donation.findById(req.params.donationId);
    if (!donatie) {
      return res.status(404).json({ error: "Donația nu a fost găsită" });
    }

    const produs = donatie.produse[req.params.produsIndex];
    if (!produs || !produs.imagine) {
      return res.status(404).json({ error: "Imaginea nu a fost găsită" });
    }

    res.set('Content-Type', produs.imagine.contentType);
    res.send(produs.imagine.data);
  } catch (err) {
    res.status(500).json({ error: "Eroare la obținerea imaginii" });
  }
});

module.exports = router;