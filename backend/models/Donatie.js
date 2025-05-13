const mongoose = require("mongoose");

const donatieSchema = new mongoose.Schema({
  nume: String,
  adresa: String,
  produse: [
    {
      tip: String,
      marime: String,
      cantitate: Number,
      donat: { type: Boolean, default: false },
      donatedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        default: null,
      },
    },
  ],
  status: {
    type: String,
    enum: ["deschis", "partial", "inchis"],
    default: "deschis",
  },
});

const Donation = mongoose.model("Donation", donatieSchema);

module.exports = Donation;