import React, { useEffect, useState, useRef } from 'react';
import { io } from 'socket.io-client';
import axios from 'axios';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Send, User as UserIcon, Search, Loader2, MessageSquare, Video, Paperclip, FileText, Users, Globe, Clock } from 'lucide-react';

import { useSocket } from '../context/SocketContext';

const Chat = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const initialPeerId = searchParams.get('peer') || '';

  const [activePeer, setActivePeer] = useState(null);
  const [contacts, setContacts] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('recent');
  const [recentChats, setRecentChats] = useState([]);
  const [userRequests, setUserRequests] = useState([]);
  const { socket } = useSocket();
  
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [userId, setUserId] = useState('');
  const [isLoadingContacts, setIsLoadingContacts] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    const initChat = async () => {
      try {
        setIsLoadingContacts(true);
        const token = localStorage.getItem('token');
        
        const profileRes = await axios.get('https://bleach-porcupine-parasail.ngrok-free.dev/api/auth/profile', {
          
          headers: { Authorization: `Bearer ${token}`, "ngrok-skip-browser-warning": "true" }
        });
        const currentUserId = profileRes.data._id;
        setUserId(currentUserId);
        
        const [matchRes, allUsersRes, requestsRes, recentRes] = await Promise.all([
          axios.get('https://bleach-porcupine-parasail.ngrok-free.dev/api/match/', { withCredentials: true, headers: { "ngrok-skip-browser-warning": "true" } }),
          axios.get('https://bleach-porcupine-parasail.ngrok-free.dev/api/user/search?q=', { headers: { Authorization: `Bearer ${token}`, "ngrok-skip-browser-warning": "true" } }),
          axios.get('https://bleach-porcupine-parasail.ngrok-free.dev/api/request/all', { headers: { Authorization: `Bearer ${token}`, "ngrok-skip-browser-warning": "true" } }),
          axios.get('https://bleach-porcupine-parasail.ngrok-free.dev/api/chat/recent', { headers: { Authorization: `Bearer ${token}`, "ngrok-skip-browser-warning": "true" } })
        ]);
        
        const matches = matchRes.data.matches || [];
        setContacts(matches);
        setAllUsers(allUsersRes.data.users || []);
        setUserRequests(requestsRes.data.requests || []);
        setRecentChats(recentRes.data.users || []);

        if (initialPeerId) {
          let peer = matches.find(m => m.userId === initialPeerId);
          if (!peer) {
            peer = allUsersRes.data.users.find(u => u._id === initialPeerId);
            if (peer) peer = { ...peer, userId: peer._id };
          }
          
          if (peer) {
            handleContactClick(peer, currentUserId);
          } else {
            setActivePeer({ userId: initialPeerId, name: 'Connection' });
            fetchHistory(currentUserId, initialPeerId);
          }
        }

      } catch (err) {
        console.error(err);
        setError('Failed to load chat data. Please log in again.');
      } finally {
        setIsLoadingContacts(false);
      }
    };
    initChat();
  }, []);

  useEffect(() => {
    if (!socket) return;
    const handleReceive = (msg) => {
      // Only append to this chat if the message is from or to the active peer
      // and we are currently viewing their chat
      if (activePeer && (msg.senderId === activePeer.userId || msg.receiverId === activePeer.userId)) {
        setMessages(prev => [...prev, msg]);
      }
    };
    socket.on('receive_message', handleReceive);
    return () => {
      socket.off('receive_message', handleReceive);
    };
  }, [socket, activePeer]);

  const fetchHistory = async (currentUserId, peerId) => {
    if (!peerId || !currentUserId) return;
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`https://bleach-porcupine-parasail.ngrok-free.dev/api/chat/history/${peerId}`, {
        headers: { Authorization: `Bearer ${token}`, "ngrok-skip-browser-warning": "true" }
      });
      setMessages(res.data || []);
    } catch (err) {
      console.error('Failed to fetch history', err);
    }
  };

  const handleContactClick = (contact, uId = userId) => {
    const peerContact = { ...contact, userId: contact.userId || contact._id };
    setActivePeer(peerContact);
    setSearchParams({ peer: peerContact.userId });
    setMessages([]);
    setSearchQuery('');
    fetchHistory(uId, peerContact.userId);
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file || !activePeer) return;

    try {
      setIsUploading(true);
      const formData = new FormData();
      formData.append('file', file);

      const token = localStorage.getItem('token');
      const res = await axios.post('https://bleach-porcupine-parasail.ngrok-free.dev/api/upload', formData, {
        headers: { 
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}` 
        }
      });

      const { fileUrl, fileName } = res.data;
      
      socket.emit('send_message', { 
        senderId: userId, 
        receiverId: activePeer.userId, 
        message: 'Shared a file',
        fileUrl,
        fileName
      });
      
      setMessages(prev => [...prev, { 
        senderId: userId, 
        message: 'Shared a file', 
        fileUrl, 
        fileName, 
        timestamp: new Date() 
      }]);
      
    } catch (err) {
      console.error('File upload failed', err);
      alert('Failed to upload file. Please try again.');
    } finally {
      setIsUploading(false);
      e.target.value = null;
    }
  };

  const sendMessage = (e) => {
    e?.preventDefault();
    if (!message.trim() || !activePeer) return;

    socket.emit('send_message', { senderId: userId, receiverId: activePeer.userId, message });
    setMessages(prev => [...prev, { senderId: userId, message, timestamp: new Date() }]);
    setMessage('');
  };

  const startVideoCall = () => {
    if (!activePeer) return;
    const inviteMessage = `🎥 I'm inviting you to a video call! Click the Video icon at the top to join me, or go to: https://l2-fe.vercel.app/video?peer=${userId}`;
    socket?.emit('send_message', { senderId: userId, receiverId: activePeer.userId, message: inviteMessage });
    setMessages(prev => [...prev, { senderId: userId, message: inviteMessage, timestamp: new Date() }]);
    navigate(`/video?peer=${activePeer.userId}`);
  };

  const getRelationshipStatus = (peerId) => {
    const sent = userRequests.find(r => r.receiver === peerId && r.sender === userId);
    const received = userRequests.find(r => r.sender === peerId && r.receiver === userId);
    if (sent) return { status: sent.status, role: 'sender' };
    if (received) return { status: received.status, role: 'receiver' };
    return { status: 'none', role: 'none' };
  };

  const handleSendRequest = async (peerId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.post('https://bleach-porcupine-parasail.ngrok-free.dev/api/request/send', { receiverId: peerId }, {
        headers: { Authorization: `Bearer ${token}`, "ngrok-skip-browser-warning": "true" }
      });
      // Refresh requests
      const res = await axios.get('https://bleach-porcupine-parasail.ngrok-free.dev/api/request/all', {
        headers: { Authorization: `Bearer ${token}`, "ngrok-skip-browser-warning": "true" }
      });
      setUserRequests(res.data.requests || []);
    } catch (err) {
      alert('Failed to send request');
    }
  };

  const getInitials = (name) => name ? name.charAt(0).toUpperCase() : '?';
  const isImage = (fileName) => fileName?.match(/\.(jpeg|jpg|gif|png|webp)$/i) != null;

  const renderSidebarList = () => {
    if (isLoadingContacts) {
      return (
        <div className="flex justify-center items-center h-32">
          <Loader2 className="animate-spin text-blue-500" size={24} />
        </div>
      );
    }
    
    let listToShow = activeTab === 'matches' ? contacts : activeTab === 'recent' ? recentChats : allUsers;
    
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      listToShow = listToShow.filter(user => 
        user.name?.toLowerCase().includes(query) || user.email?.toLowerCase().includes(query)
      );
    }

    if (listToShow.length === 0) {
      return (
        <div className="p-6 text-center text-slate-500 text-sm">
          {searchQuery ? 'No users found matching your search.' : `No ${activeTab} found.`}
        </div>
      );
    }

    return listToShow.map(user => {
      const uId = user.userId || user._id;
      return (
        <button
          key={uId}
          onClick={() => handleContactClick(user)}
          className={`w-full flex items-center p-4 border-b border-slate-100 transition-colors text-left hover:bg-slate-100 ${
            activePeer?.userId === uId ? 'bg-blue-50 border-l-4 border-l-blue-600' : 'border-l-4 border-l-transparent'
          }`}
        >
          <div className="h-12 w-12 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold flex-shrink-0 shadow-sm">
            {getInitials(user.name)}
          </div>
          <div className="ml-3 overflow-hidden">
            <h4 className="text-sm font-semibold text-slate-900 truncate">{user.name}</h4>
            <p className="text-xs text-slate-500 truncate mt-0.5">
              {activeTab === 'matches' ? 'Match connection' : activeTab === 'recent' ? 'Recent chat' : 'Platform user'}
            </p>
          </div>
        </button>
      );
    });
  };

  const getCleanFileUrl = (url) => {
    if (!url) return '';
    let cleanUrl = url;
    if (cleanUrl.includes('localhost:5000')) {
      cleanUrl = cleanUrl.replace('http://localhost:5000', '');
    }
    if (cleanUrl.startsWith('http')) return cleanUrl;
    return `https://bleach-porcupine-parasail.ngrok-free.dev${cleanUrl.startsWith('/') ? '' : '/'}${cleanUrl}`;
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-slate-50 p-4 sm:p-6 lg:p-8 flex justify-center">
      <div className="w-full max-w-6xl bg-white rounded-3xl shadow-lg border border-slate-200 overflow-hidden flex h-[80vh] min-h-[600px] animate-fade-in">
        
        <div className="w-full max-w-xs md:w-80 border-r border-slate-200 bg-slate-50 flex flex-col hidden sm:flex">
          <div className="p-4 border-b border-slate-200 bg-white shadow-sm z-10">
            <h2 className="text-xl font-bold text-slate-900 flex items-center mb-4">
              <MessageSquare className="mr-2 text-blue-600" size={20} />
              Messaging
            </h2>
            
            <div className="flex bg-slate-100 p-1 rounded-xl mb-4">
              <button 
                onClick={() => setActiveTab('recent')}
                className={`flex-1 flex items-center justify-center py-1.5 text-sm font-medium rounded-lg transition-all ${activeTab === 'recent' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                title="Recent Chats"
              >
                <Clock size={16} />
              </button>
              <button 
                onClick={() => setActiveTab('matches')}
                className={`flex-1 flex items-center justify-center py-1.5 text-sm font-medium rounded-lg transition-all ${activeTab === 'matches' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                title="Matches"
              >
                <Users size={16} />
              </button>
              <button 
                onClick={() => setActiveTab('all')}
                className={`flex-1 flex items-center justify-center py-1.5 text-sm font-medium rounded-lg transition-all ${activeTab === 'all' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                title="All Users"
              >
                <Globe size={16} />
              </button>
            </div>

            <div className="relative">
              <input
                type="text"
                placeholder={`Search ${activeTab}...`}
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-slate-100 border border-transparent rounded-xl text-sm focus:border-blue-300 focus:bg-white focus:ring-4 focus:ring-blue-50 transition-all outline-none"
              />
              <Search className="absolute left-3 top-2.5 text-slate-400" size={16} />
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto bg-slate-50">
            {renderSidebarList()}
          </div>
        </div>

        <div className="flex-1 flex flex-col bg-white w-full relative">
          {activePeer ? (
            <>
              <div className="px-6 py-4 border-b border-slate-200 bg-white flex justify-between items-center z-10 shadow-sm">
                <div className="flex items-center space-x-3">
                  <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold">
                    {getInitials(activePeer.name)}
                  </div>
                  <div>
                    <h3 className="text-md font-bold text-slate-900">{activePeer.name}</h3>
                    {activePeer.email && <p className="text-xs text-slate-500">{activePeer.email}</p>}
                  </div>
                </div>
                {getRelationshipStatus(activePeer.userId).status === 'accepted' && (
                  <button 
                    onClick={startVideoCall}
                    className="bg-blue-50 hover:bg-blue-100 text-blue-600 p-2.5 rounded-full transition-colors flex items-center justify-center shadow-sm border border-blue-100"
                    title="Start Video Call"
                  >
                    <Video size={20} />
                  </button>
                )}
              </div>

              <div className="flex-1 overflow-y-auto p-6 bg-slate-50/50 space-y-4">
                {messages.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-slate-400">
                    <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mb-4">
                      <MessageSquare className="w-8 h-8 text-blue-400" />
                    </div>
                    <p className="text-sm font-medium">Say hi to {activePeer.name.split(' ')[0]}!</p>
                  </div>
                ) : (
                  messages.map((msg, idx) => {
                    const isMe = (msg.senderId || msg.sender) === userId;
                    return (
                      <div key={idx} className={`flex ${isMe ? 'justify-end' : 'justify-start'} animate-fade-in`}>
                        <div 
                          className={`max-w-[75%] px-5 py-3 rounded-2xl shadow-sm ${
                            isMe 
                              ? 'bg-blue-600 text-white rounded-br-sm' 
                              : 'bg-white text-slate-800 border border-slate-200 rounded-bl-sm'
                          }`}
                        >
                          {msg.fileUrl && (
                            <div className="mb-2">
                              {isImage(msg.fileName) ? (
                                <img src={getCleanFileUrl(msg.fileUrl)} alt={msg.fileName} className="max-w-full rounded-lg max-h-64 object-cover" />
                              ) : (
                                <a href={getCleanFileUrl(msg.fileUrl)} target="_blank" rel="noreferrer" className={`flex items-center space-x-2 p-2 rounded-lg ${isMe ? 'bg-blue-700/50 hover:bg-blue-700' : 'bg-slate-100 hover:bg-slate-200'} transition-colors`}>
                                  <FileText size={20} />
                                  <span className="text-sm underline truncate">{msg.fileName}</span>
                                </a>
                              )}
                            </div>
                          )}
                          
                          <p className="text-sm leading-relaxed break-words">{msg.message}</p>
                          <div className={`text-[10px] mt-1 flex ${isMe ? 'text-blue-100 justify-end' : 'text-slate-400 justify-start'}`}>
                            {new Date(msg.timestamp || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              <div className="bg-white p-4 sm:p-6 border-t border-slate-200">
                {getRelationshipStatus(activePeer.userId).status === 'accepted' ? (
                  <form 
                    className="flex items-end gap-3 max-w-4xl mx-auto relative" 
                    onSubmit={sendMessage}
                  >
                  <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    onChange={handleFileUpload}
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current.click()}
                    disabled={isUploading}
                    className="p-3.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all disabled:opacity-50"
                  >
                    {isUploading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Paperclip className="w-5 h-5" />}
                  </button>
                  
                  <input
                    type="text"
                    placeholder="Write a message..."
                    className="w-full px-5 py-3.5 border border-slate-300 rounded-xl focus:outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-50 bg-slate-50 focus:bg-white transition-all text-sm"
                    value={message}
                    onChange={e => setMessage(e.target.value)}
                  />
                  <button 
                    type="submit"
                    disabled={!message.trim()}
                    className="bg-blue-600 hover:bg-blue-700 text-white p-3.5 rounded-xl transition-all shadow-md disabled:bg-blue-300 disabled:shadow-none disabled:cursor-not-allowed flex items-center justify-center"
                  >
                    <Send className="w-5 h-5" />
                  </button>
                </form>
                ) : (
                  <div className="flex flex-col items-center justify-center py-4 px-6 bg-slate-50 rounded-xl border border-slate-100 text-center">
                    <p className="text-slate-600 mb-4 text-sm">
                      You must be connected to send messages and make video calls.
                    </p>
                    {getRelationshipStatus(activePeer.userId).status === 'none' && (
                      <button 
                        onClick={() => handleSendRequest(activePeer.userId)}
                        className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-sm transition-all"
                      >
                        Send Connection Request
                      </button>
                    )}
                    {getRelationshipStatus(activePeer.userId).status === 'pending' && getRelationshipStatus(activePeer.userId).role === 'sender' && (
                      <button disabled className="px-6 py-2.5 bg-slate-200 text-slate-500 font-semibold rounded-lg">
                        Request Sent
                      </button>
                    )}
                    {getRelationshipStatus(activePeer.userId).status === 'pending' && getRelationshipStatus(activePeer.userId).role === 'receiver' && (
                      <button onClick={() => navigate('/requests')} className="px-6 py-2.5 bg-brand-100 text-brand-700 hover:bg-brand-200 font-semibold rounded-lg transition-all">
                        Review Request
                      </button>
                    )}
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center bg-slate-50 text-slate-400">
              <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center shadow-sm mb-6 border border-slate-100">
                <MessageSquare className="w-10 h-10 text-slate-300" />
              </div>
              <h3 className="text-xl font-bold text-slate-700 mb-2">Your Messages</h3>
              <p className="text-sm text-slate-500 max-w-xs text-center">
                Search for users or select a contact to start a conversation.
              </p>
            </div>
          )}
          
        </div>
      </div>
    </div>
  );
};

export default Chat;