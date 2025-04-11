import UserModel from "../../../db/models/user.model.js";
import { sendEmail } from "../../service/sendEmail.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { AppError } from "../../utils/classError.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { customAlphabet } from "nanoid";

//=============================== signUp =========================================
export const signup = asyncHandler(async (req, res, next) => {
  const { name, email, password, cPassword, phone, age, address, role } =
    req.body;

  const userExist = await UserModel.findOne({ email: email?.toLowerCase() });
  userExist && next(new AppError("user already exist", 409));

  const phoneExist = await UserModel.findOne({ phone });
  phoneExist && next(new AppError("Phone already exist", 409));

  const token = jwt.sign({ email }, process.env.signatureToken, {
    expiresIn: "1h",
  });
  const link = `${req.protocol}://${req.headers.host}/users/verifyEmail/${token}`;

  const rfToken = jwt.sign({ email }, process.env.signatureTokenRefresh);
  const rfLink = `${req.protocol}://${req.headers.host}/users/refreshToken/${rfToken}`;

  await sendEmail(
    email,
    "verify your email",
    `<a href="${link}">click here </a>  <br>
    <a href="${rfLink}">click here to resend the link</a>`
  );

  const hash = bcrypt.hashSync(password, +process.env.saltRounds);

  const user = await UserModel({
    name,
    email,
    password: hash,
    age,
    phone,
    address,
    role,
  });
  const newUser = await user.save();

  newUser
    ? res.status(201).json({ message: "done", user: newUser })
    : next(new AppError("user not created", 500));
});

//=============================== verifyEmail =========================================
export const verifyEmail = asyncHandler(async (req, res, next) => {
  const { token } = req.params;
  const decoded = jwt.verify(token, process.env.signatureToken);
  if (!decoded?.email) return next(new AppError("invalid token", 400));
  const user = await UserModel.findOneAndUpdate(
    { email: decoded.email, confirmed: false },
    { confirmed: true }
  );
  user
    ? res.status(200).json({ message: "done" })
    : next(new AppError("user not exist or already confirmed", 400));
});

//=============================== refreshToken =========================================
export const refreshToken = asyncHandler(async (req, res, next) => {
  const { rfToken } = req.params;
  const decoded = jwt.verify(rfToken, process.env.signatureTokenRefresh);
  if (!decoded?.email) return next(new AppError("invalid token", 400));

  const user = await UserModel.findOne({
    email: decoded.email,
    confirmed: true,
  });
  if (user) {
    return next(new AppError("user already confirmed", 400));
  }

  const token = jwt.sign({ email: decoded.email }, process.env.signatureToken, {
    expiresIn: 1000,
  });
  const link = `${req.protocol}://${req.headers.host}/users/verifyEmail/${token}`;

  await sendEmail(
    decoded.email,
    "verify your email",
    `<a href="${link}>click here</a>`
  );
  res.status(200).json({ message: "done" });
});

//=============================== forgetPassword =========================================
export const forgetPassword = asyncHandler(async (req, res, next) => {
  const { email } = req.body;
  const user = await UserModel.findOne({ email: email?.toLowerCase() });
  if (!user) return next(new AppError("user in not exist", 404));

  const code = customAlphabet("0123456789", 5);
  const newCode = code();

  await sendEmail(
    email,
    "code to reset your password",
    `<h1>your code is ${newCode}</h1>`
  );
  await UserModel.updateOne({ email }, { code: newCode });

  res.status(200).json({ message: "done" });
});

//=============================== resetPassword =========================================
export const resetPassword = asyncHandler(async (req, res, next) => {
  const { email, password, code } = req.body;

  const user = await UserModel.findOne({ email: email?.toLowerCase() });
  if (!user) return next(new AppError("user in not exist", 404));

  if (user.code !== code || code == "")
    return next(new AppError("invalid code", 400));
  const hashed = bcrypt.hashSync(password, 8);
  await UserModel.updateOne(
    { email },
    { code: "", passwordChangedAt: Date.now(), password: hashed }
  );

  res.status(200).json({ message: "done" });
});

//=============================== signin =========================================
export const signin = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;
  const user = await UserModel.findOne({
    email: email?.toLowerCase(),
    confirmed: true,
  });

  if (!user) return next(new AppError("user in not exist", 404));
  if (!bcrypt.compareSync(password, user.password))
    return next(new AppError("invalid password", 404));

  const token = jwt.sign(
    { email, role: user.role },
    process.env.signatureToken
  );

  await UserModel.updateOne({ email }, { loggedIn: true });
  res.status(200).json({ message: "done", token });
});
