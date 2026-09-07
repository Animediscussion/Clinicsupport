import express from "express";

import {
  getPatients,
  getPatient,
  createPatient,
  updatePatient,
  deletePatient,
} from "../controllers/patientController.js";

import { protect, authorize } from "../middleware/auth.js";

const router = express.Router();

router.get("/", protect, getPatients);

router.get("/:id", protect, getPatient);

router.post("/", protect, authorize("admin"), createPatient);

router.put("/:id", protect, authorize("admin"), updatePatient);

router.delete("/:id", protect, authorize("admin"), deletePatient);

export default router;
