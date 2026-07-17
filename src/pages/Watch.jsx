import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import VideoPlayer from '../components/VideoPlayer';
import api from '../api';

export default function Watch() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [video, setVideo] = useState(location.state?.video || null);
  const [loading, setLoading] = useState(!video);
  
  // Separate refs to handle StrictMode double execution guards cleanly
  const historyLogged = useRef(false);
  const viewCounted = useRef(false);

  // 1. Fetch video data if missing
  useEffect(() => {
    if (!video) {
      api.get(`/videos/${id}/`)
        .then(res => {
          setVideo(res.data);
          setLoading(false);
        })
        .catch(err => console.error(err));
    }
  }, [id, video]);

  // 2. 🔥 INSTANT HOOK: Logs to History Viewport immediately upon entry
  useEffect(() => {
    if (id && !historyLogged.current) {
      historyLogged.current = true;
      api.post(`/videos/${id}/log_history/`)
        .catch(err => console.error("History logging error:", err));
    }
  }, [id]);

  // 3. ⏳ DELAYED HOOK: Increments overall view counter after 10 seconds of intent
  useEffect(() => {
    if (id && !viewCounted.current) {
      const timer = setTimeout(() => {
        viewCounted.current = true;
        api.post(`/videos/${id}/view/`)
          .then(res => {
            if (res.data?.views_count !== undefined) {
              setVideo(prev => prev ? { ...prev, views_count: res.data.views_count } : null);
            }
          })
          .catch(err => console.error("Delayed metric counter error:", err));
      }, 10000); // 10 seconds threshold

      return () => clearTimeout(timer); // Cancel metric if they leave early
    }
  }, [id]);

  if (loading) return <div className="text-center pt-20 text-zinc-400">Loading Video Stream...</div>;
  if (!video) return <div className="text-center pt-20 text-zinc-400">Video not found.</div>;

  return (
    <div className="flex flex-col gap-4 mt-4 w-full">
      <button
        onClick={() => navigate('/')}
        className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors text-sm w-fit"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Home Feed
      </button>

      <VideoPlayer src={video.hls_url} isFeedMode={false} />

      <div className="mt-2">
        <h1 className="text-xl font-bold text-zinc-100">{video.title}</h1>
        
        <div className="flex items-center gap-3 mt-3 border-t border-zinc-900 pt-3">
          <div className="w-10 h-10 rounded-full overflow-hidden bg-zinc-800 shrink-0 border border-zinc-700">
            <img
              src={video.avatar_url}
              alt="avatar"
              className="w-full h-full object-cover"
              onError={(e) => { e.target.src = '/default-avatar.png'; }}
            />
          </div>
          <div>
            <p className="font-semibold text-zinc-200">{video.user || 'Channel Name'}</p>
            <p className="text-xs text-zinc-500">{video.views_count || 0} views &bull; Realtime Stream</p>
          </div>
        </div>

        {video.description && (
          <div className="mt-4 p-3 bg-zinc-900/60 border border-zinc-900 rounded-xl text-sm text-zinc-300 leading-relaxed whitespace-pre-line">
            <div className="font-semibold text-zinc-200 text-xs uppercase tracking-wider mb-1">Description</div>
            {video.description}
          </div>
        )}
      </div>
    </div>
  );
}