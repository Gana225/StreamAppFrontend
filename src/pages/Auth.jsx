import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api';
import { LogIn, UserPlus, Lock, Mail, User } from 'lucide-react';

export default function Auth() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({ username: '', email: '', password: '', avatar: null });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isLogin) {
        const response = await api.post('/auth/login/', {
          email: formData.email,
          password: formData.password
        });
        
        // Pass the token and user data payload to context state
        login(response.data.access, response.data.user);
        navigate('/');
      } else {
        const registerData = new FormData();
        registerData.append("username", formData.username);
        registerData.append("email", formData.email);
        registerData.append("password", formData.password);
        if (formData.avatar) {
          registerData.append("avatar", formData.avatar);
        }

        await api.post("/auth/register/", registerData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        setIsLogin(true);
        alert('Registration successful! Please sign in.');
      }
    } catch (err) {
      setError(err.response?.data?.detail || 'An error occurred. Check your inputs.');
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setError("Please select a valid image.");
      return;
    }
    setFormData({ ...formData, avatar: file });
    setAvatarPreview(URL.createObjectURL(file));
  };

  return (
    <div className="min-h-[calc(100vh-3.5rem)] flex items-center justify-center px-4 bg-zinc-950">
      <div className="w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-2xl p-6 sm:p-8 shadow-2xl">
        <div className="flex flex-col items-center gap-2 mb-6 text-center">
          <div className="bg-red-600/10 p-3 rounded-full text-red-500">
            {isLogin ? <LogIn className="w-6 h-6" /> : <UserPlus className="w-6 h-6" />}
          </div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight">
            {isLogin ? 'Sign in to StreamFlux' : 'Create an account'}
          </h2>
          <p className="text-xs text-zinc-400">Stream smoothly without interruptions</p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-xs rounded-lg p-3 mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {!isLogin && (
            <div className="flex items-center bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2.5 focus-within:border-zinc-700">
              <User className="w-4 h-4 text-zinc-500 mr-2 shrink-0" />
              <input
                type="text"
                placeholder="Username"
                required
                className="w-full bg-transparent outline-none text-sm text-white"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              />
            </div>
          )}

          {!isLogin && (
            <div className="flex flex-col gap-3">
              <label className="text-xs font-semibold text-zinc-400">Profile Picture</label>
              <div className="relative border-2 border-dashed border-zinc-700 hover:border-zinc-500 rounded-xl p-4 transition">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarChange}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                />
                {avatarPreview ? (
                  <div className="flex flex-col items-center gap-3">
                    <img src={avatarPreview} alt="Avatar Preview" className="w-24 h-24 rounded-full object-cover border-2 border-zinc-700" />
                    <p className="text-xs text-emerald-400">{formData.avatar?.name}</p>
                  </div>
                ) : (
                  <div className="flex flex-col items-center py-4">
                    <User className="w-10 h-10 text-zinc-500" />
                    <p className="text-sm mt-2">Upload Profile Picture</p>
                    <p className="text-xs text-zinc-500">JPG • PNG • WEBP</p>
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="flex items-center bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2.5 focus-within:border-zinc-700">
            <Mail className="w-4 h-4 text-zinc-500 mr-2 shrink-0" />
            <input
              type="email"
              placeholder="Email address"
              required
              className="w-full bg-transparent outline-none text-sm text-white"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
          </div>

          <div className="flex items-center bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2.5 focus-within:border-zinc-700">
            <Lock className="w-4 h-4 text-zinc-500 mr-2 shrink-0" />
            <input
              type="password"
              placeholder="Password"
              required
              className="w-full bg-transparent outline-none text-sm text-white"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-white text-black font-semibold text-sm rounded-xl py-2.5 hover:bg-zinc-200 transition-colors disabled:opacity-50 mt-2"
          >
            {loading ? 'Processing...' : isLogin ? 'Sign In' : 'Sign Up'}
          </button>
        </form>

        <div className="text-center mt-6">
          <button
            onClick={() => { setIsLogin(!isLogin); setError(''); }}
            className="text-xs text-zinc-400 hover:text-white transition-colors underline underline-offset-4"
          >
            {isLogin ? "Don't have an account? Sign up" : 'Already have an account? Sign in'}
          </button>
        </div>
      </div>
    </div>
  );
}