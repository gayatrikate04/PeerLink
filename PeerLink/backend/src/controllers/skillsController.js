const User = require('../models/User');

exports.getSkills = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({ skillsKnown: user.skillsKnown, skillsToLearn: user.skillsToLearn });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err });
  }
};

exports.updateSkills = async (req, res) => {
  try {
    const { skillsKnown, skillsToLearn } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user.userId,
      { skillsKnown, skillsToLearn },
      { new: true }
    );
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({ message: 'Skills updated', user });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err });
  }
};
