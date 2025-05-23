import { Message } from "../models/message.js";
import mongoose from "mongoose";

const sendMessage = async (senderId, recipientId, content, messageType = "text") => {
  const message = new Message({
    sender: senderId,
    recipient: recipientId,
    content,
    messageType,
  });

  return await message.save();
};

const getConversation = async (userId1, userId2, page = 1, limit = 50) => {
  const skip = (page - 1) * limit;
  
  const messages = await Message.find({
    $or: [
      { sender: userId1, recipient: userId2 },
      { sender: userId2, recipient: userId1 }
    ],
    isDeleted: false
  })
  .populate('sender', 'firstName email')
  .populate('recipient', 'firstName email')
  .sort({ createdAt: -1 })
  .skip(skip)
  .limit(limit);

  return messages.reverse(); // Return in chronological order
};

const getUserConversations = async (userId) => {
  const conversations = await Message.aggregate([
    {
      $match: {
        $or: [
          { sender: new mongoose.Types.ObjectId(userId) },
          { recipient: new mongoose.Types.ObjectId(userId) }
        ],
        isDeleted: false
      }
    },
    {
      $sort: { createdAt: -1 }
    },
    {
      $group: {
        _id: {
          $cond: [
            { $eq: ["$sender", new mongoose.Types.ObjectId(userId)] },
            "$recipient",
            "$sender"
          ]
        },
        lastMessage: { $first: "$$ROOT" },
        unreadCount: {
          $sum: {
            $cond: [
              {
                $and: [
                  { $eq: ["$recipient", new mongoose.Types.ObjectId(userId)] },
                  { $eq: ["$isRead", false] }
                ]
              },
              1,
              0
            ]
          }
        }
      }
    },
    {
      $lookup: {
        from: "users",
        localField: "_id",
        foreignField: "_id",
        as: "user"
      }
    },
    {
      $unwind: "$user"
    },
    {
      $project: {
        user: {
          _id: "$user._id",
          firstName: "$user.firstName",
          email: "$user.email"
        },
        lastMessage: {
          content: "$lastMessage.content",
          createdAt: "$lastMessage.createdAt",
          messageType: "$lastMessage.messageType"
        },
        unreadCount: 1
      }
    },
    {
      $sort: { "lastMessage.createdAt": -1 }
    }
  ]);

  return conversations;
};

const markMessageAsRead = async (messageId, userId) => {
  const message = await Message.findOneAndUpdate(
    { 
      _id: messageId, 
      recipient: userId, 
      isRead: false 
    },
    { 
      isRead: true, 
      readAt: new Date() 
    },
    { new: true }
  );

  return message;
};

const markConversationAsRead = async (senderId, recipientId) => {
  const result = await Message.updateMany(
    {
      sender: senderId,
      recipient: recipientId,
      isRead: false
    },
    {
      isRead: true,
      readAt: new Date()
    }
  );

  return result;
};

const deleteMessage = async (messageId, userId) => {
  const message = await Message.findOneAndUpdate(
    {
      _id: messageId,
      $or: [{ sender: userId }, { recipient: userId }]
    },
    {
      isDeleted: true,
      deletedAt: new Date()
    },
    { new: true }
  );

  return message;
};

const getUnreadMessagesCount = async (userId) => {
  const count = await Message.countDocuments({
    recipient: userId,
    isRead: false,
    isDeleted: false
  });

  return count;
};

const normalizeMessage = (message) => {
  return {
    messageId: message._id,
    sender: message.sender,
    recipient: message.recipient,
    content: message.content,
    messageType: message.messageType,
    isRead: message.isRead,
    readAt: message.readAt,
    createdAt: message.createdAt,
    updatedAt: message.updatedAt
  };
};

export const messageService = {
  sendMessage,
  getConversation,
  getUserConversations,
  markMessageAsRead,
  markConversationAsRead,
  deleteMessage,
  getUnreadMessagesCount,
  normalizeMessage,
}; 