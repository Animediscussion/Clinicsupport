import mongoose from "mongoose";

const patientSchema = new mongoose.Schema(
  {
    patientId: {
      type: String,
      unique: true,
      required: true,
    },

    name: {
      type: String,
      required: true,
      trim: true,
    },

    dateOfBirth: {
      type: Date,
    },

    age: {
      type: Number,
      min: 0,
    },

    gender: {
      type: String,
      enum: ["Male", "Female", "Other"],
      required: true,
    },

    bloodGroup: {
      type: String,
      enum: ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-", "Unknown"],
      default: "Unknown",
    },

    phone: {
      type: String,
      required: true,
    },

    email: {
      type: String,
      lowercase: true,
      trim: true,
    },

    address: {
      type: String,
    },

    emergencyContact: {
      name: {
        type: String,
      },

      relationship: {
        type: String,
      },

      phone: {
        type: String,
      },
    },

    allergies: {
      type: String,
    },

    medicalHistory: {
      type: String,
    },

    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
    },
  },
  {
    timestamps: true,
  },
);

export default mongoose.model("Patient", patientSchema);
