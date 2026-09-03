import express from "express";

import {
  getDoctors,
  getDoctor,
  createDoctor,
  updateDoctor,
  deleteDoctor,
} from "../controllers/doctorController.js";

import { auth } from "../middleware/auth.js";
import { authorize } from "../middleware/authorize.js";

const router = express.Router();

router.get("/", auth, getDoctors);

router.get("/:id", auth, getDoctor);

router.post("/", auth, authorize("admin"), createDoctor);

router.put("/:id", auth, authorize("admin"), updateDoctor);

router.delete("/:id", auth, authorize("admin"), deleteDoctor);

export default router;
