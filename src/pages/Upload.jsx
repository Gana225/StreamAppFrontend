// src/pages/Upload.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import { useAuth } from '../context/AuthContext';
import { UploadCloud, Film, FileText, CheckCircle2, Loader2, Lock } from 'lucide-react';

export default function Upload() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [videoFile, setVideoFile] = useState(null);
  const [thumbnail, setThumbnail] = useState(null);
  const [thumbnailPreview, setThumbnailPreview] = useState(null);
  
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState('');
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith('video/')) {
      setVideoFile(file);
      setError('');
      if (!title) {
        setTitle(file.name.replace(/\.[^/.]+$/, ""));
      }
    } else {
      setError('Please select a valid video file (.mp4, .mkv, etc.)');
      setVideoFile(null);
    }
  };

  const handleThumbnailChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setError("Please select a valid image.");
      return;
    }
    setThumbnail(file);
    setThumbnailPreview(URL.createObjectURL(file));
    setError("");
  };

  const handleUploadSubmit = async (e) => {
    e.preventDefault();
    if (!videoFile) {
      setError('Please choose a video file to upload.');
      return;
    }

    setLoading(true);
    setError('');
    setProgress('Uploading file to server...');

    const formData = new FormData();
    if (thumbnail) {
      formData.append("thumbnail", thumbnail);
    }
    formData.append('title', title);
    formData.append('description', description);
    formData.append('raw_video', videoFile);

    try {
      await api.post('/videos/upload/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setSuccess(true);
      setProgress('');
      setTitle('');
      setDescription('');
      setVideoFile(null);
      setThumbnail(null);
      setThumbnailPreview(null);
    } catch (err) {
      setError(err.response?.data?.detail || 'Upload failed. Ensure backend server and storage limits match.');
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-[calc(100vh-3.5rem)] bg-zinc-950 text-white p-4 flex items-center justify-center select-none animate-fadeIn">
        <div className="w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-2xl p-8 text-center shadow-2xl flex flex-col items-center gap-4">
          <div className="bg-red-600/10 p-4 rounded-full text-red-500">
            <Lock className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold tracking-tight">Sign in to Upload Videos</h2>
          <p className="text-xs text-zinc-400 max-w-xs leading-relaxed">
            Please log in to your StreamFlux creator account to publish video content and customize creation settings.
          </p>
          <button
            onClick={() => navigate('/auth')}
            className="w-full mt-2 bg-red-600 hover:bg-red-700 text-white font-semibold text-sm rounded-xl py-2.5 transition-colors shadow-lg shadow-red-600/10 active:scale-98"
          >
            Sign In Now
          </button>
        </div>
      </div>
    );
  }


  return (
    <div className="min-h-[calc(100vh-3.5rem)] bg-zinc-950 text-white p-4 sm:p-6 lg:p-8 flex items-center justify-center">
      <div className="w-full max-w-4xl bg-zinc-900 border border-zinc-800 rounded-2xl p-6 sm:p-8 shadow-2xl grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Left Side */}
        <div className="flex flex-col gap-6">
          {/* Video Upload */}
          <div className="flex flex-col items-center justify-center border-2 border-dashed border-zinc-700 hover:border-zinc-500 rounded-xl p-6 bg-zinc-950/50 transition-colors relative min-h-[250px]">
            <input
              type="file"
              accept="video/*"
              onChange={handleFileChange}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
              disabled={loading || success}
            />
            <div className="flex flex-col items-center text-center gap-3">
              <div className="p-4 bg-zinc-900 rounded-full text-zinc-400">
                <UploadCloud className="w-10 h-10" />
              </div>
              {videoFile ? (
                <div className="z-20">
                  <p className="text-sm font-semibold text-emerald-400 flex items-center gap-1.5 justify-center">
                    <Film className="w-4 h-4" /> Selected Successfully
                  </p>
                  <p className="text-xs text-zinc-400 truncate max-w-[250px] mt-1">
                    {videoFile.name}
                  </p>
                </div>
              ) : (
                <div>
                  <p className="text-sm font-medium">Click or Drag & Drop Video File</p>
                  <p className="text-xs text-zinc-500 mt-1">Supports MP4, MOV, AVI formats</p>
                </div>
              )}
            </div>
          </div>

          {/* Thumbnail Upload */}
          <div className="border-2 border-dashed border-zinc-700 hover:border-zinc-500 rounded-xl p-4 bg-zinc-950/50 transition relative">
            <input
              type="file"
              accept="image/*"
              onChange={handleThumbnailChange}
              className="absolute inset-0 opacity-0 cursor-pointer"
              disabled={loading}
            />
            {thumbnailPreview ? (
              <div className="flex flex-col items-center gap-3">
                <img src={thumbnailPreview} alt="Thumbnail" className="w-full h-44 object-cover rounded-lg" />
                <p className="text-xs text-emerald-400">{thumbnail.name}</p>
              </div>
            ) : (
              <div className="flex flex-col items-center py-5">
                <UploadCloud className="w-8 h-8 text-zinc-500" />
                <p className="mt-2 text-sm">Upload Thumbnail</p>
                <p className="text-xs text-zinc-500">JPG • PNG • WEBP</p>
              </div>
            )}
          </div>
        </div>

        {/* Right Side: Form Inputs Metadata */}
        <form onSubmit={handleUploadSubmit} className="flex flex-col justify-between gap-5">
          <div className="flex flex-col gap-4">
            <h2 className="text-xl font-bold tracking-tight border-b border-zinc-800 pb-2">Video Metadata</h2>
            
            {error && <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-xs rounded-lg p-3">{error}</div>}
            {success && (
              <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs rounded-lg p-3 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" /> Video uploaded successfully! Processing started in background.
              </div>
            )}

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-zinc-400">Title</label>
              <div className="flex items-center bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2.5 focus-within:border-zinc-700">
                <FileText className="w-4 h-4 text-zinc-500 mr-2" />
                <input
                  type="text"
                  placeholder="Catchy video headline..."
                  required
                  className="w-full bg-transparent outline-none text-sm"
                  value={title}
                  onChange={(e) => { setTitle(e.target.value); setSuccess(false); }}
                  disabled={loading}
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-zinc-400">Description</label>
              <textarea
                rows="4"
                placeholder="Tell viewers what your video covers..."
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2.5 outline-none focus:border-zinc-700 text-sm resize-none"
                value={description}
                onChange={(e) => { setDescription(e.target.value); setSuccess(false); }}
                disabled={loading}
              />
            </div>
          </div>

          <div className="flex flex-col gap-2 mt-2">
            {loading && (
              <p className="text-xs text-zinc-400 flex items-center gap-2">
                <Loader2 className="w-3.5 h-3.5 animate-spin text-red-500" /> {progress}
              </p>
            )}
            <button
              type="submit"
              disabled={loading || !videoFile}
              className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold text-sm rounded-xl py-2.5 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Publish Video
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}