import { userService } from "../services/user.service.js";

const getAllUsers = async (req, res) => {
  try {
    // Use the service layer to get all activated users
    const users = await userService.getAllUsers();
    
    // Normalize each user to ensure consistent data format
    const normalizedUsers = users.map(user => userService.normalizeUser(user));

    res.status(200).json({
      message: "Users retrieved successfully",
      users: normalizedUsers,
      count: normalizedUsers.length
    });
  } catch (error) {
    console.error("Get users error:", error.message);
    res.status(500).json({
      message: "Internal server error",
      error: error.message
    });
  }
};

const getUserById = async (req, res) => {
  const { userId } = req.params;
  const user = await userService.getUserById(userId);
  res.status(200).json(user);
};

export const usersController = {
  getAllUsers,
  getUserById,
}; 