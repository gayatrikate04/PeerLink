const Chat = require('../models/Chat');
const User = require('../models/User');

module.exports = (io) => {
  io.on('connection', (socket) => {
    
    // Join user to their personal room
    socket.on('join', ({ userId }) => {
      socket.join(userId);
    });

    // Handle sending a message or video call invite
    socket.on('send_message', async ({ senderId, receiverId, message, fileUrl, fileName }) => {
      const chat = new Chat({ sender: senderId, receiver: receiverId, message, fileUrl, fileName });
      
      // 🚀 CRITICAL FIX: Emit to the receiver instantly without waiting for the DB
      io.to(receiverId).emit('receive_message', {
        senderId,
        message,
        fileUrl,
        fileName,
        timestamp: chat.timestamp
      });
      
      // 💾 Save to MongoDB asynchronously in the background
      await chat.save().catch(err => console.error('Failed to save chat:', err));
    });

    // Handle fetching chat history
    socket.on('fetch_history', async ({ userId, peerId }, callback) => {
      try {
        const history = await Chat.find({
          $or: [
            { sender: userId, receiver: peerId },
            { sender: peerId, receiver: userId }
          ]
        }).sort({ timestamp: 1 });
        callback(history);
      } catch (err) {
        console.error('Failed to fetch history:', err);
        callback([]);
      }
    });

    socket.on('disconnect', () => {
      // Disconnection logic if any
    });
  });
};