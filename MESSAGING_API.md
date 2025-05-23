# Messaging API Documentation

## Overview
This API provides complete messaging functionality including sending messages, managing conversations, and tracking read status.

## Authentication
All message endpoints require authentication via JWT token in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

## API Endpoints

### 1. Send a Message
**POST** `/messages`

Send a new message to another user.

**Request Body:**
```json
{
  "recipientId": "user_id_here",
  "content": "Your message content",
  "messageType": "text" // optional: "text", "image", "file"
}
```

**Response:**
```json
{
  "message": "Message sent successfully",
  "data": {
    "messageId": "message_id",
    "sender": "sender_user_object",
    "recipient": "recipient_user_object",
    "content": "message content",
    "messageType": "text",
    "isRead": false,
    "readAt": null,
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

### 2. Get User Conversations
**GET** `/messages/conversations`

Get all conversations for the current user with last message and unread count.

**Response:**
```json
{
  "message": "Conversations retrieved successfully",
  "data": [
    {
      "user": {
        "_id": "user_id",
        "firstName": "John",
        "email": "john@example.com"
      },
      "lastMessage": {
        "content": "Last message content",
        "createdAt": "2024-01-01T00:00:00.000Z",
        "messageType": "text"
      },
      "unreadCount": 3
    }
  ],
  "count": 5
}
```

### 3. Get Conversation with Specific User
**GET** `/messages/conversation/:userId`

Get all messages in a conversation between current user and specified user.

**Query Parameters:**
- `page` (optional): Page number for pagination (default: 1)
- `limit` (optional): Number of messages per page (default: 50)

**Response:**
```json
{
  "message": "Conversation retrieved successfully",
  "data": [
    {
      "messageId": "message_id",
      "sender": "sender_object",
      "recipient": "recipient_object",
      "content": "message content",
      "messageType": "text",
      "isRead": true,
      "readAt": "2024-01-01T00:00:00.000Z",
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 50,
    "count": 25
  }
}
```

### 4. Get Unread Messages Count
**GET** `/messages/unread-count`

Get the total number of unread messages for the current user.

**Response:**
```json
{
  "message": "Unread messages count retrieved successfully",
  "unreadCount": 12
}
```

### 5. Mark Message as Read
**PATCH** `/messages/:messageId/read`

Mark a specific message as read.

**Response:**
```json
{
  "message": "Message marked as read",
  "data": {
    "messageId": "message_id",
    "isRead": true,
    "readAt": "2024-01-01T00:00:00.000Z"
  }
}
```

### 6. Mark Conversation as Read
**PATCH** `/messages/conversation/:userId/read`

Mark all messages from a specific user as read.

**Response:**
```json
{
  "message": "Conversation marked as read",
  "modifiedCount": 5
}
```

### 7. Delete Message
**DELETE** `/messages/:messageId`

Soft delete a message (marks as deleted but doesn't remove from database).

**Response:**
```json
{
  "message": "Message deleted successfully"
}
```

## Message Model Structure

```javascript
{
  sender: ObjectId (ref: User),
  recipient: ObjectId (ref: User),
  content: String (required),
  messageType: String (enum: ["text", "image", "file"], default: "text"),
  isRead: Boolean (default: false),
  readAt: Date (default: null),
  isDeleted: Boolean (default: false),
  deletedAt: Date (default: null),
  createdAt: Date (auto-generated),
  updatedAt: Date (auto-generated)
}
```

## Error Handling

All endpoints return appropriate HTTP status codes:
- `200`: Success
- `201`: Created successfully
- `400`: Bad request (missing required fields)
- `401`: Unauthorized (invalid or missing token)
- `404`: Resource not found
- `500`: Internal server error

## Usage Examples

### Send a message
```javascript
fetch('/messages', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer your-jwt-token'
  },
  body: JSON.stringify({
    recipientId: '507f1f77bcf86cd799439011',
    content: 'Hello there!'
  })
});
```

### Get conversations
```javascript
fetch('/messages/conversations', {
  headers: {
    'Authorization': 'Bearer your-jwt-token'
  }
});
``` 