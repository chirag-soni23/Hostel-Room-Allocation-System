import mongoose from "mongoose";
import Joi from "joi";

const userSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: true,
      trim: true,
    },
    lastName: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    phone: {
      type: String,
      trim: true,
      required:true,
    },

    password: {
      type: String,
      required: true,
    },

    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
  },
  { timestamps: true }
);

export const validateUser = (data) => {
  const schema = Joi.object({
    firstName: Joi.string().min(2).max(30).required().messages({
      "string.empty": "First name is required",
      "string.min": "First name should be at least 2 characters",
    }),
    lastName: Joi.string().min(2).max(30).required().messages({
      "string.empty": "Last name is required",
      "string.min": "Last name should be at least 2 characters",
    }),
    email: Joi.string().email().required().messages({
      "string.email": "Invalid email format",
      "string.empty": "Email is required",
    }),
    phone: Joi.string()
      .pattern(/^\+?[1-9]\d{7,14}$/)
      .messages({
        "string.pattern.base": "Phone must be valid (e.g. +911234567890)",
      })
      .optional(),

    password: Joi.string().min(6).max(30).required().messages({
      "string.empty": "Password is required",
      "string.min": "Password must be at least 6 characters",
    }),
    confirmPassword: Joi.any().valid(Joi.ref("password")).required().messages({
      "any.only": "Passwords do not match",
      "any.required": "Confirm password is required",
    }),
    role: Joi.string().valid("user", "admin").default("user").messages({
      "any.only": "Role must be either 'user' or 'admin'",
    }),
  });

  return schema.validate(data, { abortEarly: false });
};

export const User = mongoose.model("User", userSchema);
