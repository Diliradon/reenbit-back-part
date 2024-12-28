import { User } from "../models/user.js";
import { emailService } from "../services/email.service.js";
import { v4 as uuidv4 } from "uuid";

const register = async (req, res) => {
  try {
    const { email, password, firstName } = req.body;
    const activationToken = uuidv4();

    if (!email || !password || !firstName) {
      return res
        .status(400)
        .json({ message: "Email, password, and firstName are required" });
    }

    const existingUser = await User.findOne({ where: { email } });

    if (existingUser) {
      return res.status(409).json({ message: "User already exists" });
    }

    const newUser = await User.create({
      firstName,
      email,
      password,
      activationToken,
    });

    try {
      await emailService.sendActivationEmail({
        email: newUser.email,
        token: activationToken,
      });
    } catch (emailError) {
      console.error("Failed to send activation email:", emailError);
    }

    res.status(201).json({
      message: "User registered successfully",
      user: {
        userId: newUser.userId,
        email: newUser.email,
        firstName: newUser.firstName
      },
    });
  } catch (error) {
    console.error("Registration error:", error.message);
    console.error(error.stack);
    res.status(500).json({ 
      message: "Internal server error",
      error: error.message
    });
  }
};

const activate = async (req, res) => {
  const { token } = req.params;
  const user = await User.findOne({ where: { activationToken: token } });

  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  user.activationToken = null;
  await user.save();

  res.status(200).json({
    message: "User activated successfully",
    user: {
      userId: user.id,
      email: user.email,
      firstName: user.firstName,
      activationToken: user.activationToken,
      createdAt: user.createdAt,
    },
  });
};

export const authController = {
  register,
  activate,
};
