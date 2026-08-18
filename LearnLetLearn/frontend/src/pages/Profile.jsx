import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { LogOut, User as UserIcon, Mail, Briefcase, Award, Sparkles, Edit3, Loader2, Save, X } from 'lucide-react';

const Profile = () => {
  const [profile, setProfile] = useState(null);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  const [editForm, setEditForm] = useState({
    name: '',
    skillsKnown: '',
    skillsToLearn: ''
  });

  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setIsLoading(true);
        const token = localStorage.getItem('token');
        const res = await axios.get('http://localhost:5000/api/auth/profile', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        setProfile(res.data);
      } catch (err) {
        setError('Failed to load profile data. Please try logging in again.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleEditToggle = () => {
    if (!isEditing && profile) {
      setEditForm({
        name: profile.name || '',
        skillsKnown: profile.skillsKnown?.join(', ') || '',
        skillsToLearn: profile.skillsToLearn?.join(', ') || ''
      });
    }
    setIsEditing(!isEditing);
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      const token = localStorage.getItem('token');
      
      const payload = {
        name: editForm.name,
        skillsKnown: editForm.skillsKnown.split(',').map(s => s.trim()).filter(s => s),
        skillsToLearn: editForm.skillsToLearn.split(',').map(s => s.trim()).filter(s => s)
      };

      const res = await axios.put('http://localhost:5000/api/auth/profile', payload, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setProfile(res.data);
      setIsEditing(false);
    } catch (err) {
      console.error(err);
      alert('Failed to update profile.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  const getInitials = (name) => {
    if (!name) return '?';
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-surface-50 flex justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl w-full animate-fade-in">
        
        {/* Header */}
        <div className="mb-8 flex flex-col sm:flex-row sm:justify-between sm:items-end space-y-4 sm:space-y-0">
          <div>
            <h2 className="text-3xl font-display font-extrabold text-slate-900 tracking-tight">My Profile</h2>
            <p className="text-slate-500 mt-1">Manage your personal information and skills</p>
          </div>
          {profile && (
            <button 
              onClick={handleLogout}
              className="inline-flex items-center space-x-2 text-sm font-medium text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 px-4 py-2.5 rounded-xl transition-colors"
            >
              <LogOut size={16} />
              <span>Sign Out</span>
            </button>
          )}
        </div>

        {/* Error State */}
        {error && (
          <div className="bg-rose-50 text-rose-600 p-4 rounded-xl text-sm border border-rose-100 flex items-center mb-6">
            {error}
          </div>
        )}

        {/* Loading State */}
        {isLoading ? (
          <div className="flex justify-center items-center h-64 bg-white rounded-2xl shadow-sm border border-slate-200">
            <Loader2 className="animate-spin h-8 w-8 text-blue-600" />
          </div>
        ) : profile ? (
          
          /* Profile Card */
          <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
            
            {/* Cover Banner */}
            <div className="h-40 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 relative">
              <div className="absolute inset-0 bg-white/10 mix-blend-overlay">
                <svg className="absolute w-full h-full" xmlns="http://www.w3.org/2000/svg">
                  <defs>
                    <pattern id="grid-profile" width="40" height="40" patternUnits="userSpaceOnUse">
                      <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="1"/>
                    </pattern>
                  </defs>
                  <rect width="100%" height="100%" fill="url(#grid-profile)" />
                </svg>
              </div>
            </div>
            
            <div className="px-8 pb-8 relative">
              {/* Avatar & Basic Info */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end -mt-16 mb-8 space-y-4 sm:space-y-0">
                <div className="flex items-end space-x-5">
                  <div className="relative">
                    <div className="h-32 w-32 rounded-2xl bg-white p-1.5 shadow-md">
                      <div className="h-full w-full rounded-xl bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center text-4xl font-bold text-blue-600 border border-blue-50">
                        {getInitials(profile.name)}
                      </div>
                    </div>
                    <div className="absolute bottom-2 right-2 w-4 h-4 bg-green-500 border-2 border-white rounded-full shadow-sm"></div>
                  </div>
                  
                  <div className="pb-2">
                    {isEditing ? (
                      <input 
                        type="text"
                        value={editForm.name}
                        onChange={(e) => setEditForm({...editForm, name: e.target.value})}
                        className="text-2xl font-bold text-slate-900 border-b-2 border-blue-500 focus:outline-none bg-slate-50 px-2 py-1 rounded"
                      />
                    ) : (
                      <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
                        {profile.name}
                      </h1>
                    )}
                    <div className="flex items-center text-slate-500 mt-2 space-x-4 text-sm">
                      <span className="flex items-center"><Mail size={14} className="mr-1" /> {profile.email}</span>
                      <span className="flex items-center"><UserIcon size={14} className="mr-1" /> Member</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex space-x-2">
                  {isEditing ? (
                    <>
                      <button 
                        onClick={handleEditToggle}
                        className="flex items-center space-x-1 bg-white border border-slate-200 text-slate-500 hover:bg-slate-50 px-4 py-2 rounded-xl text-sm font-semibold transition-all"
                      >
                        <X size={16} />
                        <span>Cancel</span>
                      </button>
                      <button 
                        onClick={handleSave}
                        disabled={isSaving}
                        className="flex items-center space-x-1 bg-blue-600 border border-blue-600 text-white hover:bg-blue-700 px-4 py-2 rounded-xl text-sm font-semibold shadow-sm transition-all disabled:opacity-50"
                      >
                        {isSaving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                        <span>Save</span>
                      </button>
                    </>
                  ) : (
                    <button 
                      onClick={handleEditToggle}
                      className="flex items-center space-x-2 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 px-5 py-2.5 rounded-xl text-sm font-semibold shadow-sm transition-all hover:shadow"
                    >
                      <Edit3 size={16} />
                      <span>Edit Profile</span>
                    </button>
                  )}
                </div>
              </div>

              <div className="w-full h-px bg-slate-100 mb-8"></div>

              {/* Skills Section */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Skills Known */}
                <div className="bg-blue-50/50 rounded-2xl p-6 border border-blue-100">
                  <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4 flex items-center">
                    <div className="p-1.5 bg-blue-100 text-blue-600 rounded-lg mr-2">
                      <Award size={18} />
                    </div>
                    Skills I Can Teach
                  </h3>
                  
                  {isEditing ? (
                    <div>
                      <input 
                        type="text"
                        value={editForm.skillsKnown}
                        onChange={(e) => setEditForm({...editForm, skillsKnown: e.target.value})}
                        placeholder="React, Node.js, Python (comma separated)"
                        className="w-full px-4 py-2 text-sm border border-blue-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <p className="text-xs text-blue-500 mt-2">Separate skills with commas</p>
                    </div>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {profile.skillsKnown && profile.skillsKnown.length > 0 ? (
                        profile.skillsKnown.map((skill, idx) => (
                          <span key={idx} className="inline-flex items-center px-3 py-1.5 rounded-lg text-sm font-medium bg-white text-blue-700 border border-blue-200 shadow-sm">
                            {skill}
                          </span>
                        ))
                      ) : (
                        <p className="text-sm text-slate-500 italic">No skills added yet.</p>
                      )}
                    </div>
                  )}
                </div>

                {/* Skills To Learn */}
                <div className="bg-purple-50/50 rounded-2xl p-6 border border-purple-100">
                  <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4 flex items-center">
                    <div className="p-1.5 bg-purple-100 text-purple-600 rounded-lg mr-2">
                      <Sparkles size={18} />
                    </div>
                    Skills I Want to Learn
                  </h3>
                  
                  {isEditing ? (
                    <div>
                      <input 
                        type="text"
                        value={editForm.skillsToLearn}
                        onChange={(e) => setEditForm({...editForm, skillsToLearn: e.target.value})}
                        placeholder="Machine Learning, UI/UX (comma separated)"
                        className="w-full px-4 py-2 text-sm border border-purple-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                      />
                      <p className="text-xs text-purple-500 mt-2">Separate skills with commas</p>
                    </div>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {profile.skillsToLearn && profile.skillsToLearn.length > 0 ? (
                        profile.skillsToLearn.map((skill, idx) => (
                          <span key={idx} className="inline-flex items-center px-3 py-1.5 rounded-lg text-sm font-medium bg-white text-purple-700 border border-purple-200 shadow-sm">
                            {skill}
                          </span>
                        ))
                      ) : (
                        <p className="text-sm text-slate-500 italic">No skills requested yet.</p>
                      )}
                    </div>
                  )}
                </div>

              </div>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default Profile;