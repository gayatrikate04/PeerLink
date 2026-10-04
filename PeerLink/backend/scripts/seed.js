require('dotenv').config({ path: __dirname + '/../.env' });
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Models
const User = require('../src/models/User');
const Post = require('../src/models/Post');
const Match = require('../src/models/Match');
const Request = require('../src/models/Request');
const Chat = require('../src/models/Chat');

const seedDB = async () => {
  try {
    console.log('Connecting to MongoDB...', process.env.MONGO_URI);
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('Connected.');

    // Clear existing collections
    console.log('Clearing existing data...');
    await User.deleteMany({});
    await Post.deleteMany({});
    await Match.deleteMany({});
    await Request.deleteMany({});
    await Chat.deleteMany({});

    // Hash password
    const passwordHash = await bcrypt.hash('password123', 10);

    // Create Dummy Users
    console.log('Creating users...');
    const usersData = [
      {
        name: 'Alice Johnson',
        email: 'alice@example.com',
        password: passwordHash,
        skillsKnown: ['JavaScript', 'React'],
        skillsToLearn: ['Node.js', 'Python']
      },
      {
        name: 'Bob Smith',
        email: 'bob@example.com',
        password: passwordHash,
        skillsKnown: ['Python', 'Django'],
        skillsToLearn: ['JavaScript', 'React']
      },
      {
        name: 'Charlie Brown',
        email: 'charlie@example.com',
        password: passwordHash,
        skillsKnown: ['Java', 'Spring'],
        skillsToLearn: ['Docker', 'Kubernetes']
      }
    ];

    const users = await User.insertMany(usersData);

    // Create Dummy Posts
    console.log('Creating posts...');
    const postsData = [
      {
        title: 'Learning React Basics',
        content: 'I just started learning React and it is amazing! Anyone want to study together?',
        author: users[0]._id
      },
      {
        title: 'Python for Data Science',
        content: 'Looking for someone who wants to dive into Python for data analysis.',
        author: users[1]._id
      },
      {
        title: 'Mastering Java Spring',
        content: 'I can help anyone who wants to learn Java Spring framework.',
        author: users[2]._id
      }
    ];

    await Post.insertMany(postsData);

    // Create Dummy Matches
    console.log('Creating matches...');
    const matchesData = [
      {
        userA: users[0]._id,
        userB: users[1]._id,
        matchScore: 85
      }
    ];

    await Match.insertMany(matchesData);

    // Create Dummy Requests
    console.log('Creating requests...');
    const requestsData = [
      {
        sender: users[1]._id,
        receiver: users[0]._id,
        status: 'pending'
      }
    ];

    await Request.insertMany(requestsData);

    // Create Dummy Chats
    console.log('Creating chats...');
    const chatsData = [
      {
        sender: users[0]._id,
        receiver: users[1]._id,
        message: 'Hi Bob, I see you know Python. Let us exchange skills!'
      }
    ];

    await Chat.insertMany(chatsData);

    console.log('Database seeded successfully!');
  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    mongoose.connection.close();
  }
};

seedDB();
