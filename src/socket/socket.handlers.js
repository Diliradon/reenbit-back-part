import { messageService } from "../services/message.service.js";
import { jwtService } from "../services/jwt.service.js";
import { User } from "../models/user.js";

// Store user socket connections
const connectedUsers = new Map(); // userId -> socketId
const userTyping = new Map(); // conversationKey -> { userId, timestamp }

export const handleSocketConnection = (io) => {
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      
      if (!token) {
        return next(new Error("Authentication error: No token provided"));
      }

      const decoded = jwtService.verifyToken(token);
      if (!decoded) {
        return next(new Error("Authentication error: Invalid token"));
      }

      const user = await User.findById(decoded.userId);
      if (!user || user.activationToken !== null) {
        return next(new Error("Authentication error: User not found or not activated"));
      }

      // Attach user info to socket
      socket.userId = user._id.toString();
      socket.userInfo = {
        userId: user._id,
        firstName: user.firstName,
        email: user.email
      };

      next();
    } catch (error) {
      next(new Error("Authentication error"));
    }
  });

  io.on("connection", (socket) => {
    console.log(`User ${socket.userInfo.firstName} connected: ${socket.id}`);
    
    // Store user connection
    connectedUsers.set(socket.userId, socket.id);

    // Join user to their personal room for notifications
    socket.join(`user_${socket.userId}`);

    // Emit online status to contacts
    socket.broadcast.emit("user_online", {
      userId: socket.userId,
      userInfo: socket.userInfo
    });

    // Handle joining conversation rooms
    socket.on("join_conversation", ({ otherUserId }) => {
      const conversationId = getConversationId(socket.userId, otherUserId);
      socket.join(conversationId);
      console.log(`User ${socket.userId} joined conversation: ${conversationId}`);
    });

    // Handle leaving conversation rooms
    socket.on("leave_conversation", ({ otherUserId }) => {
      const conversationId = getConversationId(socket.userId, otherUserId);
      socket.leave(conversationId);
      console.log(`User ${socket.userId} left conversation: ${conversationId}`);
    });

    // Handle sending messages
    socket.on("send_message", async (data) => {
      try {
        const { recipientId, content, messageType = "text" } = data;

        if (!recipientId || !content) {
          socket.emit("message_error", { error: "Recipient ID and content are required" });
          return;
        }

        // Save message to database
        const message = await messageService.sendMessage(
          socket.userId, 
          recipientId, 
          content, 
          messageType
        );

        const normalizedMessage = messageService.normalizeMessage(message);

        // Add sender info for real-time display
        const messageWithSender = {
          ...normalizedMessage,
          sender: socket.userInfo
        };

        const conversationId = getConversationId(socket.userId, recipientId);

        // Send to conversation room (both users if they're in the room)
        io.to(conversationId).emit("new_message", messageWithSender);

        // Send notification to recipient if they're online but not in conversation room
        const recipientSocketId = connectedUsers.get(recipientId);
        if (recipientSocketId) {
          io.to(`user_${recipientId}`).emit("message_notification", {
            message: messageWithSender,
            conversationWith: socket.userInfo
          });
        }

        // Confirm message sent
        socket.emit("message_sent", { messageId: message._id });

      } catch (error) {
        console.error("Send message error:", error);
        socket.emit("message_error", { error: "Failed to send message" });
      }
    });

    // Handle typing indicators
    socket.on("typing_start", ({ otherUserId }) => {
      const conversationId = getConversationId(socket.userId, otherUserId);
      const typingKey = `${conversationId}_${socket.userId}`;
      
      userTyping.set(typingKey, {
        userId: socket.userId,
        userInfo: socket.userInfo,
        timestamp: Date.now()
      });

      // Notify other user in conversation
      socket.to(conversationId).emit("user_typing", {
        userId: socket.userId,
        userInfo: socket.userInfo,
        isTyping: true
      });
    });

    socket.on("typing_stop", ({ otherUserId }) => {
      const conversationId = getConversationId(socket.userId, otherUserId);
      const typingKey = `${conversationId}_${socket.userId}`;
      
      userTyping.delete(typingKey);

      // Notify other user in conversation
      socket.to(conversationId).emit("user_typing", {
        userId: socket.userId,
        userInfo: socket.userInfo,
        isTyping: false
      });
    });

    // Handle marking messages as read
    socket.on("mark_messages_read", async ({ otherUserId }) => {
      try {
        await messageService.markConversationAsRead(otherUserId, socket.userId);
        
        const conversationId = getConversationId(socket.userId, otherUserId);
        
        // Notify sender that messages were read
        socket.to(conversationId).emit("messages_read", {
          readBy: socket.userId,
          userInfo: socket.userInfo
        });

      } catch (error) {
        console.error("Mark messages read error:", error);
      }
    });

    // Handle getting online users
    socket.on("get_online_users", () => {
      const onlineUserIds = Array.from(connectedUsers.keys());
      socket.emit("online_users", onlineUserIds);
    });

    // Handle disconnect
    socket.on("disconnect", () => {
      console.log(`User ${socket.userInfo.firstName} disconnected: ${socket.id}`);
      
      // Remove from connected users
      connectedUsers.delete(socket.userId);

      // Clean up typing indicators
      for (const [key, typing] of userTyping.entries()) {
        if (typing.userId === socket.userId) {
          userTyping.delete(key);
        }
      }

      // Emit offline status
      socket.broadcast.emit("user_offline", {
        userId: socket.userId,
        userInfo: socket.userInfo
      });
    });
  });

  // Clean up old typing indicators every 10 seconds
  setInterval(() => {
    const now = Date.now();
    for (const [key, typing] of userTyping.entries()) {
      if (now - typing.timestamp > 10000) { // 10 seconds
        userTyping.delete(key);
      }
    }
  }, 10000);
};

// Helper function to create consistent conversation IDs
const getConversationId = (userId1, userId2) => {
  const sorted = [userId1, userId2].sort();
  return `conversation_${sorted[0]}_${sorted[1]}`;
};

// Helper function to get online users
export const getOnlineUsers = () => {
  return Array.from(connectedUsers.keys());
}; 