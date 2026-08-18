const mongoose = require('mongoose');

const videoSessionSchema = new mongoose.Schema({
  userA: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  userB: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  sessionTime: { type: Date, default: Date.now }
});

module.exports = mongoose.model('VideoSession', videoSessionSchema);
