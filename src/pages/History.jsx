import React, { useState, useEffect } from 'react';
import api from '../api';
import VideoPlayer from '../components/VideoPlayer';
import { useNavigate } from 'react-router-dom';
import { Trash2 } from 'lucide-react';

export default function History() {
  const navigate = useNavigate();
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hoveredVideoId, setHoveredVideoId] = useState(null);

  const fetchHistory = () => {
    api.get('/videos/history/')
      .then(res => { setVideos(res.data); setLoading(false); })
      .catch(err => { console.error(err); setLoading(false); });
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const clearHistory = async () => {
    if (window.confirm("Are you sure you want to clear your entire watch history?")) {
      try {
        await api.delete('/videos/history/clear_all/');
        setVideos([]);
      } catch (err) {
        console.error(err);
      }
    }
  };

  if (loading) return <div className="text-center text-zinc-400 mt-20">Loading History Context...</div>;

  return (
    <div className="p-4 w-full">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-zinc-100">Watch History</h2>
        {videos.length > 0 && (
          <button 
            onClick={clearHistory}
            className="flex items-center gap-2 text-xs font-semibold text-red-400 hover:text-red-500 bg-red-950/20 hover:bg-red-950/40 border border-red-900/50 px-3 py-1.5 rounded-xl transition-all"
          >
            <Trash2 className="w-3.5 h-3.5" /> Clear History
          </button>
        )}
      </div>

      {videos.length === 0 ? (
        <div className="text-center text-zinc-500 mt-20">No videos inside your watch history database logs yet.</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-4 gap-y-10 w-full">
          {videos.map((video) => (
            <article
              key={video.id}
              onClick={() => navigate(`/watch/${video.id}`, { state: { video } })}
              onMouseEnter={() => setHoveredVideoId(video.id)}
              onMouseLeave={() => setHoveredVideoId(null)}
              className="flex flex-col gap-3 group cursor-pointer w-full overflow-hidden"
            >
              <div className="relative aspect-video rounded-xl overflow-hidden border border-zinc-900 bg-zinc-900">
                {hoveredVideoId === video.id ? (
                  <VideoPlayer src={video.hls_url} isFeedMode={true} autoPlayActive={true} />
                ) : (
                  <img src={video.thumbnail_url} alt={video.title} className="w-full h-full object-cover" />
                )}
              </div>
              <div className="flex gap-3 px-1">
                <div className="w-9 h-9 rounded-full overflow-hidden bg-zinc-800 shrink-0">
                  <img src={video.avatar_url || '/default-avatar.png'} alt="avatar" className="w-full h-full object-cover" />
                </div>
                <div className="flex flex-col flex-1 min-w-0">
                  <h3 className="text-sm font-semibold text-zinc-100 truncate group-hover:text-red-500">{video.title}</h3>
                  <p className="text-xs text-zinc-400 mt-0.5">{video.user}</p>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}