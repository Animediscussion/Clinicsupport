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

// ==========================================
// Time helper: HH:mm -> minutes
// ==========================================
const timeToMinutes = (time) => {
  const [hours, minutes] = time.split(":").map(Number);

  return hours * 60 + minutes;
};

// ==========================================
// Get available appointment slots
// ==========================================
export const getAvailableSlots = async (req, res) => {
  try {
    const { doctorId, date } = req.query;

    // -------------------------------
    // Validate required fields
    // -------------------------------
    if (!doctorId || !date) {
      return res.status(400).json({
        message: "Doctor ID and date are required.",
      });
    }

    // -------------------------------
    // Validate date format
    // -------------------------------
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return res.status(400).json({
        message: "Invalid date format. Use YYYY-MM-DD.",
      });
    }

    // -------------------------------
    // Validate actual calendar date
    // -------------------------------
    const parsedDate = new Date(`${date}T00:00:00.000Z`);

    if (
      Number.isNaN(parsedDate.getTime()) ||
      parsedDate.toISOString().slice(0, 10) !== date
    ) {
      return res.status(400).json({
        message: "Invalid calendar date.",
      });
    }

    // -------------------------------
    // Find active doctor
    // -------------------------------
    const doctor = await Doctor.findOne({
      _id: doctorId,
      status: "active",
    });

    if (!doctor) {
      return res.status(404).json({
        message: "Doctor not found or inactive.",
      });
    }

    // -------------------------------
    // Get selected weekday
    // -------------------------------
    const weekdays = [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ];

    const selectedDay = weekdays[parsedDate.getUTCDay()];

    // -------------------------------
    // Check doctor's working day
    // -------------------------------
    if (!doctor.availability?.days?.includes(selectedDay)) {
      return res.json({
        date,
        doctorId,
        availableSlots: [],
        message: "Doctor is not available on this day.",
      });
    }

    // -------------------------------
    // Get doctor's working hours
    // -------------------------------
    const startTime = doctor.availability.startTime;
    const endTime = doctor.availability.endTime;

    const startMinutes = timeToMinutes(startTime);
    const endMinutes = timeToMinutes(endTime);

    if (
      !Number.isFinite(startMinutes) ||
      !Number.isFinite(endMinutes) ||
      startMinutes >= endMinutes
    ) {
      return res.status(400).json({
        message: "Doctor availability is configured incorrectly.",
      });
    }

    // -------------------------------
    // Get booked appointments
    // -------------------------------
    const bookedAppointments = await Appointment.find({
      doctor: doctorId,
      appointmentDate: date,
      status: {
        $in: ["scheduled", "completed", "no-show"],
      },
    }).select("appointmentTime");

    const bookedTimes = new Set(
      bookedAppointments.map((appointment) => appointment.appointmentTime),
    );

    // -------------------------------
    // Generate 30-minute slots
    // -------------------------------
    const availableSlots = [];

    for (let time = startMinutes; time + 30 <= endMinutes; time += 30) {
      const hours = String(Math.floor(time / 60)).padStart(2, "0");
      const minutes = String(time % 60).padStart(2, "0");

      const slot = `${hours}:${minutes}`;

      if (!bookedTimes.has(slot)) {
        availableSlots.push(slot);
      }
    }

    // -------------------------------
    // Return available slots
    // -------------------------------
    res.json({
      doctorId,
      date,
      availableSlots,
    });
  } catch (error) {
    console.error("Get available slots error:", error);

    res.status(500).json({
      message: "Failed to fetch available slots.",
    });
  }
};
