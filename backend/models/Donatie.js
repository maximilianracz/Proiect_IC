const mongoose = require("mongoose");

const produsSchema = new mongoose.Schema({
  tip: String,
  marime: String,
  cantitate: Number,
});

const donatieSchema = new mongoose.Schema({
  nume: String,
  adresa: String,
  produse: [produsSchema],
});

module.exports = mongoose.model("Donatie", donatieSchema);
