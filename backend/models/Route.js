import mongoose from "mongoose";

const stopSchema = new mongoose.Schema(
  {
    stopId: {
      type: String,
      required: true,
    },

    name: {
      type: String,
      required: true,
      trim: true,
    },

    sequence: {
      type: Number,
      required: true,
      min: 1,
    },

    location: {
      type: {
        type: String,
        enum: ["Point"],
        default: "Point",
      },

      coordinates: {
        type: [Number],
        required: true,
        validate: {
          validator: (coordinates) =>
            coordinates.length === 2 &&
            coordinates[0] >= -180 &&
            coordinates[0] <= 180 &&
            coordinates[1] >= -90 &&
            coordinates[1] <= 90,
          message: "Invalid coordinates",
        },
      },
    },
  },
  {
    _id: false,
  }
);

const routeSchema = new mongoose.Schema(
  {
    routeId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    name: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      trim: true,
      default: "",
    },

    stops: {
      type: [stopSchema],
      required: true,
      validate: {
        validator: (stops) => stops.length >= 2,
        message: "A route must have at least two stops",
      },
    },

    geometry: {
      type: {
        type: String,
        enum: ["LineString"],
        default: "LineString",
      },

      coordinates: {
        type: [[Number]],
        required: true,
      },
    },

    isActive: {
      type: Boolean,
      default: true,
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

routeSchema.index({
  "stops.location": "2dsphere",
});

const Route = mongoose.model("Route", routeSchema);

export default Route;