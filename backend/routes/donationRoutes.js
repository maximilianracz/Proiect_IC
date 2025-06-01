const express = require("express");
const router = express.Router();
const multer = require("multer");
const Donation = require("../models/Donatie");
const User = require("../models/User");
const { sendReminderEmail, sendDonationRequestReminderEmail } = require('../mailer');


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
    
    const { nume, adresa, produse, dataDonatie, oraDonatie, userId } = req.body;
    
    if (!nume || !adresa || !dataDonatie || !oraDonatie || !userId) {
      console.error("Missing required fields:", { nume, adresa, dataDonatie, oraDonatie, userId });
      return res.status(400).json({ 
        error: "Lipsesc câmpuri obligatorii",
        details: { nume: !nume, adresa: !adresa, dataDonatie: !dataDonatie, oraDonatie: !oraDonatie, userId: !userId }
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
      userId,
      dataDonatie,
      oraDonatie,
      produse,
      status: "deschis"
    });

    console.log("Saving donation:", nouaDonatie);
    await nouaDonatie.save();
    console.log("Donation saved successfully");
    
    if (userId) {
      const user = await User.findById(userId);
      if (user && user.email) {
        const donationDate = new Date(`${dataDonatie}T${oraDonatie}`);
        const reminderDate = new Date(donationDate.getTime() - (3 * 60 * 60 * 1000));
        const timeUntilReminder = reminderDate.getTime() - Date.now();
        
        console.log('⏰ DEBUG: Programare reminder email pentru cerere de donație');
        console.log('📅 DEBUG: Detalii programare:', {
          dataDonatie,
          oraDonatie,
          dataReminder: reminderDate.toISOString(),
          timpPanaLaReminder: `${Math.floor(timeUntilReminder / (1000 * 60 * 60))} ore și ${Math.floor((timeUntilReminder % (1000 * 60 * 60)) / (1000 * 60))} minute`
        });
        
        setTimeout(async () => {
          console.log('🔔 DEBUG: Se execută reminder-ul programat pentru cerere de donație');
          console.log('📧 DEBUG: Se trimite email către:', user.email);
          await sendDonationRequestReminderEmail(user.email, {
            adresa,
            dataDonatie,
            oraDonatie,
            produse
          });
        }, timeUntilReminder);
      }
    }

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
    console.log("Donation request received:", { donatieId, userId, produsIndex });

    if (!userId || produsIndex === undefined) {
      return res.status(400).json({ 
        error: "Lipsesc câmpuri obligatorii",
        details: { userId: !userId, produsIndex: produsIndex === undefined }
      });
    }

    const donatie = await Donation.findById(donatieId);
    if (!donatie) {
      console.error("Donation not found:", donatieId);
      return res.status(404).json({ error: "Donația nu a fost găsită." });
    }

    const user = await User.findById(userId);
    if (!user) {
      console.error("User not found:", userId);
      return res.status(404).json({ error: "Utilizatorul nu a fost găsit." });
    }

    if (produsIndex < 0 || produsIndex >= donatie.produse.length) {
      console.error("Invalid product index:", produsIndex);
      return res.status(400).json({ 
        error: "Index produs invalid.",
        details: { 
          providedIndex: produsIndex,
          validRange: `0-${donatie.produse.length - 1}`
        }
      });
    }

    const produs = donatie.produse[produsIndex];
    if (produs.donat) {
      return res.status(400).json({ error: "Acest produs a fost deja donat." });
    }

   
    produs.donat = true;
    produs.donatedBy = userId;
    
   
    user.puncte += 10 * produs.cantitate;
    await user.save();

   
    const allDonated = donatie.produse.every(p => p.donat);
    const someDonated = donatie.produse.some(p => p.donat);
    
    if (allDonated) {
      donatie.status = "inchis";
    } else if (someDonated) {
      donatie.status = "partial";
    }

    await donatie.save();
    console.log("Donation updated successfully:", {
      donatieId,
      produsIndex,
      newStatus: donatie.status
    });

    res.json({ 
      message: "Produsul a fost donat cu succes.",
      newPoints: user.puncte,
      donationStatus: donatie.status
    });
  } catch (err) {
    console.error("Error processing donation:", err);
    res.status(500).json({ 
      error: "Eroare la procesarea donației.",
      details: err.message
    });
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

    // Get donations where user is the donor
    const donations = await Donation.find({
      "produse.donatedBy": userId
    });

    // Get donations created by the user
    const createdDonations = await Donation.find({
      userId: userId
    });

    const donatedItems = [];
    donations.forEach(donation => {
      donation.produse.forEach(produs => {
        if (produs.donatedBy && produs.donatedBy.toString() === userId) {
          donatedItems.push({
            donationId: donation._id,
            nume: donation.nume,
            adresa: donation.adresa,
            dataDonatie: donation.dataDonatie,
            oraDonatie: donation.oraDonatie,
            produs: produs
          });
        }
      });
    });

    res.json({
      user,
      donatedItems,
      createdDonations
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