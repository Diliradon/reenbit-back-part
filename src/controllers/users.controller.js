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

const getAllUsersExceptMe = async (req, res) => {
  try {
    // Get the current user's ID from the authenticated request
    const currentUserId = req.user.userId;
    
    // Use the service layer to get all users except the current user
    const users = await userService.getAllUsersExcept(currentUserId);
    
    // Normalize each user to ensure consistent data format
    const normalizedUsers = users.map(user => userService.normalizeUser(user));

    res.status(200).json({
      message: "Users retrieved successfully (excluding current user)",
      users: normalizedUsers,
      count: normalizedUsers.length
    });
  } catch (error) {
    console.error("Get users except me error:", error.message);
    res.status(500).json({
      message: "Internal server error",
      error: error.message
    });
  }
};

const getCurrentUser = async (req, res) => {
  try {
    // Get the current user's ID from the authenticated request
    const currentUserId = req.user.userId;
    
    // Use the service layer to get the current user's full information
    const user = await userService.getUserById(currentUserId);
    
    if (!user) {
      return res.status(404).json({
        message: "User not found"
      });
    }

    // Normalize the user data
    const normalizedUser = userService.normalizeUser(user);

    res.status(200).json({
      message: "Current user retrieved successfully",
      user: normalizedUser
    });
  } catch (error) {
    console.error("Get current user error:", error.message);
    res.status(500).json({
      message: "Internal server error",
      error: error.message
    });
  }
};

export const usersController = {
  getAllUsers,
  getUserById,
  getAllUsersExceptMe,
  getCurrentUser,
}; 