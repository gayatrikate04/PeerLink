import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import { io } from 'socket.io-client';
import { useNavigate } from 'react-router-dom';
import { MessageSquare, Phone, X, Check } from 'lucide-react';

const SocketContext = createContext();

export const useSocket = () => useContext(SocketContext);

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [callInvite, setCallInvite] = useState(null);
  const [userId, setUserId] = useState(null);
  const timeoutRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;

    // We can fetch profile here or assume the app will manage it.
    // To ensure socket joins the right room, we need userId.
    // A better approach is to let the user login flow trigger the connection.
    // For now, let's connect.
    const newSocket = io('https://bleach-porcupine-parasail.ngrok-free.dev', { 
      autoConnect: false,
      transports: ['websocket'],
      extraHeaders: {
        "ngrok-skip-browser-warning": "true"
      }
    });
    
    // Attempt to get userId from token if possible, or we could fetch profile
    const fetchUserIdAndConnect = async () => {
      try {
        const res = await fetch('https://bleach-porcupine-parasail.ngrok-free.dev/api/auth/profile', {
          headers: { 
            Authorization: `Bearer ${token}`,
            "ngrok-skip-browser-warning": "true"
          }
        });
        if (res.ok) {
          const data = await res.json();
          setUserId(data._id);
          newSocket.connect();
          newSocket.emit('join', { userId: data._id });
        }
      } catch (err) {
        console.error('Socket connection error', err);
      }
    };
    
    fetchUserIdAndConnect();
    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, []);

  const handleActivity = useCallback(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);

    // Reconnect if disconnected
    if (socket && socket.disconnected && userId) {
      socket.connect();
      socket.emit('join', { userId });
    }

    // Set new timeout for 1 minute (60000 ms)
    timeoutRef.current = setTimeout(() => {
      if (socket && socket.connected) {
        socket.disconnect();
      }
    }, 60000);
  }, [socket, userId]);

  useEffect(() => {
    if (!socket) return;
    
    window.addEventListener('mousemove', handleActivity);
    window.addEventListener('keydown', handleActivity);
    window.addEventListener('mousedown', handleActivity);
    window.addEventListener('touchstart', handleActivity);

    handleActivity();

    return () => {
      window.removeEventListener('mousemove', handleActivity);
      window.removeEventListener('keydown', handleActivity);
      window.removeEventListener('mousedown', handleActivity);
      window.removeEventListener('touchstart', handleActivity);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [socket, handleActivity]);

  useEffect(() => {
    if (!socket) return;

    const handleReceiveMessage = (msg) => {
      // Check if it's a call invite
      if (msg.message && msg.message.includes('inviting you to a video call')) {
        setCallInvite(msg);
      } else {
        // Show normal message notification if we are not currently in the chat with that user
        // We'd need a way to know the current active peer, but for a global toast, this is fine
        // as long as we add a small check. If URL contains peer=senderId, maybe skip toast.
        const urlParams = new URLSearchParams(window.location.search);
        const activePeer = urlParams.get('peer');
        
        if (activePeer !== msg.senderId && !window.location.pathname.includes('/video')) {
          addNotification({
            id: Date.now(),
            title: 'New Message',
            message: msg.message,
            senderId: msg.senderId
          });
        }
      }
    };

    socket.on('receive_message', handleReceiveMessage);

    return () => {
      socket.off('receive_message', handleReceiveMessage);
    };
  }, [socket]);

  const addNotification = useCallback((notification) => {
    setNotifications(prev => [...prev, notification]);
    // Auto remove after 5 seconds
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== notification.id));
    }, 5000);
  }, []);

  const removeNotification = (id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const acceptCall = () => {
    if (callInvite) {
      navigate(`/video?peer=${callInvite.senderId}`);
      setCallInvite(null);
    }
  };

  const declineCall = () => {
    setCallInvite(null);
  };

  return (
    <SocketContext.Provider value={{ socket, notifications, addNotification }}>
      {children}
      
      {/* Toast Notifications Container */}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 pointer-events-none">
        {notifications.map(notif => (
          <div key={notif.id} className="bg-white rounded-lg shadow-lg border border-slate-200 p-4 w-72 flex items-start gap-3 pointer-events-auto animate-slide-up cursor-pointer" onClick={() => {
            removeNotification(notif.id);
            navigate(`/chat?peer=${notif.senderId}`);
          }}>
            <div className="bg-blue-100 p-2 rounded-full text-blue-600 flex-shrink-0">
              <MessageSquare size={16} />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-bold text-slate-900">{notif.title}</h4>
              <p className="text-xs text-slate-500 truncate">{notif.message}</p>
            </div>
            <button onClick={(e) => { e.stopPropagation(); removeNotification(notif.id); }} className="text-slate-400 hover:text-slate-600">
              <X size={14} />
            </button>
          </div>
        ))}
      </div>

      {/* Video Call Invite Popup */}
      {callInvite && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 p-6 w-full max-w-sm m-4 animate-scale-up">
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 mb-4 animate-pulse">
                <Phone size={32} />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Incoming Video Call</h3>
              <p className="text-sm text-slate-500 mb-6">
                Someone is inviting you to join a video session.
              </p>
              
              <div className="flex w-full gap-3">
                <button 
                  onClick={declineCall}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-xl transition-colors"
                >
                  <X size={18} />
                  Decline
                </button>
                <button 
                  onClick={acceptCall}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-green-500 hover:bg-green-600 text-white font-medium rounded-xl transition-colors shadow-sm shadow-green-200"
                >
                  <Check size={18} />
                  Accept
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </SocketContext.Provider>
  );
};
