import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { User, Mail, Lock, Code, Sparkles, Loader2, ArrowRight } from 'lucide-react';

const Register = () => {
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    skillsKnown: '',
    skillsToLearn: ''
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      await axios.post('http://localhost:5000/api/auth/register', {
        ...form,
        skillsKnown: form.skillsKnown.split(',').map(s => s.trim()).filter(Boolean),
        skillsToLearn: form.skillsToLearn.split(',').map(s => s.trim()).filter(Boolean)
      }, {
        withCredentials: true
      });
      navigate('/login');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex bg-surface-50">
      
      {/* Left side - Form */}
      <div className="w-full xl:w-5/12 flex items-center justify-center p-8 sm:p-12 z-10 animate-fade-in bg-white shadow-soft">
        <div className="w-full max-w-md">
          <div className="mb-10">
            <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Create an Account</h2>
            <p className="mt-3 text-slate-500">Join the L² Platform and start sharing your knowledge.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Name Input */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5" htmlFor="name">Full Name</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  id="name" name="name" type="text" placeholder="John Doe"
                  className="block w-full pl-10 pr-4 py-3 bg-surface-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500/50 focus:border-brand-500 transition-all shadow-sm"
                  value={form.name} onChange={handleChange} required
                />
              </div>
            </div>

            {/* Email Input */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5" htmlFor="email">Email Address</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  id="email" name="email" type="email" placeholder="you@example.com"
                  className="block w-full pl-10 pr-4 py-3 bg-surface-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500/50 focus:border-brand-500 transition-all shadow-sm"
                  value={form.email} onChange={handleChange} required
                />
              </div>
            </div>

            {/* Password Input */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5" htmlFor="password">Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  id="password" name="password" type="password" placeholder="••••••••" minLength="6"
                  className="block w-full pl-10 pr-4 py-3 bg-surface-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500/50 focus:border-brand-500 transition-all shadow-sm"
                  value={form.password} onChange={handleChange} required
                />
              </div>
            </div>

            {/* Skills Inputs */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 pt-2">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5" htmlFor="skillsKnown">Skills I Know</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Code className="h-4 w-4 text-slate-400" />
                  </div>
                  <input
                    id="skillsKnown" name="skillsKnown" type="text" placeholder="React, Node"
                    className="block w-full pl-9 pr-3 py-2.5 bg-surface-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500/50 focus:border-brand-500 transition-all text-sm"
                    value={form.skillsKnown} onChange={handleChange}
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5" htmlFor="skillsToLearn">Skills to Learn</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Sparkles className="h-4 w-4 text-slate-400" />
                  </div>
                  <input
                    id="skillsToLearn" name="skillsToLearn" type="text" placeholder="Python, Go"
                    className="block w-full pl-9 pr-3 py-2.5 bg-surface-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500/50 focus:border-brand-500 transition-all text-sm"
                    value={form.skillsToLearn} onChange={handleChange}
                  />
                </div>
              </div>
            </div>

            {error && (
              <div className="bg-rose-50 text-rose-600 p-4 rounded-xl text-sm border border-rose-100 flex items-center animate-fade-in">
                {error}
              </div>
            )}

            <button 
              type="submit" disabled={isLoading}
              className="w-full flex items-center justify-center py-3.5 px-4 mt-8 border border-transparent rounded-xl shadow-sm text-sm font-bold text-white bg-slate-900 hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-900 disabled:opacity-70 disabled:cursor-not-allowed transition-all hover:shadow-md group"
            >
              {isLoading ? <Loader2 className="animate-spin h-5 w-5 mr-2" /> : (
                <>
                  Create Account
                  <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>
          
          <div className="mt-8 text-center">
            <p className="text-slate-600 text-sm">
              Already have an account?{' '}
              <Link to="/login" className="font-semibold text-brand-600 hover:text-brand-500 transition-colors">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>

      {/* Right side - Visual/Branding */}
      <div className="hidden xl:flex xl:w-7/12 relative overflow-hidden bg-brand-50 justify-center items-center p-12">
        <div className="absolute top-0 right-0 -mr-24 -mt-24 w-96 h-96 bg-brand-200 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob"></div>
        <div className="absolute bottom-0 left-0 -ml-24 -mb-24 w-96 h-96 bg-indigo-200 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob animation-delay-2000"></div>
        
        <div className="relative z-10 max-w-2xl text-center">
          <div className="bg-white/60 backdrop-blur-xl border border-white/80 p-10 rounded-3xl shadow-glass animate-slide-up">
            <h3 className="text-3xl font-display font-bold text-slate-800 mb-4">Empower Your Growth</h3>
            <p className="text-slate-600 text-lg leading-relaxed mb-8">
              Join thousands of learners exchanging skills every day. Whether you're a seasoned developer wanting to learn design, or a designer wanting to learn code—there's a match for everyone.
            </p>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex items-center space-x-3">
                <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold">1</div>
                <div className="text-left"><p className="text-sm font-semibold text-slate-900">List your skills</p><p className="text-xs text-slate-500">What you can teach</p></div>
              </div>
              <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex items-center space-x-3">
                <div className="w-10 h-10 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center font-bold">2</div>
                <div className="text-left"><p className="text-sm font-semibold text-slate-900">Find matches</p><p className="text-xs text-slate-500">Who wants to learn</p></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;