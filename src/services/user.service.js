import { User } from "../models/user.js";

const getAllUsers = async () => {
  return await User.findAll({
    where: {
      activationToken: null,
    },
  });
};

const normalizeUser = (user) => {
  return {
    userId: user.userId,
    firstName: user.firstName,
    email: user.email,
    activationToken: user.activationToken,
    createdAt: user.createdAt,
  };
};

const getUserByEmail = async (email) => {
  const user = await User.findOne({
    where: {
      email: email.toLowerCase(),
    },
  });

  return user;
};

export const userService = {
  getAllUsers,
  getUserByEmail,
  normalizeUser,
};
