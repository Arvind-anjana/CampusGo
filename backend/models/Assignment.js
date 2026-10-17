import mongoose from "mongoose";

const assignmentSchema = new mongoose.Schema(
  {
    driverId: {
      type: String,
      required: true,
      trim: true,
    },

    busId: {
      type: String,
      required: true,
      trim: true,
    },

    routeId: {
      type: String,
      required: true,
      trim: true,
    },

    createdBy: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

assignmentSchema.index(
  {
    driverId: 1,
    busId: 1,
    routeId: 1,
  },
  {
    unique: true,
  }
);

const Assignment = mongoose.model("Assignment", assignmentSchema);

export default Assignment;