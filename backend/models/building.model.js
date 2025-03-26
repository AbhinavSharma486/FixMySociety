import mongoose from "mongoose";

const buildingSchema = new mongoose.Schema({
  name: {
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
  ]
}, { timestamps: true });

const Building = mongoose.model("Building", buildingSchema);

export default Building;