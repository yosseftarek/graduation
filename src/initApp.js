import connectionDB from "../db/connection.js";
import { AppError } from "../src/utils/classError.js";
import { GlobalErrorHandler } from "../src/utils/asyncHandler.js";
import { deleteFromCloudinary } from "./utils/deleteFromCloudinary.js";
import { deleteFromDataBase } from "./utils/deleteFromDataBase.js";

import cors from 'cors'
import { imageRouter } from "./modules/Image/image.routes.js";



export const initApp = (express, app) => {
    var corsOptions = {
        origin: 'http://localhost:5173',
        optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204
      }

    app.use(express.json());

    //connect to db
    connectionDB()

    app.use("/image",imageRouter)

    app.get("/", (req, res) => {
        res.status(200).json({ message: "server is running" });
      });

    //handle invalid URLs.
    app.use("*", (req, res, next) => {
        next(new AppError(`inValid url ${req.originalUrl}`))
    })

    //GlobalErrorHandler
    app.use(GlobalErrorHandler, deleteFromCloudinary, deleteFromDataBase)

}