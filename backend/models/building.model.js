import mongoose from "mongoose";

const buildingSchema = new mongoose.Schema({
  buildingName: {
    type: String,
    required: true
  },
  numberOfFlats: {
    type: Number,
    required: true
  }
  ,
  filledFlats: {
    type: Number,
    required: true
  },
  emptyFlats: {
    type: Number,
    required: true
  },
  complaints: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Complaint"
    }
  ],
  residents: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    }
  ]
}, { timestamps: true });

buildingSchema.index({ buildingName: 1 }, { unique: true }); // Unique index on buildingName
buildingSchema.index({ createdAt: -1 }); // Index for sorting by creation date (descending)

const Building = mongoose.model("Building", buildingSchema);

export default Building;