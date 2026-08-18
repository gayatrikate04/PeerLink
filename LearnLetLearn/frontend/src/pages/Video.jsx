import React, { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import axios from 'axios';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Video as VideoIcon, User, Loader2 } from 'lucide-react';

const socket = io('/', { autoConnect: false });

const Video = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const peerId = searchParams.get('peer');
  
  const [roomId, setRoomId] = useState('');
  const [userId, setUserId] = useState('');
  const [status, setStatus] = useState('');
  
  // Contacts state for when peerId is missing
  const [contacts, setContacts] = useState([]);
  const [isLoadingContacts, setIsLoadingContacts] = useState(false);
  
  // UI States
  const [isJoined, setIsJoined] = useState(false);
  const [isCalling, setIsCalling] = useState(false);
  
  const localVideo = useRef(null);
  const remoteVideo = useRef(null);
  const [stream, setStream] = useState(null);
  const [peerConnection, setPeerConnection] = useState(null);

  // Initialize and Fetch Profile / Contacts
  useEffect(() => {
    const initVideo = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get('http://localhost:5000/api/auth/profile', {
          headers: { Authorization: `Bearer ${token}` }
        });
        const currentUserId = res.data._id;
        setUserId(currentUserId);
        
        socket.connect();

        // If no peerId, fetch contacts to select from
        if (!peerId) {
          setIsLoadingContacts(true);
          const matchRes = await axios.get('http://localhost:5000/api/match/', {
            withCredentials: true
          });
          setContacts(matchRes.data.matches || []);
          setIsLoadingContacts(false);
        } else {
          // If peerId exists, auto-generate room
          const generatedRoomId = [currentUserId, peerId].sort().join('_');
          setRoomId(generatedRoomId);
        }
      } catch (err) {
        setStatus('Failed to load. Please log in again.');
        setIsLoadingContacts(false);
      }
    };
    initVideo();
    return () => socket.disconnect();
  }, [peerId]);

  useEffect(() => {
    if (!peerConnection) return;
    
    socket.on('video_offer', async ({ offer, senderId }) => {
      await peerConnection.setRemoteDescription(new RTCSessionDescription(offer));
      const answer = await peerConnection.createAnswer();
      await peerConnection.setLocalDescription(answer);
      socket.emit('video_answer', { roomId, answer, senderId: userId });
      setStatus('Call connected');
      setIsCalling(true);
    });
    
    socket.on('video_answer', async ({ answer }) => {
      await peerConnection.setRemoteDescription(new RTCSessionDescription(answer));
      setStatus('Call connected');
      setIsCalling(true);
    });
    
    socket.on('ice_candidate', async ({ candidate }) => {
      if (candidate) peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
    });
    
    return () => {
      socket.off('video_offer');
      socket.off('video_answer');
      socket.off('ice_candidate');
    };
  }, [peerConnection, roomId, userId]);

  const handleSelectContact = (contactId) => {
    setSearchParams({ peer: contactId });
  };

  const joinRoom = async () => {
    if (!roomId) return;
    try {
      setStatus('Accessing camera and microphone...');
      const mediaStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      setStream(mediaStream);
      localVideo.current.srcObject = mediaStream;
      
      socket.emit('join_video_room', { roomId, userId, roomType: 'public', roomPassword: '' });
      setIsJoined(true);
      setStatus(`Ready. Waiting for peer to join...`);
      
      const pc = new RTCPeerConnection({
        iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
      });
      mediaStream.getTracks().forEach(track => pc.addTrack(track, mediaStream));
      pc.ontrack = event => {
        remoteVideo.current.srcObject = event.streams[0];
      };
      pc.onicecandidate = event => {
        if (event.candidate) {
          socket.emit('ice_candidate', { roomId, candidate: event.candidate, senderId: userId });
        }
      };
      setPeerConnection(pc);
    } catch (err) {
      setStatus('Error accessing camera/microphone. Check permissions.');
    }
  };

  const startCall = async () => {
    if (!peerConnection) return;
    try {
      setStatus('Calling peer...');
      setIsCalling(true);
      const offer = await peerConnection.createOffer();
      await peerConnection.setLocalDescription(offer);
      socket.emit('video_offer', { roomId, offer, senderId: userId });
    } catch (err) {
      setStatus('Failed to start the call.');
      setIsCalling(false);
    }
  };

  const stopCall = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
    }
    if (peerConnection) {
      peerConnection.close();
    }
    setStream(null);
    setPeerConnection(null);
    setIsJoined(false);
    setIsCalling(false);
    socket.emit('leave_video_room', { roomId, userId });
    navigate('/chat');
  };

  const getInitials = (name) => name ? name.charAt(0).toUpperCase() : '?';

  // Render Contact Selection if no peerId
  if (!peerId) {
    return (
      <div className="min-h-[calc(100vh-4rem)] bg-slate-50 flex items-center justify-center p-4 sm:p-6 lg:p-8">
        <div className="w-full max-w-lg bg-white rounded-3xl shadow-lg border border-slate-200 overflow-hidden animate-fade-in">
          <div className="p-6 border-b border-slate-100 text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4 text-blue-600">
              <VideoIcon size={32} />
            </div>
            <h2 className="text-2xl font-bold text-slate-900">Start a Video Call</h2>
            <p className="text-sm text-slate-500 mt-2">Select a connection to start a live session.</p>
          </div>
          
          <div className="max-h-[60vh] overflow-y-auto p-4 space-y-2">
            {isLoadingContacts ? (
              <div className="flex justify-center items-center py-10">
                <Loader2 className="animate-spin text-blue-500" size={32} />
              </div>
            ) : contacts.length === 0 ? (
              <div className="text-center py-10 text-slate-500 text-sm">
                You have no matches yet. Go to the Match page to find peers!
              </div>
            ) : (
              contacts.map(contact => (
                <button
                  key={contact.userId}
                  onClick={() => handleSelectContact(contact.userId)}
                  className="w-full flex items-center justify-between p-4 rounded-2xl border border-slate-100 hover:border-blue-200 hover:shadow-md transition-all bg-white group"
                >
                  <div className="flex items-center">
                    <div className="h-12 w-12 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold flex-shrink-0">
                      {getInitials(contact.name)}
                    </div>
                    <div className="ml-4 text-left">
                      <h4 className="text-sm font-bold text-slate-900 group-hover:text-blue-600 transition-colors">{contact.name}</h4>
                      <p className="text-xs text-slate-500">{contact.email}</p>
                    </div>
                  </div>
                  <div className="bg-blue-50 p-2.5 rounded-full text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                    <VideoIcon size={18} />
                  </div>
                </button>
              ))
            )}
          </div>
        </div>
      </div>
    );
  }

  // Render Video Stage
  return (
    <div className="min-h-[calc(100vh-4rem)] bg-slate-50 flex flex-col p-2 sm:p-4 md:p-6 lg:p-8">
      
      <div className="mb-4 flex justify-between items-center max-w-6xl mx-auto w-full">
        <button 
          onClick={() => {
            if (isJoined) stopCall();
            navigate('/video');
          }}
          className="text-slate-500 hover:text-slate-800 flex items-center transition-colors text-sm font-medium bg-white px-3 sm:px-4 py-2 rounded-lg shadow-sm border border-slate-200"
        >
          <svg className="w-4 h-4 mr-1 sm:mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
          <span className="hidden sm:inline">Back to Contacts</span>
          <span className="sm:hidden">Back</span>
        </button>
      </div>

      <div className="w-full max-w-6xl mx-auto bg-white rounded-2xl sm:rounded-3xl shadow-xl overflow-hidden flex flex-col border border-slate-200 animate-fade-in flex-1">
        
        {/* Header Area */}
        <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-slate-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-white z-10">
          <div className="flex items-center space-x-3">
            <div className="h-8 w-8 sm:h-10 sm:w-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 flex-shrink-0">
              <VideoIcon size={20} />
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 truncate">Live Session</h2>
          </div>
          
          {/* Status Badge */}
          {status && (
            <div className={`px-3 py-1 sm:px-4 sm:py-1.5 rounded-full text-[10px] sm:text-xs font-semibold shadow-sm transition-colors whitespace-nowrap self-end sm:self-auto ${
              status.includes('Error') || status.includes('Failed') ? 'bg-red-100 text-red-700' :
              status.includes('connected') || status.includes('Calling') ? 'bg-green-100 text-green-700' :
              'bg-blue-50 text-blue-700 border border-blue-100'
            }`}>
              <span className="flex items-center">
                {status.includes('connected') && <span className="w-2 h-2 rounded-full bg-green-500 mr-1.5 sm:mr-2 animate-pulse"></span>}
                {status}
              </span>
            </div>
          )}
        </div>

        {/* Video Stage */}
        <div className="bg-slate-900 p-3 sm:p-4 md:p-6 grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 md:gap-6 flex-1 min-h-[400px]">
          
          {/* Local Video */}
          <div className="relative aspect-[4/3] sm:aspect-video bg-black rounded-xl sm:rounded-2xl overflow-hidden shadow-inner border border-slate-700 group flex items-center justify-center">
            <video 
              ref={localVideo} 
              autoPlay 
              playsInline 
              muted
              className="w-full h-full object-cover transform scale-x-[-1]" 
            />
            <div className="absolute bottom-2 sm:bottom-3 left-2 sm:left-3 bg-black/60 backdrop-blur-sm text-white text-[10px] sm:text-xs px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg flex items-center z-10">
              You
            </div>
            {!stream && (
              <div className="absolute inset-0 flex items-center justify-center flex-col text-slate-500">
                <User size={40} className="mb-2 opacity-50 sm:w-12 sm:h-12" />
                <p className="text-xs sm:text-sm font-medium">Camera Off</p>
              </div>
            )}
          </div>

          {/* Remote Video */}
          <div className="relative aspect-[4/3] sm:aspect-video bg-slate-800 rounded-xl sm:rounded-2xl overflow-hidden shadow-inner border border-slate-700 flex items-center justify-center">
            <video 
              ref={remoteVideo} 
              autoPlay 
              playsInline 
              className="w-full h-full object-cover" 
            />
            <div className="absolute bottom-2 sm:bottom-3 left-2 sm:left-3 bg-black/60 backdrop-blur-sm text-white text-[10px] sm:text-xs px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg flex items-center z-10">
              Peer
            </div>
            {!isCalling && (
              <div className="absolute inset-0 flex items-center justify-center flex-col text-slate-500 bg-slate-800">
                <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-slate-700 flex items-center justify-center mb-2 sm:mb-3 animate-pulse">
                  <User size={24} className="sm:w-8 sm:h-8" />
                </div>
                <p className="text-xs sm:text-sm font-medium">Waiting for peer...</p>
              </div>
            )}
          </div>

        </div>

        {/* Controls Bar */}
        <div className="bg-white px-4 sm:px-6 py-4 sm:py-5 border-t border-slate-200">
          <div className="max-w-3xl mx-auto flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
            {!isJoined ? (
              <button 
                onClick={joinRoom}
                disabled={!roomId}
                className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white font-medium px-6 sm:px-8 py-3 sm:py-3.5 rounded-xl transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap flex items-center justify-center text-sm sm:text-base"
              >
                <VideoIcon size={20} className="mr-2" />
                Enable Camera & Mic
              </button>
            ) : (
              <div className="flex flex-col sm:flex-row w-full sm:w-auto gap-3">
                <button 
                  onClick={startCall}
                  disabled={isCalling}
                  className={`w-full sm:w-auto text-white font-medium px-6 sm:px-8 py-3 sm:py-3.5 rounded-xl transition-all shadow-md whitespace-nowrap flex items-center justify-center text-sm sm:text-base ${
                    isCalling 
                      ? 'bg-green-500/50 cursor-not-allowed' 
                      : 'bg-green-600 hover:bg-green-700'
                  }`}
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 00.95.684H19a2 2 0 012 2v7a2 2 0 01-2 2H6a2 2 0 01-2-2V5z" /></svg>
                  {isCalling ? 'Call Active' : 'Start Ringing Peer'}
                </button>
                <button 
                  onClick={stopCall}
                  className="w-full sm:w-auto bg-red-600 hover:bg-red-700 text-white font-medium px-6 sm:px-8 py-3 sm:py-3.5 rounded-xl transition-all shadow-md whitespace-nowrap flex items-center justify-center text-sm sm:text-base"
                >
                  End Session
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Video;