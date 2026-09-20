import express from "express";

import {
  getPatients,
  getPatientById,
  createPatient,
  updatePatient,
  deletePatient,
} from "../controllers/patientController.js";

import { protect, authorize } from "../middleware/auth.js";

const router = express.Router();

router.get("/", protect, getPatients);

router.get("/:id", protect, getPatientById);

router.post("/", protect, authorize("admin", "receptionist"), createPatient);

router.put("/:id", protect, authorize("admin", "receptionist"), updatePatient);

router.delete("/:id", protect, authorize("admin"), deletePatient);

export default router;
