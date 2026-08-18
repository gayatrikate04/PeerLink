const User = require('../models/User');

exports.searchUsers = async (req, res) => {
  try {
    const query = req.query.q;
    let users = [];

    if (!query) {
      users = await User.find({ _id: { $ne: req.user.userId } })
        .select('name email _id')
        .limit(50);
    } else {
      users = await User.find({
        _id: { $ne: req.user.userId },
        $or: [
          { name: { $regex: query, $options: 'i' } },
          { email: { $regex: query, $options: 'i' } }
        ]
      }).select('name email _id');
    }
    
    res.json({ users });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err });
  }
};
