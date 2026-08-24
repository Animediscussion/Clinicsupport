const mongoose = require("mongoose");

const patientSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    age: {
      type: Number,
      required: true,
    },

    gender: {
      type: String,
      enum: ["Male", "Female", "Other"],
      required: true,
    },

    phone: {
      type: String,
      required: true,
    },

    email: {
      type: String,
      trim: true,
      lowercase: true,
    },

    address: {
      type: String,
    },

    bloodGroup: {
      type: String,
    },

    medicalHistory: {
      type: String,
    },
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model("Patient", patientSchema);
