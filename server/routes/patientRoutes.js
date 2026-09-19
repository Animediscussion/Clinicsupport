import express from "express";

import {
  getPatients,
  getPatientById,
  createPatient,
  updatePatient,
  deletePatient,
} from "../controllers/patientController.js";

import { auth, authorize } from "../middleware/auth.js";

const router = express.Router();

router.get("/", auth, getPatients);

router.get("/:id", auth, getPatientById);

router.post("/", auth, authorize("admin", "receptionist"), createPatient);

router.put("/:id", auth, authorize("admin", "receptionist"), updatePatient);

router.delete("/:id", auth, authorize("admin"), deletePatient);

export default router;
