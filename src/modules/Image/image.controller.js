import { nanoid } from "nanoid";
import imageModel from "../../../db/models/image.model.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { AppError } from "../../utils/classError.js";
import cloudinary from "../../utils/cloudinary.js";

export const sendImage = asyncHandler(async (req, res, next) => {
  if (!req.file) {
    next(new AppError("image is required", 404)); 
  }

  const customId = nanoid(5);
  const { secure_url, public_id } = await cloudinary.uploader.upload(
    req.file.path,
    {
      folder: `skincare/images/${customId}`,
    }
  );

  const image = await imageModel.create({

    image: { secure_url, public_id },
    customId
  });
  res.status(201).json({ message: "done", image });

});
