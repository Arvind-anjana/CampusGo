import express from "express";

import {
  createRoute,
  getRoutes,
  getRoute,
  updateRoute,
  deleteRoute,
} from "../controllers/routeController.js";

import {
  authenticate,
  authorize,
} from "../middlewares/authMiddleware.js";

const router = express.Router();

router.post(
  "/",
  authenticate,
  authorize("TRANSPORT_MANAGER"),
  createRoute
);

router.get(
  "/",
  getRoutes
);

router.get(
  "/:routeId",
  getRoute
);

router.patch(
  "/:routeId",
  authenticate,
  authorize("TRANSPORT_MANAGER"),
  updateRoute
);

router.delete(
  "/:routeId",
  authenticate,
  authorize("TRANSPORT_MANAGER"),
  deleteRoute
);

export default router;