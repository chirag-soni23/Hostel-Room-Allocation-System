import Joi from "joi";
import { sendMail } from "../utils/mailer.js";

const contactSchema = Joi.object({
  name: Joi.string().min(2).required().messages({
    "string.empty": "Name is required.",
    "string.min": "Name should be at least 2 characters long.",
  }),
  email: Joi.string().email().required().messages({
    "string.email": "Please enter a valid email address.",
    "string.empty": "Email is required.",
  }),
  phone: Joi.string().allow("", null),
  subject: Joi.string().allow("", null),
  message: Joi.string().min(5).required().messages({
    "string.empty": "Message is required.",
    "string.min": "Your message must be at least 5 characters long.",
  }),
});

export const sendContactMessage = async (req, res) => {
  try {
    const { value, error } = contactSchema.validate(req.body, { abortEarly: false });

    if (error) {
      // Extract only readable messages
      const errors = error.details.map((d) => d.message);
      return res.status(400).json({
        success: false,
        message: errors.join(" "),
        errors,
      });
    }

    await sendMail({
      fromName: value.name,
      fromEmail: value.email,
      subject: value.subject,
      message: value.message,
      phone: value.phone,
    });

    return res.json({ success: true, message: "Your message has been sent successfully!" });
  } catch (err) {
    console.error("Mail error:", err);
    return res.status(500).json({
      success: false,
      message: "Something went wrong while sending your message. Please try again later.",
    });
  }
};
