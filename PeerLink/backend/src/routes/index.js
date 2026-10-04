const authRoutes = require('./auth');
const skillsRoutes = require('./skills');
const matchRoutes = require('./match');
const requestRoutes = require('./request');
const postRoutes = require('./post');
const uploadRoutes = require('./upload');
const chatRoutes = require('./chat');
const userRoutes = require('./user');

module.exports = (app) => {
  app.use('/api/auth', authRoutes);
  app.use('/api/skills', skillsRoutes);
  app.use('/api/match', matchRoutes);
  app.use('/api/request', requestRoutes);
  app.use('/api/post', postRoutes);
  app.use('/api/upload', uploadRoutes);
  app.use('/api/chat', chatRoutes);
  app.use('/api/user', userRoutes);
};
