import { User } from "../models/user.js";

const getAllUsers = async () => {
  return await User.find({ activationToken: null });
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

export const userService = {
  getAllUsers,
  getUserByEmail,
  normalizeUser,
};
