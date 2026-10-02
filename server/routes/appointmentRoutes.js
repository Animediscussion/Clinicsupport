import express from "express";

import {
  getAppointments,
  getAppointmentById,
  createAppointment,
  updateAppointment,
  cancelAppointment,
  getAvailableSlots,
} from "../controllers/appointmentController.js";

import { protect, authorize } from "../middleware/auth.js";

const router = express.Router();

// ==========================================
// Get appointments
// Admin / Doctor / Receptionist
// ==========================================
router.get("/", protect, getAppointments);

// ==========================================
// Get single appointment
// ==========================================
router.get("/:id", protect, getAppointmentById);

router.get("/availability", protect, getAvailableSlots);

// ==========================================
// Create appointment
// Admin / Receptionist
// ==========================================
router.post(
  "/",
  protect,
  authorize("admin", "receptionist"),
  createAppointment,
);

// ==========================================
// Update appointment
// Admin / Receptionist
// ==========================================
router.put(
  "/:id",
  protect,
  authorize("admin", "receptionist"),
  updateAppointment,
);

// ==========================================
// Cancel appointment
// Admin / Receptionist
// ==========================================
router.patch(
  "/:id/cancel",
  protect,
  authorize("admin", "receptionist"),
  cancelAppointment,
);

export default router;
