import Bus from "../models/Bus.js";

const generateBusId = async () => {
  while (true) {
    const number = Math.floor(Math.random() * 99) + 1;
    const busId = `B${String(number).padStart(2, "0")}`;

    const exists = await Bus.findOne({ busId });

    if (!exists) {
      return busId;
    }
  }
};

export const createBus = async (req, res) => {
  try {
    const { busNo, registrationNo } = req.body;

    if (!busNo || !registrationNo) {
      return res.status(400).json({
        success: false,
        message: "Bus number and registration number are required",
      });
    }

    const existingBusNo = await Bus.findOne({ busNo });

    if (existingBusNo) {
      return res.status(409).json({
        success: false,
        message: "Bus number already exists",
      });
    }

    const existingRegistrationNo = await Bus.findOne({
      registrationNo: registrationNo.toUpperCase(),
    });

    if (existingRegistrationNo) {
      return res.status(409).json({
        success: false,
        message: "Registration number already exists",
      });
    }

    const busId = await generateBusId();

    const bus = await Bus.create({
      busId,
      busNo,
      registrationNo,
      isActive: true,
    });

    return res.status(201).json({
      success: true,
      message: "Bus created successfully",
      data: bus,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Failed to create bus",
    });
  }
};

export const getBuses = async (req, res) => {
  try {
    const buses = await Bus.find()
      .sort({ createdAt: -1 })
      .select("-__v");

    return res.status(200).json({
      success: true,
      count: buses.length,
      data: buses,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch buses",
    });
  }
};

export const getBus = async (req, res) => {
  try {
    const { busId } = req.params;

    const bus = await Bus.findOne({ busId }).select("-__v");

    if (!bus) {
      return res.status(404).json({
        success: false,
        message: "Bus not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: bus,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch bus",
    });
  }
};

export const updateBus = async (req, res) => {
  try {
    const { busId } = req.params;
    const { busNo, registrationNo, isActive } = req.body;

    const bus = await Bus.findOne({ busId });

    if (!bus) {
      return res.status(404).json({
        success: false,
        message: "Bus not found",
      });
    }

    if (busNo !== undefined && busNo !== bus.busNo) {
      const existingBusNo = await Bus.findOne({
        busNo,
        busId: { $ne: busId },
      });

      if (existingBusNo) {
        return res.status(409).json({
          success: false,
          message: "Bus number already exists",
        });
      }

      bus.busNo = busNo;
    }

    if (
      registrationNo !== undefined &&
      registrationNo.toUpperCase() !== bus.registrationNo
    ) {
      const normalizedRegistrationNo = registrationNo.toUpperCase();

      const existingRegistrationNo = await Bus.findOne({
        registrationNo: normalizedRegistrationNo,
        busId: { $ne: busId },
      });

      if (existingRegistrationNo) {
        return res.status(409).json({
          success: false,
          message: "Registration number already exists",
        });
      }

      bus.registrationNo = normalizedRegistrationNo;
    }

    if (isActive !== undefined) {
      bus.isActive = isActive;
    }

    await bus.save();

    return res.status(200).json({
      success: true,
      message: "Bus updated successfully",
      data: bus,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Failed to update bus",
    });
  }
};

export const deleteBus = async (req, res) => {
  try {
    const { busId } = req.params;

    const bus = await Bus.findOne({ busId });

    if (!bus) {
      return res.status(404).json({
        success: false,
        message: "Bus not found",
      });
    }

    bus.isActive = false;

    await bus.save();

    return res.status(200).json({
      success: true,
      message: "Bus deactivated successfully",
      data: bus,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Failed to deactivate bus",
    });
  }
};