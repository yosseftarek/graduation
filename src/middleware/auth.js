
import jwt from "jsonwebtoken"
import userModel from "../../db/models/user.model.js"
import { asyncHandler } from "../utils/asyncHandler.js"



export const auth = () => {
    return asyncHandler(async (req, res, next) => {

        const { token } = req.headers
        if (!token) {
            return res.status(400).json({ msg: "token not exist" })
        }
        if (!token.startsWith("Bearer ")) {
            return res.status(400).json({ msg: "inValid bearer key" })
        }
        const newToken = token.split("Bearer ")[1]
        if (!newToken) {
            return res.status(400).json({ msg: "invalid token" })
        }
        const decoded = jwt.verify(newToken, process.env.signatureToken)
        if (!decoded?.email) {
            return res.status(400).json({ msg: "invalid token payload" })
        }
        const user = await userModel.findOne({ email: decoded.email })
        if (!user) {
            return res.status(409).json({ msg: "user not exist" })
        }
     
        if (parseInt(user.passwordChangedAt.getTime() / 1000) > decoded.iat) {
            return res.status(400).json({ msg: "password changed please login again" })
        }

        req.user = user
        next()

    })

}
