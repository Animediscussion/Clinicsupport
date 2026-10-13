import mongoose from "mongoose";

const medicineSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 150,
    },
    dosage: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    frequency: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    duration: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    quantity: {
      type: Number,
      min: 1,
      default: 1,
    },
    instructions: {
      type: String,
      trim: true,
      maxlength: 500,
      default: "",
    },
  },
  { _id: true },
);

const prescriptionSchema = new mongoose.Schema(
  {
    patient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Patient",
      required: true,
      index: true,
    },
    doctor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Doctor",
      required: true,
      index: true,
    },
    appointment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Appointment",
      default: null,
    },
    diagnosis: {
      type: String,
      required: true,
      trim: true,
      maxlength: 2000,
    },
    clinicalNotes: {
      type: String,
      trim: true,
      maxlength: 5000,
      default: "",
    },
    medicines: {
      type: [medicineSchema],
      validate: {
        validator: (medicines) => medicines.length > 0,
        message: "At least one medicine is required.",
      },
    },
    advice: {
      type: String,
      trim: true,
      maxlength: 3000,
      default: "",
    },
    followUpDate: {
      type: Date,
      default: null,
    },
    status: {
      type: String,
      enum: ["active", "void"],
      default: "active",
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
  },
  { timestamps: true },
);

prescriptionSchema.index({
  patient: 1,
  createdAt: -1,
});

const Prescription = mongoose.model("Prescription", prescriptionSchema);

export default Prescription;
