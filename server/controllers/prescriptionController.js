import Prescription from "../models/Prescription.js";
import Patient from "../models/Patient.js";
import Doctor from "../models/Doctor.js";
import Appointment from "../models/Appointment.js";

const populatePrescription = (query) =>
  query
    .populate("patient", "patientId name phone dateOfBirth")
    .populate("doctor", "name specialization qualification")
    .populate("appointment", "appointmentDate appointmentTime status");

// GET /api/prescriptions
export const getPrescriptions = async (req, res) => {
  try {
    const { patientId, from, to } = req.query;
    const filter = { status: "active" };

    if (patientId) {
      filter.patient = patientId;
    }

    if (from || to) {
      filter.createdAt = {};

      if (from) {
        const start = new Date(`${from}T00:00:00.000Z`);

        if (Number.isNaN(start.getTime())) {
          return res.status(400).json({
            message: "Invalid start date.",
          });
        }

        filter.createdAt.$gte = start;
      }

      if (to) {
        const end = new Date(`${to}T23:59:59.999Z`);

        if (Number.isNaN(end.getTime())) {
          return res.status(400).json({
            message: "Invalid end date.",
          });
        }

        filter.createdAt.$lte = end;
      }
    }

    const prescriptions = await populatePrescription(
      Prescription.find(filter).sort({ createdAt: -1 }),
    );

    res.json(prescriptions);
  } catch (error) {
    console.error("Get prescriptions error:", error);

    res.status(500).json({
      message: "Failed to fetch prescriptions.",
    });
  }
};

// GET /api/prescriptions/:id
export const getPrescriptionById = async (req, res) => {
  try {
    const prescription = await populatePrescription(
      Prescription.findById(req.params.id),
    );

    if (!prescription || prescription.status === "void") {
      return res.status(404).json({
        message: "Prescription not found.",
      });
    }

    res.json(prescription);
  } catch (error) {
    if (error.name === "CastError") {
      return res.status(400).json({
        message: "Invalid prescription ID.",
      });
    }

    res.status(500).json({
      message: "Failed to fetch prescription.",
    });
  }
};

// POST /api/prescriptions
export const createPrescription = async (req, res) => {
  try {
    const {
      patient,
      doctor,
      appointment,
      diagnosis,
      clinicalNotes,
      medicines,
      advice,
      followUpDate,
    } = req.body;

    if (
      !patient ||
      !doctor ||
      !diagnosis?.trim() ||
      !Array.isArray(medicines) ||
      medicines.length === 0
    ) {
      return res.status(400).json({
        message:
          "Patient, doctor, diagnosis, and at least one medicine are required.",
      });
    }

    const [patientRecord, doctorRecord] = await Promise.all([
      Patient.findOne({ _id: patient, status: "active" }),
      Doctor.findOne({ _id: doctor, status: "active" }),
    ]);

    if (!patientRecord) {
      return res.status(404).json({
        message: "Active patient not found.",
      });
    }

    if (!doctorRecord) {
      return res.status(404).json({
        message: "Active doctor not found.",
      });
    }

    if (appointment) {
      const appointmentRecord = await Appointment.findById(appointment);

      if (!appointmentRecord) {
        return res.status(404).json({
          message: "Appointment not found.",
        });
      }

      if (
        String(appointmentRecord.patient) !== String(patient) ||
        String(appointmentRecord.doctor) !== String(doctor)
      ) {
        return res.status(400).json({
          message:
            "The selected appointment does not match the patient and doctor.",
        });
      }

      if (appointmentRecord.status === "cancelled") {
        return res.status(400).json({
          message: "A cancelled appointment cannot be prescribed.",
        });
      }
    }

    const prescription = await Prescription.create({
      patient,
      doctor,
      appointment: appointment || null,
      diagnosis,
      clinicalNotes,
      medicines,
      advice,
      followUpDate: followUpDate || null,
      createdBy: req.user?._id || null,
    });

    const populated = await populatePrescription(
      Prescription.findById(prescription._id),
    );

    res.status(201).json(populated);
  } catch (error) {
    if (error.name === "ValidationError" || error.name === "CastError") {
      return res.status(400).json({
        message: error.message,
      });
    }

    console.error("Create prescription error:", error);

    res.status(500).json({
      message: "Failed to create prescription.",
    });
  }
};

// PATCH /api/prescriptions/:id/void
// Preserve the record instead of permanently deleting it.
export const voidPrescription = async (req, res) => {
  try {
    const prescription = await Prescription.findByIdAndUpdate(
      req.params.id,
      { status: "void" },
      { new: true, runValidators: true },
    );

    if (!prescription) {
      return res.status(404).json({
        message: "Prescription not found.",
      });
    }

    res.json({
      message: "Prescription voided successfully.",
      prescription,
    });
  } catch (error) {
    if (error.name === "CastError") {
      return res.status(400).json({
        message: "Invalid prescription ID.",
      });
    }

    res.status(500).json({
      message: "Failed to void prescription.",
    });
  }
};
