import { messageService } from "../services/message.service.js";

const sendMessage = async (req, res) => {
  try {
    const { recipientId, content, messageType } = req.body;
    const senderId = req.user.userId; // Assuming user is attached to req by auth middleware

    if (!recipientId || !content) {
      return res.status(400).json({
        message: "Recipient ID and content are required"
      });
    }

    const message = await messageService.sendMessage(senderId, recipientId, content, messageType);
    const normalizedMessage = messageService.normalizeMessage(message);

    res.status(201).json({
      message: "Message sent successfully",
      data: normalizedMessage
    });
  } catch (error) {
    console.error("Send message error:", error.message);
    res.status(500).json({
      message: "Internal server error",
      error: error.message
    });
  }
};

const getConversation = async (req, res) => {
  try {
    const { userId } = req.params;
    const currentUserId = req.user.userId;
    const { page = 1, limit = 50 } = req.query;

    const messages = await messageService.getConversation(
      currentUserId, 
      userId, 
      parseInt(page), 
      parseInt(limit)
    );

    const normalizedMessages = messages.map(message => 
      messageService.normalizeMessage(message)
    );

    res.status(200).json({
      message: "Conversation retrieved successfully",
      data: normalizedMessages,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        count: normalizedMessages.length
      }
    });
  } catch (error) {
    console.error("Get conversation error:", error.message);
    res.status(500).json({
      message: "Internal server error",
      error: error.message
    });
  }
};

const getUserConversations = async (req, res) => {
  try {
    const userId = req.user.userId;

    const conversations = await messageService.getUserConversations(userId);

    res.status(200).json({
      message: "Conversations retrieved successfully",
      data: conversations,
      count: conversations.length
    });
  } catch (error) {
    console.error("Get conversations error:", error.message);
    res.status(500).json({
      message: "Internal server error",
      error: error.message
    });
  }
};

const markMessageAsRead = async (req, res) => {
  try {
    const { messageId } = req.params;
    const userId = req.user.userId;

    const message = await messageService.markMessageAsRead(messageId, userId);

    if (!message) {
      return res.status(404).json({
        message: "Message not found or already read"
      });
    }

    res.status(200).json({
      message: "Message marked as read",
      data: messageService.normalizeMessage(message)
    });
  } catch (error) {
    console.error("Mark message as read error:", error.message);
    res.status(500).json({
      message: "Internal server error",
      error: error.message
    });
  }
};

const markConversationAsRead = async (req, res) => {
  try {
    const { userId } = req.params;
    const currentUserId = req.user.userId;

    const result = await messageService.markConversationAsRead(userId, currentUserId);

    res.status(200).json({
      message: "Conversation marked as read",
      modifiedCount: result.modifiedCount
    });
  } catch (error) {
    console.error("Mark conversation as read error:", error.message);
    res.status(500).json({
      message: "Internal server error",
      error: error.message
    });
  }
};

const deleteMessage = async (req, res) => {
  try {
    const { messageId } = req.params;
    const userId = req.user.userId;

    const message = await messageService.deleteMessage(messageId, userId);

    if (!message) {
      return res.status(404).json({
        message: "Message not found or you don't have permission to delete it"
      });
    }

    res.status(200).json({
      message: "Message deleted successfully"
    });
  } catch (error) {
    console.error("Delete message error:", error.message);
    res.status(500).json({
      message: "Internal server error",
      error: error.message
    });
  }
};

const getUnreadCount = async (req, res) => {
  try {
    const userId = req.user.userId;

    const count = await messageService.getUnreadMessagesCount(userId);

    res.status(200).json({
      message: "Unread messages count retrieved successfully",
      unreadCount: count
    });
  } catch (error) {
    console.error("Get unread count error:", error.message);
    res.status(500).json({
      message: "Internal server error",
      error: error.message
    });
  }
};

export const messageController = {
  sendMessage,
  getConversation,
  getUserConversations,
  markMessageAsRead,
  markConversationAsRead,
  deleteMessage,
  getUnreadCount,
}; 