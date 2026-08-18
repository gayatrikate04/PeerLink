const VideoSession = require('../models/VideoSession');

module.exports = (io) => {
  io.on('connection', (socket) => {
    // WebRTC signaling: join room
    socket.on('join_video_room', ({ roomId, userId }) => {
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

    // Save session to DB (optional)
    socket.on('save_video_session', async ({ userA, userB }) => {
      const session = new VideoSession({ userA, userB });
      await session.save();
    });

    socket.on('leave_video_room', ({ roomId, userId }) => {
      socket.leave(roomId);
      io.to(roomId).emit('user_left', { userId });
    });
  });
};
