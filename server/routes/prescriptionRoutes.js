import express from "express";

import {
  getPrescriptions,
  getPrescriptionById,
  createPrescription,
  voidPrescription,
} from "../controllers/prescriptionController.js";

import { protect, authorize } from "../middleware/auth.js";

const router = express.Router();

router.get("/", protect, getPrescriptions);

// Keep the fixed routes above /:id.
router.post("/", protect, authorize("admin", "doctor"), createPrescription);

router.patch(
  "/:id/void",
  protect,
  authorize("admin", "doctor"),
  voidPrescription,
);

router.get("/:id", protect, getPrescriptionById);

export default router;
