const Chat = require('../models/Chat');
const User = require('../models/User');

module.exports = (io) => {
  io.on('connection', (socket) => {
    // Listen for join event
    socket.on('join', ({ userId }) => {
      socket.join(userId);
    });

    // Listen for send message event
    socket.on('send_message', async ({ senderId, receiverId, message }) => {
      // Save chat to DB
      const chat = new Chat({ sender: senderId, receiver: receiverId, message });
      await chat.save();
      // Emit to receiver
      io.to(receiverId).emit('receive_message', {
        senderId,
        message,
        timestamp: chat.timestamp
      });
    });

    // Optionally: fetch chat history
    socket.on('fetch_history', async ({ userId, peerId }, callback) => {
      const history = await Chat.find({
        $or: [
          { sender: userId, receiver: peerId },
          { sender: peerId, receiver: userId }
        ]
      }).sort({ timestamp: 1 });
      callback(history);
    });

    socket.on('disconnect', () => {
      // Handle disconnect
    });
  });
};
