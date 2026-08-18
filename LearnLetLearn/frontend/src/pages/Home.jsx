import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { MessageSquare, Heart, Share2, Clock, User as UserIcon, Send } from 'lucide-react';

const Home = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentUserId, setCurrentUserId] = useState(null);
  
  const [replyStates, setReplyStates] = useState({});

  useEffect(() => {
    const initData = async () => {
      try {
        const token = localStorage.getItem('token');
        if (token) {
          const profileRes = await axios.get('http://localhost:5000/api/auth/profile', {
            headers: { Authorization: `Bearer ${token}` }
          });
          setCurrentUserId(profileRes.data._id);
        }

        const res = await axios.get('http://localhost:5000/api/post');
        setPosts(res.data);
      } catch (err) {
        setError('Failed to load posts. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    initData();
  }, []);

  const formatDate = (dateString) => {
    const options = { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const handleLike = async (postId) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return alert('Please login to like posts');

      const res = await axios.post(`http://localhost:5000/api/post/${postId}/like`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setPosts(posts.map(post => 
        post._id === postId ? { ...post, likes: res.data.likes } : post
      ));
    } catch (err) {
      console.error('Like failed', err);
    }
  };

  const toggleReplySection = (postId) => {
    setReplyStates(prev => ({
      ...prev,
      [postId]: {
        ...prev[postId],
        isOpen: !prev[postId]?.isOpen,
        text: prev[postId]?.text || ''
      }
    }));
  };

  const handleReplyChange = (postId, text) => {
    setReplyStates(prev => ({
      ...prev,
      [postId]: { ...prev[postId], text }
    }));
  };

  const submitReply = async (postId) => {
    const text = replyStates[postId]?.text;
    if (!text?.trim()) return;

    try {
      const token = localStorage.getItem('token');
      if (!token) return alert('Please login to reply');

      const res = await axios.post(`http://localhost:5000/api/post/${postId}/reply`, { text }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setPosts(posts.map(post => post._id === postId ? res.data : post));
      
      setReplyStates(prev => ({
        ...prev,
        [postId]: { ...prev[postId], text: '' }
      }));
    } catch (err) {
      console.error('Reply failed', err);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-12">
      <div className="bg-white border-b border-slate-200 pt-16 pb-12 px-4 sm:px-6 lg:px-8 mb-8 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none opacity-40">
          <div className="absolute -top-24 -right-24 w-96 h-96 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob"></div>
          <div className="absolute top-12 -left-24 w-72 h-72 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-2000"></div>
        </div>
        
        <div className="max-w-3xl mx-auto text-center relative z-10 animate-slide-up">
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-slate-900 mb-4">
            Discover & Share <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">Knowledge</span>
          </h1>
          <p className="text-lg text-slate-600 mb-8 max-w-2xl mx-auto">
            Join the community of learners. Post what you're learning, ask questions, and connect with people who can help you grow.
          </p>
          <button className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-full shadow-md hover:shadow-lg transition-all transform hover:-translate-y-1">
            Create a Post
          </button>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-slate-800">Recent Posts</h2>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm border border-red-100 mb-6 shadow-sm">
            {error}
          </div>
        )}

        {loading && (
          <div className="space-y-6">
            {[1, 2, 3].map(n => (
              <div key={n} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm animate-pulse flex flex-col space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-slate-200 rounded-full"></div>
                  <div className="space-y-2">
                    <div className="h-3 bg-slate-200 rounded w-24"></div>
                    <div className="h-2 bg-slate-200 rounded w-16"></div>
                  </div>
                </div>
                <div className="h-5 bg-slate-200 rounded w-3/4"></div>
              </div>
            ))}
          </div>
        )}

        {!loading && posts.length === 0 && !error && (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-12 text-center">
            <MessageSquare className="mx-auto h-12 w-12 text-slate-300 mb-4" />
            <h3 className="text-lg font-medium text-slate-900">No posts yet</h3>
          </div>
        )}

        <div className="space-y-6">
          {posts.map((post, i) => {
            const isLiked = post.likes?.includes(currentUserId);
            const likeCount = post.likes?.length || 0;
            const replyCount = post.replies?.length || 0;
            const replyState = replyStates[post._id] || { isOpen: false, text: '' };

            return (
              <div 
                key={post._id} 
                className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition-shadow duration-300 animate-slide-up"
                style={{ animationDelay: `${i * 50}ms` }}
              >
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-100 to-indigo-100 text-blue-600 rounded-full flex items-center justify-center font-bold">
                    {post.author?.name ? post.author.name.charAt(0).toUpperCase() : <UserIcon size={20} />}
                  </div>
                  <div>
                    <div className="font-semibold text-slate-900 text-sm">
                      {post.author?.name || 'Anonymous Learner'}
                    </div>
                    <div className="flex items-center text-xs text-slate-500 mt-0.5">
                      <Clock size={12} className="mr-1" />
                      {formatDate(post.createdAt)}
                    </div>
                  </div>
                </div>

                <h3 className="text-xl font-bold text-slate-900 mb-2 leading-snug">
                  {post.title}
                </h3>
                <p className="text-slate-600 leading-relaxed mb-6 whitespace-pre-wrap">
                  {post.content}
                </p>

                <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                  <div className="flex space-x-6">
                    <button 
                      onClick={() => handleLike(post._id)}
                      className={`flex items-center space-x-1.5 transition-colors group ${isLiked ? 'text-rose-500' : 'text-slate-500 hover:text-rose-500'}`}
                    >
                      <div className={`p-1.5 rounded-full transition-colors ${isLiked ? 'bg-rose-50' : 'group-hover:bg-rose-50'}`}>
                        <Heart size={18} fill={isLiked ? 'currentColor' : 'none'} />
                      </div>
                      <span className="text-sm font-medium">{likeCount} {likeCount === 1 ? 'Like' : 'Likes'}</span>
                    </button>
                    
                    <button 
                      onClick={() => toggleReplySection(post._id)}
                      className="flex items-center space-x-1.5 text-slate-500 hover:text-blue-600 transition-colors group"
                    >
                      <div className="p-1.5 rounded-full group-hover:bg-blue-50 transition-colors">
                        <MessageSquare size={18} />
                      </div>
                      <span className="text-sm font-medium">{replyCount} {replyCount === 1 ? 'Reply' : 'Replies'}</span>
                    </button>
                  </div>
                  <button className="flex items-center space-x-1 text-slate-400 hover:text-slate-600 transition-colors p-1.5 rounded-full hover:bg-slate-100">
                    <Share2 size={18} />
                  </button>
                </div>

                {replyState.isOpen && (
                  <div className="mt-4 pt-4 border-t border-slate-100 animate-fade-in">
                    {post.replies && post.replies.length > 0 && (
                      <div className="space-y-4 mb-4">
                        {post.replies.map((reply, rIdx) => (
                          <div key={rIdx} className="flex space-x-3">
                            <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-slate-600 font-bold text-xs flex-shrink-0">
                              {reply.user?.name?.charAt(0).toUpperCase() || '?'}
                            </div>
                            <div className="bg-slate-50 rounded-2xl p-3 px-4 flex-1">
                              <div className="flex justify-between items-baseline mb-1">
                                <span className="text-sm font-semibold text-slate-900">{reply.user?.name || 'Unknown'}</span>
                                <span className="text-[10px] text-slate-500">{formatDate(reply.createdAt)}</span>
                              </div>
                              <p className="text-sm text-slate-700">{reply.text}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                    
                    <div className="flex items-center space-x-3 mt-4">
                      <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-xs flex-shrink-0">
                        Me
                      </div>
                      <div className="flex-1 relative">
                        <input 
                          type="text" 
                          placeholder="Write a reply..." 
                          className="w-full bg-slate-100 border-none rounded-full px-4 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none pr-10"
                          value={replyState.text}
                          onChange={(e) => handleReplyChange(post._id, e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') submitReply(post._id);
                          }}
                        />
                        <button 
                          onClick={() => submitReply(post._id)}
                          disabled={!replyState.text.trim()}
                          className="absolute right-1 top-1 p-1.5 text-blue-600 hover:bg-blue-100 rounded-full disabled:opacity-50 transition-colors"
                        >
                          <Send size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Home;
