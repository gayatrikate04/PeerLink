import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { SocketProvider } from './context/SocketContext';
import Login from './pages/Login';
import Home from './pages/Home';
import Register from './pages/Register';
import Profile from './pages/Profile';
import Skills from './pages/Skills';
import Match from './pages/Match';
import Chat from './pages/Chat';
import Video from './pages/Video';
import Requests from './pages/Requests';
import Navbar from './components/Navbar';

function App() {
  return (
    <Router>
      <SocketProvider>
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/skills" element={<Skills />} />
          <Route path="/match" element={<Match />} />
          <Route path="/chat" element={<Chat />} />
          <Route path="/video" element={<Video />} />
          <Route path="/requests" element={<Requests />} />
        </Routes>
      </SocketProvider>
    </Router>
  );
}

export default App;
