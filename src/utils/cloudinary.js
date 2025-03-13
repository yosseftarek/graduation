import dotenv from "dotenv";
import path from "path";
dotenv.config({ path: path.resolve("config/.env") });//to solve multer problem with paths
import { v2 as cloudinary } from 'cloudinary';


cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.API_KEY,
    api_secret: process.env.API_SECRET
});


export default cloudinary