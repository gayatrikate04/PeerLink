const Chat = require('../models/Chat');

exports.getHistory = async (req, res) => {
  try {
    const userId = req.user.userId;
    const peerId = req.params.peerId;
    
    const history = await Chat.find({
      $or: [
        { sender: userId, receiver: peerId },
        { sender: peerId, receiver: userId }
      ]
    }).sort({ timestamp: 1 });
    
    res.json(history);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err });
  }
};

exports.getRecentChats = async (req, res) => {
  try {
    const userId = req.user.userId;
    const chats = await Chat.find({
      $or: [{ sender: userId }, { receiver: userId }]
    }).sort({ timestamp: -1 });
    
    const peerIds = new Set();
    chats.forEach(chat => {
      if (chat.sender.toString() !== userId) peerIds.add(chat.sender.toString());
      if (chat.receiver.toString() !== userId) peerIds.add(chat.receiver.toString());
    });

    const User = require('../models/User');
    const recentUsers = await User.find({ _id: { $in: Array.from(peerIds) } }).select('name email _id');
    
    // Preserve order of most recent
    const orderedUsers = Array.from(peerIds).map(id => recentUsers.find(u => u._id.toString() === id)).filter(Boolean);

    res.json({ users: orderedUsers });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err });
  }
};
