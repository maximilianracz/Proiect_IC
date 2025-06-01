const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require('dotenv');
const axios = require('axios');

dotenv.config();

const app = express();

app.use(express.json());
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
console.log(process.env.MONGO_URI);

// Conectare la MongoDB
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log("MongoDB conectat"))
.catch((err) => console.log(err));

// Importăm rutele
const authRoutes = require("./routes/authRoutes");
app.use("/auth", authRoutes);

const donationRoutes = require("./routes/donationRoutes");
app.use("/donatii", donationRoutes);

// Proxy endpoint pentru geocoding
app.get("/geocode", async (req, res) => {
  try {
    const { address } = req.query;
    const response = await axios.get(
      `https://nominatim.openstreetmap.org/search`,
      {
        params: {
          format: 'json',
          q: address,
          countrycodes: 'ro'
        },
        headers: {
          'User-Agent': 'DonationApp/1.0'
        }
      }
    );
    res.json(response.data);
  } catch (error) {
    console.error("Geocoding error:", error);
    res.status(500).json({ error: "Geocoding failed" });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Serverul rulează pe portul ${PORT}`));


