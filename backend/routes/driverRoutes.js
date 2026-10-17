import express from "express";

import {
  getDriver,
  updateDriver,
} from "../controllers/userController.js";

import {
  authenticate,
  authorize,
} from "../middlewares/authMiddleware.js";

const router = express.Router();

router.get(
  "/me",
  authenticate,
  authorize("DRIVER"),
  (req, res) => {
    res.status(200).json({
      success: true,
      data: req.user,
    });
  }
);

router.get(
  "/:userId",
  authenticate,
  authorize("DRIVER"),
  getDriver
);

router.patch(
  "/:userId",
  authenticate,
  authorize("DRIVER"),
  updateDriver
);

export default router;