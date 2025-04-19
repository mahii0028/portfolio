import mongoose from "mongoose";

const softwaresSchema = new mongoose.Schema({
  svg: {
    public_id: {
      type: String,
      required: true,
    },
    url: {
      type: String,
      required: true,
    },
  },
});

export const Softwares = mongoose.model("Softwares", softwaresSchema);
