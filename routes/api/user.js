const express = require("express");
const { User } = require("../../models/user");
const bcrypt = require("bcrypt");
require("dotenv").config();
const secret = process.env.SECRET;
const jwt = require("jsonwebtoken");
const Joi = require("joi");
const router = express.Router();
const { auth } = require("../../middleware/auth");

const userSchema = Joi.object({
  password: Joi.string().required(),
  email: Joi.string().required(),
  subscription: Joi.string(),
  token: Joi.string(),
});

router.post("/signup", async (req, res, next) => {
  const validators = userSchema.validate(req.body);
  if (validators.error?.message) {
    res.status(400).json({ message: validators.error.message });
  }
  const { email, password, subscription } = req.body;
  const user = await User.findOne({ email });
  if (user) {
    return res.status(409).json({
      message: "Email is already in use",
    });
  }
  try {
    const hashPassword = await bcrypt.hash(password, 10);
    const newUser = await User.create({
      email,
      subscription,
      password: hashPassword,
    });
    res.status(201).json({
      message: "Registration successful",
      user: {
        email: newUser.email,
        subscription: newUser.subscription,
      },
    });
  } catch (error) {
    next(error);
  }
});

router.post("/login", async (req, res, next) => {
  const validators = userSchema.validate(req.body);
  if (validators.error?.message) {
    res.status(400).json({ message: validators.error.message });
  }
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  const passwordCompare = bcrypt.compare(password, user.password);

  if (!user || !passwordCompare) {
    return res.status(401).json({
      message: "Incorrect login or password",
    });
  }
  try {
    const payload = {
      id: user.id,
      email: user.email,
    };

    const token = jwt.sign(payload, secret, { expiresIn: "1h" });
    await User.findByIdAndUpdate(user._id, { token });
    res.status(200).json({
      token,
      user: {
        email: user.email,
        subscription: user.subscription,
      },
    });
  } catch (error) {
    next(error);
  }
});

router.get("/logout", auth, (req, res, next) => {
  const { _id } = req.user;
  User.findByIdAndUpdate(_id, { token: "" });
  res.status(204).json({});
});

router.get("/current", auth, (req, res, next) => {
  const { email, subscription } = req.user;

  res.status(200).json({
    email,
    subscription,
  });
});

router.patch("/:id", async (req, res, next) => {
  const { id } = req.params;
  const { subscription } = req.body;
  try {
    const user = await User.findByIdAndUpdate(
      id,
      { subscription },
      { new: true }
    );
    res.json(user);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
