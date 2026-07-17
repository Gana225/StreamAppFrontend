import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import api from '../api';
import VideoPlayer from '../components/VideoPlayer';

export default function SearchPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const query = searchParams.get('q') || '';
  
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hoveredVideoId, setHoveredVideoId] = useState(null);

  useEffect(() => {
    const fetchSearchResults = async () => {
      setLoading(true);
      try {
        const response = await api.get(`/videos/search/?q=${encodeURIComponent(query)}`);
        setVideos(response.data);
      } catch (err) {
        console.error('Search extraction network error:', err);
      } finally {
        setLoading(false);
      }
    };

    if (query) fetchSearchResults();
  }, [query]);

  // Format creation date into a cleaner readable format
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
  };

  // Helper to convert float duration into a clean standard clock time
  const formatDuration = (secs) => {
    if (isNaN(secs) || secs === 0) return '0:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  if (loading) return <div className="text-center text-zinc-400 mt-20">Searching index pipelines...</div>;
  if (videos.length === 0) return <div className="text-center text-zinc-400 mt-20">No videos found matching "{query}"</div>;

  return (
    <div className="p-4 w-full">
      <h2 className="text-lg font-bold text-zinc-400 mb-6">
        Search Results for: <span className="text-white">"{query}"</span>
      </h2>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-4 gap-y-10 w-full">
        {videos.map((video) => (
          <article
            key={video.id}
            onClick={() => navigate(`/watch/${video.id}`, { state: { video } })}
            onMouseEnter={() => setHoveredVideoId(video.id)}
            onMouseLeave={() => setHoveredVideoId(null)}
            className="flex flex-col gap-3 group cursor-pointer w-full overflow-hidden"
          >
            {/* 1. VIDEO IMAGE CONTAINER / MINI FEED PLAYER */}
            <div className="relative aspect-video rounded-xl overflow-hidden border border-zinc-900 shadow-lg bg-zinc-900">
              {hoveredVideoId === video.id ? (
                <VideoPlayer src={video.hls_url} isFeedMode={true} autoPlayActive={true} />
              ) : (
                <>
                  <img src={video.thumbnail_url} alt={video.title} className="w-full h-full object-cover" />
                  {video.duration > 0 && (
                    <span className="absolute bottom-2 right-2 bg-black/80 px-1.5 py-0.5 text-[11px] font-mono font-medium rounded text-zinc-100 z-10">
                      {formatDuration(video.duration)}
                    </span>
                  )}
                </>
              )}
            </div>
            
            {/* 2. DYNAMIC PROFILE & VIDEO DETAILS METADATA */}
            <div className="flex gap-3 px-1">
              {/* Creator Avatar Block */}
              <div className="w-9 h-9 rounded-full overflow-hidden bg-zinc-800 shrink-0 border border-zinc-800">
                <img
                  src={video.avatar_url || '/default-avatar.png'}
                  alt="channel avatar"
                  className="w-full h-full object-cover"
                  onError={(e) => { e.target.src = '/default-avatar.png'; }}
                />
              </div>

              {/* Text Layout Stack */}
              <div className="flex flex-col flex-1 min-w-0">
                <h3 className="text-sm font-semibold text-zinc-100 line-clamp-2 leading-snug group-hover:text-red-500 transition-colors">
                  {video.title}
                </h3>
                
                <p className="text-xs text-zinc-400 mt-1 truncate hover:text-zinc-200">
                  {video.user || 'Channel Name'}
                </p>
                
                <p className="text-[11px] text-zinc-500 mt-0.5 truncate">
                  {video.views_count || 0} views &bull; {formatDate(video.created_at)}
                </p>
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}