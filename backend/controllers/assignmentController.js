import Assignment from "../models/Assignment.js";
import User from "../models/Users.js";
import Bus from "../models/Bus.js";
import Route from "../models/Route.js";

export const createAssignment = async (req, res) => {
  try {
    const { driverId, busId, routeId } = req.body;

    if (!driverId || !busId || !routeId) {
      return res.status(400).json({
        success: false,
        message: "Driver ID, bus ID and route ID are required",
      });
    }

    const driver = await User.findOne({
      userId: driverId,
      role: "DRIVER",
      isActive: true,
    });

    if (!driver) {
      return res.status(404).json({
        success: false,
        message: "Driver not found",
      });
    }

    const bus = await Bus.findOne({
      busId,
      isActive: true,
    });

    if (!bus) {
      return res.status(404).json({
        success: false,
        message: "Bus not found",
      });
    }

    const route = await Route.findOne({
      routeId,
      isActive: true,
    });

    if (!route) {
      return res.status(404).json({
        success: false,
        message: "Route not found",
      });
    }

    const existingAssignment = await Assignment.findOne({
      driverId,
      busId,
      routeId,
    });

    if (existingAssignment) {
      return res.status(409).json({
        success: false,
        message: "This assignment already exists",
      });
    }

    const assignment = await Assignment.create({
      driverId,
      busId,
      routeId,
      createdBy: req.user.userId,
    });

    return res.status(201).json({
      success: true,
      message: "Assignment created successfully",
      data: assignment,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Failed to create assignment",
    });
  }
};

export const getAssignments = async (req, res) => {
  try {
    const assignments = await Assignment.find()
      .sort({ createdAt: -1 })
      .select("-__v");

    return res.status(200).json({
      success: true,
      count: assignments.length,
      data: assignments,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch assignments",
    });
  }
};

export const getAssignment = async (req, res) => {
  try {
    const { id } = req.params;

    const assignment = await Assignment.findById(id).select("-__v");

    if (!assignment) {
      return res.status(404).json({
        success: false,
        message: "Assignment not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: assignment,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch assignment",
    });
  }
};

export const getMyAssignment = async (req, res) => {
  try {
    const assignment = await Assignment.findOne({
      driverId: req.user.userId,
    }).select("-__v");

    if (!assignment) {
      return res.status(404).json({
        success: false,
        message: "No assignment found for this driver",
      });
    }

    const [bus, route] = await Promise.all([
      Bus.findOne({
        busId: assignment.busId,
        isActive: true,
      }).select("busId busNo registrationNo"),

      Route.findOne({
        routeId: assignment.routeId,
        isActive: true,
      }).select("routeId name description stops geometry"),
    ]);

    return res.status(200).json({
      success: true,
      data: {
        assignmentId: assignment._id,
        driverId: assignment.driverId,
        bus,
        route,
      },
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch driver assignment",
    });
  }
};

export const updateAssignment = async (req, res) => {
  try {
    const { id } = req.params;
    const { driverId, busId, routeId } = req.body;

    const assignment = await Assignment.findById(id);

    if (!assignment) {
      return res.status(404).json({
        success: false,
        message: "Assignment not found",
      });
    }

    if (driverId !== undefined) {
      const driver = await User.findOne({
        userId: driverId,
        role: "DRIVER",
        isActive: true,
      });

      if (!driver) {
        return res.status(404).json({
          success: false,
          message: "Driver not found",
        });
      }

      assignment.driverId = driverId;
    }

    if (busId !== undefined) {
      const bus = await Bus.findOne({
        busId,
        isActive: true,
      });

      if (!bus) {
        return res.status(404).json({
          success: false,
          message: "Bus not found",
        });
      }

      assignment.busId = busId;
    }

    if (routeId !== undefined) {
      const route = await Route.findOne({
        routeId,
        isActive: true,
      });

      if (!route) {
        return res.status(404).json({
          success: false,
          message: "Route not found",
        });
      }

      assignment.routeId = routeId;
    }

    const duplicate = await Assignment.findOne({
      _id: { $ne: id },
      driverId: assignment.driverId,
      busId: assignment.busId,
      routeId: assignment.routeId,
    });

    if (duplicate) {
      return res.status(409).json({
        success: false,
        message: "This assignment already exists",
      });
    }

    await assignment.save();

    return res.status(200).json({
      success: true,
      message: "Assignment updated successfully",
      data: assignment,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Failed to update assignment",
    });
  }
};

export const deleteAssignment = async (req, res) => {
  try {
    const { id } = req.params;

    const assignment = await Assignment.findByIdAndDelete(id);

    if (!assignment) {
      return res.status(404).json({
        success: false,
        message: "Assignment not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Assignment deleted successfully",
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Failed to delete assignment",
    });
  }
};