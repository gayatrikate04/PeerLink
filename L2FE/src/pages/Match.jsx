import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { Users, Loader2, Sparkles, MessageCircle, AlertCircle, ArrowRight, Search, Globe } from 'lucide-react';

const Match = () => {
  const [matches, setMatches] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('matches'); // 'matches' | 'all'
  const [currentUserId, setCurrentUserId] = useState(null);
  const [userRequests, setUserRequests] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const token = localStorage.getItem('token');
        const [profileRes, matchRes, allUsersRes, requestsRes] = await Promise.all([
          axios.get('https://bleach-porcupine-parasail.ngrok-free.dev/api/auth/profile', { headers: { Authorization: `Bearer ${token}`, "ngrok-skip-browser-warning": "true" } }),
          axios.get('https://bleach-porcupine-parasail.ngrok-free.dev/api/match/', { withCredentials: true, headers: {"ngrok-skip-browser-warning": "true"} }),
          axios.get('https://bleach-porcupine-parasail.ngrok-free.dev/api/user/search?q=', { headers: { Authorization: `Bearer ${token}`, "ngrok-skip-browser-warning": "true" } }),
          axios.get('https://bleach-porcupine-parasail.ngrok-free.dev/api/request/all', { headers: { Authorization: `Bearer ${token}`, "ngrok-skip-browser-warning": "true" } })
        ]);
        setCurrentUserId(profileRes.data._id);
        setMatches(matchRes.data.matches || []);
        setAllUsers(allUsersRes.data.users || []);
        setUserRequests(requestsRes.data.requests || []);
      } catch (err) {
        setError('Failed to load users. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const getInitials = (name) => {
    return name ? name.charAt(0).toUpperCase() : '?';
  };

  const getRelationshipStatus = (peerId) => {
    if (!currentUserId) return { status: 'none', role: 'none' };
    const sent = userRequests.find(r => r.receiver === peerId && r.sender === currentUserId);
    const received = userRequests.find(r => r.sender === peerId && r.receiver === currentUserId);
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

  const listToShow = activeTab === 'matches' ? matches : allUsers.map(u => ({ 
    ...u, 
    userId: u._id,
    teachToOther: u.skillsKnown || [],
    learnFromOther: u.skillsToLearn || []
  }));

  const filteredUsers = listToShow.filter(user => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    const nameMatch = user.name?.toLowerCase().includes(query);
    const teachMatch = user.teachToOther?.some(s => s.toLowerCase().includes(query));
    const learnMatch = user.learnFromOther?.some(s => s.toLowerCase().includes(query));
    return nameMatch || teachMatch || learnMatch;
  });

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-surface-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        
        <div className="mb-10 animate-fade-in flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <h2 className="text-3xl font-display font-extrabold text-slate-900 tracking-tight flex items-center">
              <Users className="mr-3 text-brand-600" size={32} />
              Community
            </h2>
            <p className="mt-2 text-slate-500 max-w-2xl">
              Connect with people who have the skills you want to learn, or browse all platform users.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
            <div className="flex bg-slate-100 p-1 rounded-xl">
              <button 
                onClick={() => setActiveTab('matches')}
                className={`flex items-center justify-center px-4 py-2 text-sm font-medium rounded-lg transition-all ${activeTab === 'matches' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
              >
                <Sparkles size={16} className="mr-2" />
                Your Matches
              </button>
              <button 
                onClick={() => setActiveTab('all')}
                className={`flex items-center justify-center px-4 py-2 text-sm font-medium rounded-lg transition-all ${activeTab === 'all' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
              >
                <Globe size={16} className="mr-2" />
                All Users
              </button>
            </div>

            <div className="relative w-full sm:w-64">
              <input
                type="text"
                placeholder="Search by name or skill..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:border-brand-400 focus:ring-4 focus:ring-brand-50 shadow-sm transition-all outline-none"
              />
              <Search className="absolute left-3.5 top-3 text-slate-400" size={18} />
            </div>
          </div>
        </div>

        {error && (
          <div className="bg-rose-50 text-rose-600 p-4 rounded-xl text-sm border border-rose-100 flex items-center mb-8 animate-fade-in shadow-sm">
            <AlertCircle className="w-5 h-5 mr-2 flex-shrink-0" />
            {error}
          </div>
        )}

        {isLoading ? (
          <div className="flex justify-center items-center h-64 bg-white rounded-3xl border border-slate-200 shadow-sm">
            <Loader2 className="animate-spin h-10 w-10 text-brand-600" />
          </div>
        ) : (
          <>
            {listToShow.length === 0 && !error ? (
              <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-16 text-center animate-fade-in">
                <div className="w-20 h-20 bg-brand-50 rounded-full flex items-center justify-center mx-auto mb-6">
                  {activeTab === 'matches' ? <Sparkles className="h-10 w-10 text-brand-500" /> : <Globe className="h-10 w-10 text-brand-500" />}
                </div>
                <h3 className="text-2xl font-bold text-slate-900 mb-2">No {activeTab} yet</h3>
                <p className="text-slate-500 max-w-md mx-auto mb-8">
                  {activeTab === 'matches' 
                    ? "Update your profile with more skills you know and want to learn to find the perfect learning partner."
                    : "There are no other users on the platform right now."}
                </p>
                {activeTab === 'matches' && (
                  <Link to="/skills" className="inline-flex items-center justify-center px-6 py-3 bg-brand-600 hover:bg-brand-700 text-white font-semibold rounded-xl shadow-sm transition-colors group">
                    Update Skills
                    <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </Link>
                )}
              </div>
            ) : filteredUsers.length === 0 ? (
              <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-16 text-center animate-fade-in">
                <h3 className="text-xl font-bold text-slate-900 mb-2">No results found</h3>
                <p className="text-slate-500 max-w-md mx-auto">
                  Try adjusting your search query to find the user you are looking for.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {filteredUsers.map((user, i) => (
                  <div 
                    key={user.userId} 
                    className="bg-white rounded-3xl shadow-sm hover:shadow-lg transition-all duration-300 border border-slate-200 overflow-hidden flex flex-col group animate-slide-up"
                    style={{ animationDelay: `${i * 50}ms` }}
                  >
                    
                    <div className="p-6 border-b border-slate-100 relative overflow-hidden">
                      <div className="absolute top-0 right-0 -mr-8 -mt-8 w-24 h-24 bg-gradient-to-br from-brand-100 to-indigo-100 rounded-full opacity-50 group-hover:scale-150 transition-transform duration-500 ease-in-out"></div>
                      
                      <div className="flex items-start justify-between relative z-10">
                        <div className="flex items-center space-x-4">
                          <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-brand-500 to-indigo-600 flex items-center justify-center text-white text-xl font-bold shadow-md transform group-hover:-translate-y-1 transition-transform">
                            {getInitials(user.name)}
                          </div>
                          <div>
                            <h3 className="text-lg font-bold text-slate-900 line-clamp-1">{user.name}</h3>
                            <p className="text-sm text-slate-500 line-clamp-1">{user.email}</p>
                          </div>
                        </div>
                      </div>
                      
                      {user.matchScore > 0 && (
                        <div className="mt-4 inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-green-50 text-green-700 border border-green-200">
                          <Sparkles size={12} className="mr-1" />
                          {user.matchScore} Match
                        </div>
                      )}
                    </div>

                    <div className="p-6 flex-1 space-y-6">
                      <div>
                        <h4 className="text-xs font-bold text-brand-600 uppercase tracking-wider mb-3">They can teach you</h4>
                        <div className="flex flex-wrap gap-2">
                          {user.teachToOther && user.teachToOther.length > 0 ? (
                            user.teachToOther.map((skill, idx) => (
                              <span key={idx} className="inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-medium bg-brand-50 text-brand-700 border border-brand-100">
                                {skill}
                              </span>
                            ))
                          ) : (
                            <span className="text-sm text-slate-400 italic">None specified</span>
                          )}
                        </div>
                      </div>

                      <div>
                        <h4 className="text-xs font-bold text-purple-600 uppercase tracking-wider mb-3">They want to learn</h4>
                        <div className="flex flex-wrap gap-2">
                          {user.learnFromOther && user.learnFromOther.length > 0 ? (
                            user.learnFromOther.map((skill, idx) => (
                              <span key={idx} className="inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-medium bg-purple-50 text-purple-700 border border-purple-100">
                                {skill}
                              </span>
                            ))
                          ) : (
                            <span className="text-sm text-slate-400 italic">None specified</span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="p-4 bg-slate-50 border-t border-slate-100 mt-auto">
                      {getRelationshipStatus(user.userId).status === 'accepted' ? (
                        <Link 
                          to={`/chat?peer=${user.userId}`}
                          className="w-full flex justify-center items-center px-4 py-3 bg-white border border-slate-200 rounded-xl shadow-sm text-sm font-semibold text-slate-700 hover:text-brand-600 hover:border-brand-200 transition-all group-hover:bg-brand-50"
                        >
                          <MessageCircle className="w-4 h-4 mr-2" />
                          Message {user.name.split(' ')[0]}
                        </Link>
                      ) : getRelationshipStatus(user.userId).status === 'pending' && getRelationshipStatus(user.userId).role === 'sender' ? (
                        <button 
                          disabled
                          className="w-full flex justify-center items-center px-4 py-3 bg-slate-100 border border-slate-200 rounded-xl shadow-sm text-sm font-semibold text-slate-500 cursor-not-allowed"
                        >
                          Request Sent
                        </button>
                      ) : getRelationshipStatus(user.userId).status === 'pending' && getRelationshipStatus(user.userId).role === 'receiver' ? (
                        <Link 
                          to="/requests"
                          className="w-full flex justify-center items-center px-4 py-3 bg-brand-50 border border-brand-200 rounded-xl shadow-sm text-sm font-semibold text-brand-700 hover:bg-brand-100 transition-all"
                        >
                          Review Request
                        </Link>
                      ) : (
                        <button 
                          onClick={() => handleSendRequest(user.userId)}
                          className="w-full flex justify-center items-center px-4 py-3 bg-blue-600 border border-transparent rounded-xl shadow-sm text-sm font-semibold text-white hover:bg-blue-700 transition-all"
                        >
                          Connect
                        </button>
                      )}
                    </div>

                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Match;