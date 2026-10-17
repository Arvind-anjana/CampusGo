import express from "express";

import {
  createBus,
  getBuses,
  getBus,
  updateBus,
  deleteBus,
} from "../controllers/busController.js";

import {
  authenticate,
  authorize,
} from "../middlewares/authMiddleware.js";

const router = express.Router();

router.post(
  "/",
  authenticate,
  authorize("TRANSPORT_MANAGER"),
  createBus
);

router.get(
  "/",
  getBuses
);

router.get(
  "/:busId",
  getBus
);

router.patch(
  "/:busId",
  authenticate,
  authorize("TRANSPORT_MANAGER"),
  updateBus
);

router.delete(
  "/:busId",
  authenticate,
  authorize("TRANSPORT_MANAGER"),
  deleteBus
);

export default router;