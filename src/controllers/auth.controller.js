import { v4 as uuidv4 } from "uuid";
import { User } from "../models/user.js";
import { emailService } from "../services/email.service.js";
import { userService } from "../services/user.service.js";
import { jwtService } from "../services/jwt.service.js";

const register = async (req, res) => {
  try {
    const { email, password, firstName } = req.body;
    const activationToken = uuidv4();

    if (!email || !password || !firstName) {
      return res
        .status(400)
        .json({ message: "Email, password, and firstName are required" });
    }

    const existingUser = await User.findOne({ email });

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
        userId: newUser._id,
        email: newUser.email,
        firstName: newUser.firstName,
      },
    });
  } catch (error) {
    console.error("Registration error:", error.message);
    console.error(error.stack);
    res.status(500).json({
      message: "Internal server error",
      error: error.message,
    });
  }
};

const login = async (req, res) => {
  const { email, password } = req.body;
  const user = await userService.getUserByEmail(email);

  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  if (user.password !== password) {
    return res.status(401).json({ message: "Invalid password" });
  }

  const token = jwtService.generateToken({ userId: user._id });
  const normalizedUser = userService.normalizeUser(user);

  res.status(200).json({
    message: "Login successful",
    user: normalizedUser,
    token,
  });
};

const logout = async (req, res) => {
  try {
    // Since we're using JWT, we don't need to invalidate the token server-side
    // The client will remove the token from storage
    
    res.status(200).json({
      message: "Logged out successfully"
    });
  } catch (error) {
    console.error("Logout error:", error.message);
    res.status(500).json({
      message: "Internal server error",
      error: error.message
    });
  }
};

export const authController = {
  register,
  login,
  logout,
};
