import Appointment from "../models/Appointment.js";
import Patient from "../models/Patient.js";
import Doctor from "../models/Doctor.js";

// ==========================================
// Get all appointments
// ==========================================
export const getAppointments = async (req, res) => {
  try {
    const appointments = await Appointment.find()
      .populate("patient", "patientId name phone")
      .populate("doctor", "name specialization consultationFee")
      .sort({
        appointmentDate: 1,
        appointmentTime: 1,
      });

    res.json(appointments);
  } catch (error) {
    console.error("Get appointments error:", error);

    res.status(500).json({
      message: "Failed to fetch appointments",
    });
  }
};

// ==========================================
// Get single appointment
// ==========================================
export const getAppointmentById = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id)
      .populate("patient", "patientId name phone email")
      .populate("doctor", "name specialization consultationFee");

    if (!appointment) {
      return res.status(404).json({
        message: "Appointment not found",
      });
    }

    res.json(appointment);
  } catch (error) {
    console.error("Get appointment error:", error);

    res.status(500).json({
      message: "Failed to fetch appointment",
    });
  }
};

// ==========================================
// Create appointment
// ==========================================
export const createAppointment = async (req, res) => {
  try {
    const { patient, doctor, appointmentDate, appointmentTime, reason, notes } =
      req.body;

    // -------------------------------
    // Validate required fields
    // -------------------------------
    if (!patient || !doctor || !appointmentDate || !appointmentTime) {
      return res.status(400).json({
        message: "Patient, doctor, date and time are required.",
      });
    }

    // -------------------------------
    // Check patient
    // -------------------------------
    const patientExists = await Patient.findOne({
      _id: patient,
      status: "active",
    });

    if (!patientExists) {
      return res.status(404).json({
        message: "Patient not found or is inactive.",
      });
    }

    // -------------------------------
    // Check doctor
    // -------------------------------
    const doctorExists = await Doctor.findOne({
      _id: doctor,
      status: "active",
    });

    if (!doctorExists) {
      return res.status(404).json({
        message: "Doctor not found or is inactive.",
      });
    }

    // -------------------------------
    // Create appointment
    // -------------------------------
    try {
      const appointment = await Appointment.create({
        patient,
        doctor,
        appointmentDate,
        appointmentTime,
        reason,
        notes,
      });

      const populatedAppointment = await Appointment.findById(appointment._id)
        .populate("patient", "patientId name phone")
        .populate("doctor", "name specialization consultationFee");

      res.status(201).json(populatedAppointment);
    } catch (error) {
      // MongoDB duplicate key error
      if (error.code === 11000) {
        return res.status(409).json({
          message:
            "This doctor already has an appointment at this date and time.",
        });
      }

      throw error;
    }
  } catch (error) {
    console.error("Create appointment error:", error);

    res.status(500).json({
      message: "Failed to create appointment",
    });
  }
};

// ==========================================
// Update appointment
// ==========================================
export const updateAppointment = async (req, res) => {
  try {
    const {
      patient,
      doctor,
      appointmentDate,
      appointmentTime,
      reason,
      notes,
      status,
    } = req.body;

    const appointment = await Appointment.findById(req.params.id);

    if (!appointment) {
      return res.status(404).json({
        message: "Appointment not found",
      });
    }

    // -------------------------------
    // Validate patient if changed
    // -------------------------------
    if (patient) {
      const patientExists = await Patient.findOne({
        _id: patient,
        status: "active",
      });

      if (!patientExists) {
        return res.status(404).json({
          message: "Patient not found or is inactive.",
        });
      }

      appointment.patient = patient;
    }

    // -------------------------------
    // Validate doctor if changed
    // -------------------------------
    if (doctor) {
      const doctorExists = await Doctor.findOne({
        _id: doctor,
        status: "active",
      });

      if (!doctorExists) {
        return res.status(404).json({
          message: "Doctor not found or is inactive.",
        });
      }

      appointment.doctor = doctor;
    }

    // -------------------------------
    // Update fields
    // -------------------------------
    if (appointmentDate !== undefined) {
      appointment.appointmentDate = appointmentDate;
    }

    if (appointmentTime !== undefined) {
      appointment.appointmentTime = appointmentTime;
    }

    if (reason !== undefined) {
      appointment.reason = reason;
    }

    if (notes !== undefined) {
      appointment.notes = notes;
    }

    if (status !== undefined) {
      appointment.status = status;
    }

    try {
      await appointment.save();
    } catch (error) {
      if (error.code === 11000) {
        return res.status(409).json({
          message:
            "This doctor already has an appointment at this date and time.",
        });
      }

      throw error;
    }

    const updatedAppointment = await Appointment.findById(appointment._id)
      .populate("patient", "patientId name phone")
      .populate("doctor", "name specialization consultationFee");

    res.json(updatedAppointment);
  } catch (error) {
    console.error("Update appointment error:", error);

    res.status(500).json({
      message: "Failed to update appointment",
    });
  }
};

// ==========================================
// Cancel appointment
// ==========================================
export const cancelAppointment = async (req, res) => {
  try {
    const appointment = await Appointment.findByIdAndUpdate(
      req.params.id,
      {
        status: "cancelled",
      },
      {
        new: true,
      },
    );

    if (!appointment) {
      return res.status(404).json({
        message: "Appointment not found",
      });
    }

    res.json({
      message: "Appointment cancelled successfully.",
      appointment,
    });
  } catch (error) {
    console.error("Cancel appointment error:", error);

    res.status(500).json({
      message: "Failed to cancel appointment",
    });
  }
};
