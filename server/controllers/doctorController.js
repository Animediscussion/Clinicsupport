import Doctor from "../models/Doctor.js";

// Get all doctors
export const getDoctors = async (req, res) => {
  try {
    const doctors = await Doctor.find().sort({
      createdAt: -1,
    });

    res.json(doctors);
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch doctors",
      error: error.message,
    });
  }
};

// Get single doctor
export const getDoctor = async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.params.id);

    if (!doctor) {
      return res.status(404).json({
        message: "Doctor not found",
      });
    }

    res.json(doctor);
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch doctor",
    });
  }
};

// Create doctor
export const createDoctor = async (req, res) => {
  try {
    const doctor = await Doctor.create(req.body);

    res.status(201).json(doctor);
  } catch (error) {
    res.status(400).json({
      message: "Failed to create doctor",
      error: error.message,
    });
  }
};

// Update doctor
export const updateDoctor = async (req, res) => {
  try {
    const doctor = await Doctor.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!doctor) {
      return res.status(404).json({
        message: "Doctor not found",
      });
    }

    res.json(doctor);
  } catch (error) {
    res.status(400).json({
      message: "Failed to update doctor",
      error: error.message,
    });
  }
};

// Delete doctor
export const deleteDoctor = async (req, res) => {
  try {
    const doctor = await Doctor.findByIdAndDelete(req.params.id);

    if (!doctor) {
      return res.status(404).json({
        message: "Doctor not found",
      });
    }

    res.json({
      message: "Doctor deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to delete doctor",
    });
  }
};
