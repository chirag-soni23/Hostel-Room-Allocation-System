import bcrypt from "bcryptjs";
import Joi from "joi";
import { User, validateUser } from "../models/user.model.js";
import { generateToken } from "../utils/generateToken.js";

export const register = async (req, res) => {
  try {
    const { error } = validateUser(req.body);
    if (error) return res.status(400).json({ errors: error.details.map(d => d.message) });

    const { firstName, lastName, email, password, phone } = req.body;

    const existingByEmail = await User.findOne({ email: String(email).toLowerCase().trim() });
    if (existingByEmail) return res.status(409).json({ message: "Email already in use" });

    if (phone) {
      const existingByPhone = await User.findOne({ phone: String(phone).trim() });
      if (existingByPhone) return res.status(409).json({ message: "Phone already in use" });
    }

    const hashed = await bcrypt.hash(password, 12);

    const user = await User.create({
      firstName,
      lastName,
      email: String(email).toLowerCase().trim(),
      password: hashed,
      phone: phone ? String(phone).trim() : undefined,
    });

    const token = generateToken(user._id, res);

    return res.status(201).json({
      message: "Registered successfully",
      token,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone ?? null,
        role: user.role,
        createdAt: user.createdAt,
      },
    });
  } catch (err) {
    return res.status(500).json({ message: "Server error", error: err.message });
  }
};

const loginSchema = Joi.object({
  email: Joi.string().email().required().messages({
    "string.email": "Invalid email format",
    "string.empty": "Email is required",
  }),
  password: Joi.string().min(6).max(30).required().messages({
    "string.empty": "Password is required",
    "string.min": "Password must be at least 6 characters",
  }),
});

export const login = async (req, res) => {
  try {
    const { error } = loginSchema.validate(req.body, { abortEarly: false });
    if (error) return res.status(400).json({ errors: error.details.map(d => d.message) });

    const { email, password } = req.body;

    const user = await User.findOne({ email: String(email).toLowerCase().trim() });
    if (!user) return res.status(401).json({ message: "Invalid credentials" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ message: "Invalid credentials" });

    const token = generateToken(user._id, res);

    return res.json({
      message: "Logged in",
      token,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone ?? null,
        role: user.role,
        createdAt: user.createdAt,
      },
    });
  } catch (err) {
    return res.status(500).json({ message: "Server error", error: err.message });
  }
};

export const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user?.id).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });
    return res.json(user);
  } catch (err) {
    return res.status(500).json({ message: "Server error", error: err.message });
  }
};

const updateProfileSchema = Joi.object({
  firstName: Joi.string().min(2).max(30).optional(),
  lastName: Joi.string().min(2).max(30).optional(),
  email: Joi.string().email().optional(),
  phone: Joi.string()
    .pattern(/^\+?[1-9]\d{7,14}$/)
    .messages({ "string.pattern.base": "Phone must be valid (e.g. +911234567890)" })
    .optional(),
}).or("firstName", "lastName", "email", "phone");

export const updateProfile = async (req, res) => {
  try {
    const { error } = updateProfileSchema.validate(req.body, { abortEarly: false });
    if (error) return res.status(400).json({ errors: error.details.map(d => d.message) });

    const userId = req.user?.id;
    const updates = {};

    if (req.body.firstName) updates.firstName = req.body.firstName;
    if (req.body.lastName) updates.lastName = req.body.lastName;

    if (req.body.email) {
      updates.email = String(req.body.email).trim().toLowerCase();
      const emailOwner = await User.findOne({ email: updates.email });
      if (emailOwner && String(emailOwner._id) !== String(userId)) {
        return res.status(409).json({ message: "Email already in use" });
      }
    }

    if (req.body.phone) {
      updates.phone = String(req.body.phone).trim();
      const phoneOwner = await User.findOne({ phone: updates.phone });
      if (phoneOwner && String(phoneOwner._id) !== String(userId)) {
        return res.status(409).json({ message: "Phone already in use" });
      }
    }

    const user = await User.findByIdAndUpdate(userId, updates, {
      new: true,
      runValidators: true,
      select: "-password",
    });

    if (!user) return res.status(404).json({ message: "User not found" });

    return res.json({ message: "Profile updated", user });
  } catch (err) {
    return res.status(500).json({ message: "Server error", error: err.message });
  }
};

const changePasswordSchema = Joi.object({
  oldPassword: Joi.string().required(),
  newPassword: Joi.string().min(6).max(30).required(),
  confirmNewPassword: Joi.any().valid(Joi.ref("newPassword")).required().messages({
    "any.only": "New passwords do not match",
  }),
});

export const changePassword = async (req, res) => {
  try {
    const { error } = changePasswordSchema.validate(req.body, { abortEarly: false });
    if (error) return res.status(400).json({ errors: error.details.map(d => d.message) });

    const { oldPassword, newPassword } = req.body;

    const user = await User.findById(req.user?.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    const ok = await bcrypt.compare(oldPassword, user.password);
    if (!ok) return res.status(401).json({ message: "Old password is incorrect" });

    user.password = await bcrypt.hash(newPassword, 12);
    await user.save();

    return res.json({ message: "Password changed successfully" });
  } catch (err) {
    return res.status(500).json({ message: "Server error", error: err.message });
  }
};

export const logout = async (req, res) => {
  try {
    res.clearCookie("token", {
      httpOnly: true,
      secure: true,  
      sameSite: "none",
    });
    return res.status(200).json({ message: "Logged out" });
  } catch (err) {
    return res.status(500).json({ message: "Server error", error: err.message });
  }
};
