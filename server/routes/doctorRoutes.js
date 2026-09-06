import express from "express";

import {
  getDoctors,
  getDoctor,
  createDoctor,
  updateDoctor,
  deleteDoctor,
} from "../controllers/doctorController.js";

import { protect, authorize } from "../middleware/auth.js";

const router = express.Router();

router.get("/", protect, getDoctors);

router.get("/:id", protect, getDoctor);

router.post("/", protect, authorize("admin"), createDoctor);

router.put("/:id", protect, authorize("admin"), updateDoctor);

router.delete("/:id", protect, authorize("admin"), deleteDoctor);

export default router;
