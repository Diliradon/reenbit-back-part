# Socket.IO Client Implementation Example

## Installation (Frontend)

```bash
npm install socket.io-client
```

## Client Connection Setup

```javascript
import { io } from 'socket.io-client';

class ChatClient {
  constructor(serverUrl, authToken) {
    this.socket = io(serverUrl, {
      auth: {
        token: authToken
      }
    });

    this.setupEventListeners();
  }

  setupEventListeners() {
    // Connection events
    this.socket.on('connect', () => {
      console.log('✅ Connected to chat server');
    });

    this.socket.on('disconnect', () => {
      console.log('❌ Disconnected from chat server');
    });

    this.socket.on('connect_error', (error) => {
      console.error('Connection error:', error.message);
    });

    // Message events
    this.socket.on('new_message', (message) => {
      this.handleNewMessage(message);
    });

    this.socket.on('message_notification', (data) => {
      this.handleMessageNotification(data);
    });

    this.socket.on('message_sent', (data) => {
      console.log('Message sent successfully:', data.messageId);
    });

    this.socket.on('message_error', (error) => {
      console.error('Message error:', error.error);
    });

    // Typing events
    this.socket.on('user_typing', (data) => {
      this.handleTypingIndicator(data);
    });

    // Read receipts
    this.socket.on('messages_read', (data) => {
      this.handleMessagesRead(data);
    });

    // Online status events
    this.socket.on('user_online', (data) => {
      this.handleUserOnline(data);
    });

    this.socket.on('user_offline', (data) => {
      this.handleUserOffline(data);
    });

    this.socket.on('online_users', (userIds) => {
      this.handleOnlineUsers(userIds);
    });
  }

  // Join a conversation room
  joinConversation(otherUserId) {
    this.socket.emit('join_conversation', { otherUserId });
  }

  // Leave a conversation room
  leaveConversation(otherUserId) {
    this.socket.emit('leave_conversation', { otherUserId });
  }

  // Send a message
  sendMessage(recipientId, content, messageType = 'text') {
    this.socket.emit('send_message', {
      recipientId,
      content,
      messageType
    });
  }

  // Typing indicators
  startTyping(otherUserId) {
    this.socket.emit('typing_start', { otherUserId });
  }

  stopTyping(otherUserId) {
    this.socket.emit('typing_stop', { otherUserId });
  }

  // Mark messages as read
  markMessagesRead(otherUserId) {
    this.socket.emit('mark_messages_read', { otherUserId });
  }

  // Get online users
  getOnlineUsers() {
    this.socket.emit('get_online_users');
  }

  // Event handlers (implement these based on your UI framework)
  handleNewMessage(message) {
    console.log('New message received:', message);
    // Add message to conversation UI
    // Update conversation list
    // Play notification sound if not in active conversation
  }

  handleMessageNotification(data) {
    console.log('Message notification:', data);
    // Show notification popup
    // Update unread count
    // Highlight conversation in list
  }

  handleTypingIndicator(data) {
    console.log('Typing indicator:', data);
    // Show/hide typing indicator in conversation
  }

  handleMessagesRead(data) {
    console.log('Messages read by:', data.userInfo.firstName);
    // Update read receipts in conversation
  }

  handleUserOnline(data) {
    console.log('User came online:', data.userInfo.firstName);
    // Update online status in user list
  }

  handleUserOffline(data) {
    console.log('User went offline:', data.userInfo.firstName);
    // Update offline status in user list
  }

  handleOnlineUsers(userIds) {
    console.log('Online users:', userIds);
    // Update online status for all users
  }

  // Disconnect
  disconnect() {
    this.socket.disconnect();
  }
}

export default ChatClient;
```

## React Integration Example

```jsx
import React, { useState, useEffect, useRef } from 'react';
import ChatClient from './ChatClient';

const ChatComponent = ({ authToken, currentUserId }) => {
  const [chatClient, setChatClient] = useState(null);
  const [messages, setMessages] = useState([]);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [typingUsers, setTypingUsers] = useState(new Set());
  const [currentConversation, setCurrentConversation] = useState(null);
  const messageInputRef = useRef();

  useEffect(() => {
    // Initialize chat client
    const client = new ChatClient('http://localhost:3000', authToken);
    
    // Override event handlers with React state updates
    client.handleNewMessage = (message) => {
      setMessages(prev => [...prev, message]);
    };

    client.handleTypingIndicator = (data) => {
      setTypingUsers(prev => {
        const newSet = new Set(prev);
        if (data.isTyping) {
          newSet.add(data.userId);
        } else {
          newSet.delete(data.userId);
        }
        return newSet;
      });
    };

    client.handleOnlineUsers = (userIds) => {
      setOnlineUsers(userIds);
    };

    setChatClient(client);

    return () => {
      client.disconnect();
    };
  }, [authToken]);

  const sendMessage = () => {
    const content = messageInputRef.current.value.trim();
    if (content && currentConversation && chatClient) {
      chatClient.sendMessage(currentConversation, content);
      messageInputRef.current.value = '';
    }
  };

  const startConversation = (userId) => {
    if (chatClient) {
      // Leave previous conversation
      if (currentConversation) {
        chatClient.leaveConversation(currentConversation);
      }
      
      // Join new conversation
      chatClient.joinConversation(userId);
      setCurrentConversation(userId);
      setMessages([]); // Clear messages, load from REST API
      
      // Load conversation history from REST API
      loadConversationHistory(userId);
    }
  };

  const loadConversationHistory = async (userId) => {
    try {
      const response = await fetch(`/messages/conversation/${userId}`, {
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      });
      const data = await response.json();
      setMessages(data.data);
    } catch (error) {
      console.error('Error loading conversation history:', error);
    }
  };

  const handleTyping = () => {
    if (currentConversation && chatClient) {
      chatClient.startTyping(currentConversation);
      
      // Stop typing after 3 seconds of inactivity
      setTimeout(() => {
        chatClient.stopTyping(currentConversation);
      }, 3000);
    }
  };

  return (
    <div className="chat-container">
      <div className="conversation-list">
        <h3>Conversations</h3>
        {/* Render conversation list */}
      </div>
      
      <div className="chat-area">
        <div className="messages">
          {messages.map(message => (
            <div key={message.messageId} className="message">
              <strong>{message.sender.firstName}:</strong> {message.content}
            </div>
          ))}
          
          {typingUsers.size > 0 && (
            <div className="typing-indicator">
              Someone is typing...
            </div>
          )}
        </div>
        
        <div className="message-input">
          <input
            ref={messageInputRef}
            type="text"
            placeholder="Type a message..."
            onKeyPress={(e) => {
              if (e.key === 'Enter') sendMessage();
              else handleTyping();
            }}
          />
          <button onClick={sendMessage}>Send</button>
        </div>
      </div>
    </div>
  );
};

export default ChatComponent;
```

## Key Events Summary

### Client → Server Events:
- `join_conversation` - Join a conversation room
- `leave_conversation` - Leave a conversation room  
- `send_message` - Send a new message
- `typing_start` - Start typing indicator
- `typing_stop` - Stop typing indicator
- `mark_messages_read` - Mark messages as read
- `get_online_users` - Request online users list

### Server → Client Events:
- `new_message` - New message received
- `message_notification` - Message notification (when not in room)
- `message_sent` - Confirmation message was sent
- `message_error` - Error sending message
- `user_typing` - Typing indicator from other user
- `messages_read` - Messages were read by recipient
- `user_online` - User came online
- `user_offline` - User went offline
- `online_users` - List of online users

## Best Practices

1. **Hybrid Approach**: Use Socket.IO for real-time features, REST API for data persistence
2. **Room Management**: Join/leave conversation rooms to manage message delivery
3. **Error Handling**: Always handle connection errors and message failures
4. **Typing Cleanup**: Set timeouts for typing indicators
5. **Message History**: Load initial conversation history from REST API
6. **Authentication**: Always authenticate Socket.IO connections
7. **Reconnection**: Handle reconnection scenarios gracefully 