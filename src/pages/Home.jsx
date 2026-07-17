import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import VideoPlayer from '../components/VideoPlayer';

// Mock array configuration for tags (Adjust or import as needed)
const CATEGORIES = ['All', 'Gaming', 'Music', 'Tech', 'Live'];

export default function Home() {
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState('All');
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hoveredVideoId, setHoveredVideoId] = useState(null);

  useEffect(() => {
    fetchVideos();
  }, []);

  const fetchVideos = async () => {
    try {
      const response = await api.get('/videos/feed/');
      setVideos(response.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (seconds) => {
    if (!seconds) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96 text-zinc-400">
        Loading videos...
      </div>
    );
  }

  return (
    <>
      {/* Category Selection Filter Line */}
      <div className="flex gap-3 overflow-x-auto pt-4 pb-3 sticky top-14 bg-zinc-950/90 backdrop-blur-md z-20 mb-4 no-scrollbar">
        {CATEGORIES.map((chip) => (
          <button
            key={chip}
            onClick={() => setActiveCategory(chip)}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all border border-transparent
              ${activeCategory === chip ? 'bg-zinc-100 text-zinc-950' : 'bg-zinc-900 text-zinc-300 hover:bg-zinc-800'}`}
          >
            {chip}
          </button>
        ))}
      </div>

      {/* Clean Grid Feed Block */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-4 gap-y-10 mt-2 w-full">
        {videos.map((video) => (
          <article
            key={video.id}
            onClick={() => navigate(`/watch/${video.id}`, { state: { video } })}
            onMouseEnter={() => setHoveredVideoId(video.id)}
            onMouseLeave={() => setHoveredVideoId(null)}
            className="flex flex-col gap-3 group cursor-pointer w-full overflow-hidden"
          >
            <div className="relative aspect-video rounded-xl overflow-hidden border border-zinc-900 shadow-lg bg-zinc-900">
              {hoveredVideoId === video.id ? (
                <VideoPlayer src={video.hls_url} isFeedMode={true} autoPlayActive={true} />
              ) : (
                <img src={video.thumbnail_url} alt={video.title} className="w-full h-full object-cover" />
              )}

              <div className="absolute bottom-2 right-2 z-20 pointer-events-none">
                <div className="bg-black/80 text-white text-[10px] font-bold px-1.5 py-0.5 rounded">
                  {formatTime(video.duration)}
                </div>
              </div>
            </div>

            <div className="flex gap-3 px-0.5 w-full">
              <div className="w-9 h-9 rounded-full overflow-hidden bg-zinc-800 shrink-0 border border-zinc-700">
                <img
                  src={video.avatar_url}
                  alt="avatar"
                  className="w-full h-full object-cover"
                  onError={(e) => { e.target.src = '/default-avatar.png'; }}
                />
              </div>
              <div className="flex flex-col flex-1 min-w-0">
                <h3 className="text-sm font-semibold text-zinc-100 line-clamp-2 leading-snug group-hover:text-red-500 transition-colors">
                  {video.title}
                </h3>
                <div className="text-xs text-zinc-400 mt-1">
                  <p className="truncate">{video.user || 'Unknown Creator'}</p>
                  <p className="text-zinc-500 truncate">
                    {video.views_count} views &bull; {new Date(video.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>
          </article>
        ))}
      </div>
    </>
  );
}