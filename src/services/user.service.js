import { User } from "../models/user.js";

const getAllUsers = async () => {
  return await User.find({});
};

const normalizeUser = (user) => {
  return {
    userId: user._id,
    firstName: user.firstName,
    email: user.email,
    activationToken: user.activationToken,
    createdAt: user.createdAt,
  };
};

const getUserByEmail = async (email) => {
  const user = await User.findOne({
    email: email.toLowerCase(),
  });

  return user;
};

const getUserById = async (userId) => {
  const user = await User.findById(userId);
  return user;
};

const getAllUsersExcept = async (excludeUserId) => {
  return await User.find({
    _id: { $ne: excludeUserId }
  });
};

export const userService = {
  getAllUsers,
  getUserByEmail,
  normalizeUser,
  getUserById,
  getAllUsersExcept,
};
