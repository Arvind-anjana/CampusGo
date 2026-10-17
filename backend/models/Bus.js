import mongoose from "mongoose";

const busSchema = new mongoose.Schema(
  {
    busId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    busNo: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    registrationNo: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      uppercase: true,
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

const Bus = mongoose.model("Bus", busSchema);

export default Bus;