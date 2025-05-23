import { jwtService } from "../services/jwt.service.js";
import { User } from "../models/user.js";

export const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        message: "Access token required"
      });
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix
    const decoded = jwtService.verifyToken(token);

    if (!decoded) {
      return res.status(401).json({
        message: "Invalid or expired token"
      });
    }

    // Verify user still exists and is activated
    const user = await User.findById(decoded.userId);
    
    if (!user) {
      return res.status(401).json({
        message: "User not found"
      });
    }

    if (user.activationToken !== null) {
      return res.status(401).json({
        message: "Account not activated"
      });
    }

    // Attach user information to request
    req.user = {
      userId: user._id,
      email: user.email,
      firstName: user.firstName
    };

    next();
  } catch (error) {
    console.error("Authentication error:", error.message);
    res.status(500).json({
      message: "Internal server error",
      error: error.message
    });
  }
}; 