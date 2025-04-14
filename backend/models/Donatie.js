const mongoose = require("mongoose");

const donatieSchema = new mongoose.Schema({
  nume: String,
  adresa: String,
  produse: [
    {
      tip: String,
      marime: String,
      cantitate: Number,
    },
  ],
  status: {
    type: String,
    enum: ["deschis", "inchis"],
    default: "deschis",
  },
});

const Donation = mongoose.model("Donation", donatieSchema);

module.exports = Donation;
