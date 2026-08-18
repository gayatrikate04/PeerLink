const VideoSession = require('../models/VideoSession');

// In-memory store for private room passwords (for demo; use DB for production)
const privateRoomPasswords = {};

module.exports = (io) => {
  io.on('connection', (socket) => {
    // WebRTC signaling: join room
    socket.on('join_video_room', ({ roomId, userId, roomType, roomPassword }) => {
      if (roomType === 'private') {
        // If room doesn't exist, set password; else, check password
        if (!privateRoomPasswords[roomId]) {
          privateRoomPasswords[roomId] = roomPassword;
        } else if (privateRoomPasswords[roomId] !== roomPassword) {
          socket.emit('join_error', { message: 'Incorrect password for private room.' });
          return;
        }
      }
      socket.join(roomId);
      io.to(roomId).emit('user_joined', { userId });
    });

    // WebRTC signaling: offer
    socket.on('video_offer', ({ roomId, offer, senderId }) => {
      socket.to(roomId).emit('video_offer', { offer, senderId });
    });

    // WebRTC signaling: answer
    socket.on('video_answer', ({ roomId, answer, senderId }) => {
      socket.to(roomId).emit('video_answer', { answer, senderId });
    });

    // WebRTC signaling: ICE candidate
    socket.on('ice_candidate', ({ roomId, candidate, senderId }) => {
      socket.to(roomId).emit('ice_candidate', { candidate, senderId });
    });

    // Save session to DB asynchronously in the background
    socket.on('save_video_session', ({ userA, userB }) => {
      const session = new VideoSession({ userA, userB });
      session.save().catch(err => console.error('Failed to save video session:', err));
    });

    socket.on('leave_video_room', ({ roomId, userId }) => {
      socket.leave(roomId);
      io.to(roomId).emit('user_left', { userId });
    });
  });
};
