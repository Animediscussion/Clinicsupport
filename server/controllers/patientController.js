import Patient from "../models/Patient.js";

// Get all active patients
export const getPatients = async (req, res) => {
  try {
    const patients = await Patient.find({
      status: "active",
    }).sort({ createdAt: -1 });

    res.json(patients);
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch patients",
    });
  }
};

// Get single patient
export const getPatientById = async (req, res) => {
  try {
    const patient = await Patient.findById(req.params.id);

    if (!patient) {
      return res.status(404).json({
        message: "Patient not found",
      });
    }

    res.json(patient);
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch patient",
    });
  }
};

// Generate patient ID
const generatePatientId = async () => {
  const count = await Patient.countDocuments();

  return `PAT-${String(count + 1).padStart(6, "0")}`;
};

// Create patient
export const createPatient = async (req, res) => {
  try {
    const patientId = await generatePatientId();

    const patient = await Patient.create({
      ...req.body,
      patientId,
    });

    res.status(201).json(patient);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed to create patient",
    });
  }
};

// Update patient
export const updatePatient = async (req, res) => {
  try {
    const patient = await Patient.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!patient) {
      return res.status(404).json({
        message: "Patient not found",
      });
    }

    res.json(patient);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed to update patient",
    });
  }
};

// Deactivate patient
export const deletePatient = async (req, res) => {
  try {
    const patient = await Patient.findByIdAndUpdate(
      req.params.id,
      {
        status: "inactive",
      },
      {
        new: true,
      }
    );

    if (!patient) {
      return res.status(404).json({
        message: "Patient not found",
      });
    }

    res.json({
      message: "Patient deactivated successfully",
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed to deactivate patient",
    });
  }
};