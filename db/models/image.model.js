import mongoose from "mongoose";

const imageSchema = new mongoose.Schema(
  {
    image: {
      secure_url: String,
      public_id: String,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

const imageModel =
  mongoose.models.brandModel || mongoose.model("image", imageSchema);
export default imageModel;
