import { User } from "../models/user.js";
import { emailService } from "../services/email.service.js";
import { v4 as uuidv4 } from "uuid";

const register = async (req, res) => {
  try {
    const { email, password } = req.body;
    const activationToken = uuidv4();

    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email and password are required" });
    }

    const existingUser = await User.findOne({ where: { email } });

    if (existingUser) {
      return res.status(409).json({ message: "User already exists" });
    }

    const newUser = await User.create({
      email,
      password,
      activationToken,
    });

    await emailService.sendActivationEmail({
      email: newUser.email,
      token: activationToken,
    });

    res.status(201).json({
      message: "User registered successfully",
      user: {
        userId: newUser.id,
        email: newUser.email,
      },
    });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const activate = async (req, res) => {
  const { token } = req.params;
  const user = await User.findOne({ where: { activationToken: token } });

  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  user.isActive = true;
  user.activationToken = null;
  await user.save();

  res.status(200).json({
    message: "User activated successfully",
    user: {
      userId: user.id,
      email: user.email,
      isActive: user.isActive,
      activationToken: user.activationToken,
      createdAt: user.createdAt,
    },
  });
};

export const authController = {
  register,
  activate,
};
