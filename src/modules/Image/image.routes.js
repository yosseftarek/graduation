import { Router } from "express";
import { multerHost, validExtensions } from "../../middleware/multer.js";
import { sendImage } from "./image.controller.js";

export const imageRouter = Router();

imageRouter.post(
  "/sendImage",
  multerHost(validExtensions.image).single("image"),
  sendImage
);
