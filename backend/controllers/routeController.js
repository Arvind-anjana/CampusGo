import Route from "../models/Route.js";

const generateRouteId = async () => {
  while (true) {
    const number = Math.floor(Math.random() * 99) + 1;
    const routeId = `R${String(number).padStart(2, "0")}`;

    const existingRoute = await Route.findOne({ routeId });

    if (!existingRoute) {
      return routeId;
    }
  }
};

const generateStopId = (index) => {
  return `S${String(index + 1).padStart(2, "0")}`;
};

const validateCoordinates = (coordinates) => {
  return (
    Array.isArray(coordinates) &&
    coordinates.length === 2 &&
    typeof coordinates[0] === "number" &&
    typeof coordinates[1] === "number" &&
    coordinates[0] >= -180 &&
    coordinates[0] <= 180 &&
    coordinates[1] >= -90 &&
    coordinates[1] <= 90
  );
};

export const createRoute = async (req, res) => {
  try {
    const {
      name,
      description,
      stops,
      geometry,
    } = req.body;

    if (!name || !Array.isArray(stops) || !geometry) {
      return res.status(400).json({
        success: false,
        message: "Name, stops and geometry are required",
      });
    }

    if (stops.length < 2) {
      return res.status(400).json({
        success: false,
        message: "A route must have at least two stops",
      });
    }

    if (
      geometry.type !== "LineString" ||
      !Array.isArray(geometry.coordinates) ||
      geometry.coordinates.length < 2
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid route geometry",
      });
    }

    for (const coordinate of geometry.coordinates) {
      if (!validateCoordinates(coordinate)) {
        return res.status(400).json({
          success: false,
          message: "Invalid geometry coordinates",
        });
      }
    }

    for (const stop of stops) {
      if (!stop.name || !stop.location) {
        return res.status(400).json({
          success: false,
          message: "Every stop must have a name and location",
        });
      }

      if (
        stop.location.type !== "Point" ||
        !validateCoordinates(stop.location.coordinates)
      ) {
        return res.status(400).json({
          success: false,
          message: `Invalid location for stop ${stop.name}`,
        });
      }
    }

    const routeId = await generateRouteId();

    const formattedStops = stops.map((stop, index) => ({
      stopId: generateStopId(index),
      name: stop.name,
      sequence: index + 1,
      location: {
        type: "Point",
        coordinates: stop.location.coordinates,
      },
    }));

    const route = await Route.create({
      routeId,
      name,
      description: description || "",
      stops: formattedStops,
      geometry: {
        type: "LineString",
        coordinates: geometry.coordinates,
      },
      isActive: true,
      createdBy: req.user.userId,
    });

    return res.status(201).json({
      success: true,
      message: "Route created successfully",
      data: route,
    });
  } catch (error) {
    console.error("Create route error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to create route",
    });
  }
};

export const getRoutes = async (req, res) => {
  try {
    const routes = await Route.find({
      isActive: true,
    }).sort({
      createdAt: -1,
    });

    return res.status(200).json({
      success: true,
      count: routes.length,
      data: routes,
    });
  } catch (error) {
    console.error("Get routes error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch routes",
    });
  }
};

export const getRoute = async (req, res) => {
  try {
    const { routeId } = req.params;

    const route = await Route.findOne({
      routeId,
    });

    if (!route) {
      return res.status(404).json({
        success: false,
        message: "Route not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: route,
    });
  } catch (error) {
    console.error("Get route error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch route",
    });
  }
};

export const updateRoute = async (req, res) => {
  try {
    const { routeId } = req.params;

    const {
      name,
      description,
      stops,
      geometry,
      isActive,
    } = req.body;

    const route = await Route.findOne({
      routeId,
    });

    if (!route) {
      return res.status(404).json({
        success: false,
        message: "Route not found",
      });
    }

    if (name !== undefined) {
      route.name = name;
    }

    if (description !== undefined) {
      route.description = description;
    }

    if (isActive !== undefined) {
      route.isActive = isActive;
    }

    if (stops !== undefined) {
      if (!Array.isArray(stops) || stops.length < 2) {
        return res.status(400).json({
          success: false,
          message: "A route must have at least two stops",
        });
      }

      for (const stop of stops) {
        if (!stop.name || !stop.location) {
          return res.status(400).json({
            success: false,
            message: "Every stop must have a name and location",
          });
        }

        if (
          stop.location.type !== "Point" ||
          !validateCoordinates(stop.location.coordinates)
        ) {
          return res.status(400).json({
            success: false,
            message: `Invalid location for stop ${stop.name}`,
          });
        }
      }

      route.stops = stops.map((stop, index) => ({
        stopId: stop.stopId || generateStopId(index),
        name: stop.name,
        sequence: index + 1,
        location: {
          type: "Point",
          coordinates: stop.location.coordinates,
        },
      }));
    }

    if (geometry !== undefined) {
      if (
        geometry.type !== "LineString" ||
        !Array.isArray(geometry.coordinates) ||
        geometry.coordinates.length < 2
      ) {
        return res.status(400).json({
          success: false,
          message: "Invalid route geometry",
        });
      }

      for (const coordinate of geometry.coordinates) {
        if (!validateCoordinates(coordinate)) {
          return res.status(400).json({
            success: false,
            message: "Invalid geometry coordinates",
          });
        }
      }

      route.geometry = {
        type: "LineString",
        coordinates: geometry.coordinates,
      };
    }

    await route.save();

    return res.status(200).json({
      success: true,
      message: "Route updated successfully",
      data: route,
    });
  } catch (error) {
    console.error("Update route error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update route",
    });
  }
};

export const deleteRoute = async (req, res) => {
  try {
    const { routeId } = req.params;

    const route = await Route.findOne({
      routeId,
    });

    if (!route) {
      return res.status(404).json({
        success: false,
        message: "Route not found",
      });
    }

    route.isActive = false;

    await route.save();

    return res.status(200).json({
      success: true,
      message: "Route deactivated successfully",
    });
  } catch (error) {
    console.error("Delete route error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to delete route",
    });
  }
};