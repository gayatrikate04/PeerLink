import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { BookOpen, Sparkles, AlertCircle, CheckCircle2, Loader2, Save } from 'lucide-react';

const Skills = () => {
  const [skillsKnown, setSkillsKnown] = useState('');
  const [skillsToLearn, setSkillsToLearn] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const [isFetching, setIsFetching] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const fetchSkills = async () => {
      try {
        setIsFetching(true);
        const res = await axios.get('http://localhost:5000/api/skills/', {
          withCredentials: true
        });
        setSkillsKnown(res.data?.skillsKnown?.join(', ') || '');
        setSkillsToLearn(res.data?.skillsToLearn?.join(', ') || '');
      } catch (err) {
        setError('Failed to load your skills. Please refresh the page.');
      } finally {
        setIsFetching(false);
      }
    };
    fetchSkills();
  }, []);

  const handleSubmit = async e => {
    e.preventDefault();
    try {
      setIsSaving(true);
      setError('');
      setSuccess('');

      await axios.put('http://localhost:5000/api/skills/', {
        skillsKnown: skillsKnown.split(',').map(s => s.trim()).filter(Boolean),
        skillsToLearn: skillsToLearn.split(',').map(s => s.trim()).filter(Boolean)
      }, {
        withCredentials: true
      });
      
      setSuccess('Your skills have been updated successfully!');
      setTimeout(() => setSuccess(''), 3000);
      
    } catch (err) {
      setError('Failed to update skills. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-surface-50 py-12 px-4 sm:px-6 lg:px-8 flex justify-center">
      <div className="max-w-2xl w-full animate-fade-in">
        
        {/* Header */}
        <div className="mb-8 text-center sm:text-left">
          <h2 className="text-3xl font-display font-extrabold text-slate-900 tracking-tight">Manage Skills</h2>
          <p className="mt-2 text-slate-500">
            Update the skills you have to offer and the ones you want to learn to improve your matches.
          </p>
        </div>

        {/* Alerts */}
        {error && (
          <div className="bg-rose-50 text-rose-600 p-4 rounded-xl text-sm border border-rose-100 flex items-center mb-6 shadow-sm">
            <AlertCircle className="w-5 h-5 mr-2 flex-shrink-0" />
            {error}
          </div>
        )}
        
        {success && (
          <div className="bg-emerald-50 text-emerald-700 p-4 rounded-xl text-sm border border-emerald-200 flex items-center mb-6 shadow-sm">
            <CheckCircle2 className="w-5 h-5 mr-2 flex-shrink-0" />
            {success}
          </div>
        )}

        {/* Form Card */}
        <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
          {isFetching ? (
            <div className="flex justify-center items-center h-64">
              <Loader2 className="animate-spin h-8 w-8 text-brand-600" />
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="p-8 sm:p-10 space-y-8">
              
              {/* Skills Known */}
              <div>
                <label className="block text-sm font-bold text-slate-900 mb-3 flex items-center" htmlFor="skillsKnown">
                  <div className="p-1.5 bg-brand-100 text-brand-600 rounded-lg mr-2">
                    <BookOpen size={18} />
                  </div>
                  Skills I Can Teach
                </label>
                <textarea
                  id="skillsKnown"
                  rows="3"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500/50 focus:border-brand-500 transition-all bg-surface-50 focus:bg-white resize-none placeholder-slate-400"
                  placeholder="e.g., React, Node.js, Graphic Design, Public Speaking"
                  value={skillsKnown}
                  onChange={e => setSkillsKnown(e.target.value)}
                />
                <p className="text-xs text-slate-500 mt-2 font-medium">Please separate multiple skills with commas.</p>
              </div>

              <div className="w-full h-px bg-slate-100"></div>

              {/* Skills to Learn */}
              <div>
                <label className="block text-sm font-bold text-slate-900 mb-3 flex items-center" htmlFor="skillsToLearn">
                  <div className="p-1.5 bg-purple-100 text-purple-600 rounded-lg mr-2">
                    <Sparkles size={18} />
                  </div>
                  Skills I Want to Learn
                </label>
                <textarea
                  id="skillsToLearn"
                  rows="3"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 transition-all bg-surface-50 focus:bg-white resize-none placeholder-slate-400"
                  placeholder="e.g., Machine Learning, Spanish, SEO, Cooking"
                  value={skillsToLearn}
                  onChange={e => setSkillsToLearn(e.target.value)}
                />
                <p className="text-xs text-slate-500 mt-2 font-medium">Please separate multiple skills with commas.</p>
              </div>

              {/* Submit Action */}
              <div className="pt-6">
                <button 
                  type="submit" 
                  disabled={isSaving}
                  className="w-full flex items-center justify-center py-3.5 px-4 border border-transparent rounded-xl shadow-sm text-sm font-bold text-white bg-slate-900 hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-900 disabled:opacity-70 disabled:cursor-not-allowed transition-all hover:shadow-md"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="animate-spin -ml-1 mr-2 h-5 w-5" />
                      Saving Updates...
                    </>
                  ) : (
                    <>
                      <Save className="-ml-1 mr-2 h-5 w-5" />
                      Save Skills
                    </>
                  )}
                </button>
              </div>

            </form>
          )}
        </div>

      </div>
    </div>
  );
};

export default Skills;