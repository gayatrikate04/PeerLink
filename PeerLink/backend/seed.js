const mongoose = require('mongoose');
const User = require('./src/models/User');
require('dotenv').config();

const users = [
  {
    name: 'Alice Smith',
    email: 'alice@example.com',
    password: 'password123',
    role: 'user',
    skillsKnown: ['JavaScript', 'HTML'],
    skillsToLearn: ['Python', 'React']
  },
  {
    name: 'Bob Johnson',
    email: 'bob@example.com',
    password: 'password123',
    role: 'user',
    skillsKnown: ['Python'],
    skillsToLearn: ['JavaScript', 'Node.js']
  },
  {
    name: 'Carol Lee',
    email: 'carol@example.com',
    password: 'password123',
    role: 'admin',
    skillsKnown: ['React', 'Node.js'],
    skillsToLearn: ['TypeScript']
  }
];

async function seed() {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('Connected to MongoDB');

    await User.deleteMany({});
    console.log('Cleared existing users');

    await User.insertMany(users);
    console.log('Inserted dummy users');
  } catch (err) {
    console.error('Seeding error:', err);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

seed();
