const Request = require('../models/Request');
const User = require('../models/User');

exports.sendRequest = async (req, res) => {
  try {
    const { receiverId } = req.body;
    const senderId = req.user.userId;
    const existing = await Request.findOne({ sender: senderId, receiver: receiverId, status: 'pending' });
    if (existing) return res.status(400).json({ message: 'Request already sent' });
    const request = new Request({ sender: senderId, receiver: receiverId });
    await request.save();
    res.status(201).json({ message: 'Request sent', request });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err });
  }
};

exports.getRequests = async (req, res) => {
  try {
    const userId = req.user.userId;
    const requests = await Request.find({ receiver: userId, status: 'pending' }).populate('sender', 'name email');
    res.json({ requests });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err });
  }
};

exports.respondRequest = async (req, res) => {
  try {
    const { requestId, action } = req.body; // action: 'accept' or 'reject'
    const request = await Request.findById(requestId);
    if (!request) return res.status(404).json({ message: 'Request not found' });
    if (request.status !== 'pending') return res.status(400).json({ message: 'Request already handled' });
    request.status = action === 'accept' ? 'accepted' : 'rejected';
    await request.save();
    res.json({ message: `Request ${request.status}` });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err });
  }
};
