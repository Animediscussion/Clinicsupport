import mongoose from "mongoose";

const appointmentSchema = new mongoose.Schema(
  {
    patient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Patient",
      required: true,
    },

    doctor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Doctor",
      required: true,
    },

    // Store as YYYY-MM-DD
    appointmentDate: {
      type: String,
      required: true,
      match: /^\d{4}-\d{2}-\d{2}$/,
    },

    // Store as HH:mm, for example 09:30
    appointmentTime: {
      type: String,
      required: true,
      match: /^([01]\d|2[0-3]):([0-5]\d)$/,
    },

    reason: {
      type: String,
      trim: true,
      maxlength: 500,
    },

    notes: {
      type: String,
      trim: true,
    },

    status: {
      type: String,
      enum: ["scheduled", "completed", "cancelled", "no-show"],
      default: "scheduled",
    },
  },
  {
    timestamps: true,
  },
);

// Prevent two non-cancelled appointments
// for the same doctor at the same date/time.
appointmentSchema.index(
  {
    doctor: 1,
    appointmentDate: 1,
    appointmentTime: 1,
  },
  {
    unique: true,
    partialFilterExpression: {
      status: {
        $in: ["scheduled", "completed", "no-show"],
      },
    },
  },
);

const Appointment = mongoose.model("Appointment", appointmentSchema);

export default Appointment;
