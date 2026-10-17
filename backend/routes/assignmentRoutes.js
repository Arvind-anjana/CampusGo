import express from "express";

import {
  createAssignment,
  getAssignments,
  getAssignment,
  getMyAssignment,
  updateAssignment,
  deleteAssignment,
} from "../controllers/assignmentController.js";

import {
  authenticate,
  authorize,
} from "../middlewares/authMiddleware.js";

const router = express.Router();

router.post(
  "/",
  authenticate,
  authorize("TRANSPORT_MANAGER"),
  createAssignment
);

router.get(
  "/",
  authenticate,
  authorize("TRANSPORT_MANAGER"),
  getAssignments
);

router.get(
  "/my",
  authenticate,
  authorize("DRIVER"),
  getMyAssignment
);

router.get(
  "/:id",
  authenticate,
  authorize("TRANSPORT_MANAGER"),
  getAssignment
);

router.patch(
  "/:id",
  authenticate,
  authorize("TRANSPORT_MANAGER"),
  updateAssignment
);

router.delete(
  "/:id",
  authenticate,
  authorize("TRANSPORT_MANAGER"),
  deleteAssignment
);

export default router;