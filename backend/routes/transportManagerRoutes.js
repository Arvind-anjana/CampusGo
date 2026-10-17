import express from "express";


import {
  registerTransportManager,
  getTransportManagers,
  getTransportManager,
  updateTransportManager,
  deleteTransportManager,
  createDriver,
  getDrivers,
  getDriver,
  updateDriver,
  deleteDriver,
} from "../controllers/userController.js";

import {
  authenticate,
  authorize,
} from "../middlewares/authMiddleware.js";

const router = express.Router();

router.post(
  "/register",
  registerTransportManager
);

router.post(
  "/drivers",
  authenticate,
  authorize("TRANSPORT_MANAGER"),
  createDriver
);

router.get(
  "/drivers",
  authenticate,
  authorize("TRANSPORT_MANAGER"),
  getDrivers
);

router.get(
  "/drivers/:userId",
  authenticate,
  authorize("TRANSPORT_MANAGER"),
  getDriver
);

router.patch(
  "/drivers/:userId",
  authenticate,
  authorize("TRANSPORT_MANAGER"),
  updateDriver
);

router.delete(
  "/drivers/:userId",
  authenticate,
  authorize("TRANSPORT_MANAGER"),
  deleteDriver
);

router.get(
  "/",
  authenticate,
  authorize("TRANSPORT_MANAGER"),
  getTransportManagers
);

router.get(
  "/:userId",
  authenticate,
  authorize("TRANSPORT_MANAGER"),
  getTransportManager
);

router.patch(
  "/:userId",
  authenticate,
  authorize("TRANSPORT_MANAGER"),
  updateTransportManager
);

router.delete(
  "/:userId",
  authenticate,
  authorize("TRANSPORT_MANAGER"),
  deleteTransportManager
);

export default router;