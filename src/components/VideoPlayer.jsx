import React, { useEffect, useRef, useState } from 'react';
import Hls from 'hls.js';
import { 
  Play, Pause, Volume2, VolumeX, 
  Maximize, Minimize, Loader2, Settings,
  SkipForward, SkipBack, Check
} from 'lucide-react';

export default function VideoPlayer({ src, isFeedMode = true, autoPlayActive = false }) {
  const containerRef = useRef(null);
  const videoRef = useRef(null);
  const hlsRef = useRef(null); // Reference to update HLS state anywhere
  
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(isFeedMode); 
  const [volume, setVolume] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [progress, setProgress] = useState(0);
  const [bufferProgress, setBufferProgress] = useState(0);
  const [isBuffering, setIsBuffering] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [showSettings, setShowSettings] = useState(false);
  
  // Quality Selection States
  const [qualities, setQualities] = useState([]); // [{ index: 0, height: 720 }]
  const [currentQuality, setCurrentQuality] = useState(-1); // -1 signifies "Auto" track
  const [settingsTab, setSettingsTab] = useState('main'); // 'main' | 'speed' | 'quality'
  const [centerIcon, setCenterIcon] = useState(null); 

  // 1. Initialize HLS Stream
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    let hls;

    // FIX: Prioritize Hls.isSupported() over native check so hls.js controls the stream everywhere
    if (Hls.isSupported()) {
      hls = new Hls({ maxBufferLength: isFeedMode ? 5 : 20 });
      hlsRef.current = hls; // Assign to outer ref
      hls.loadSource(src);
      hls.attachMedia(video);
      
      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        setDuration(video.duration);
        
        // Extract available resolution variations from the manifest file
        const availableQualities = hls.levels.map((level, index) => ({
          index: index,
          height: level.height,
          name: level.height ? `${level.height}p` : `Track ${index + 1}`
        }));
        
        // Sort highest resolution to lowest resolution
        availableQualities.sort((a, b) => b.height - a.height);
        setQualities(availableQualities);
        setCurrentQuality(hls.currentLevel); // Will match default start level (usually auto/-1)
      });

      // Track whenever Auto-bitrate changes resolution naturally under the hood
      hls.on(Hls.Events.LEVEL_SWITCHED, (event, data) => {
        if (hls.loadLevel === -1) {
          setCurrentQuality(-1);
        }
      });
    } 
    // FALLBACK: Only use native video.src if hls.js is completely unsupported (like Safari on iPhones)
    else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = src;
    }

    return () => {
      if (hls) {
        hls.destroy();
        hlsRef.current = null;
      }
    };
  }, [src, isFeedMode]);

  // 2. Fix: Autoplay instantly when mounting in Watch Mode
  useEffect(() => {
    if (!isFeedMode && videoRef.current) {
      const timer = setTimeout(() => {
        videoRef.current.play()
          .then(() => setIsPlaying(true))
          .catch((err) => console.log("Autoplay blocked or interrupted:", err));
      }, 150);
      return () => clearTimeout(timer);
    }
  }, [isFeedMode, src]);

  // Handle feed-level hover adjustments
  useEffect(() => {
    if (!isFeedMode) return;
    
    if (autoPlayActive) {
      videoRef.current?.play().catch(() => {});
    } else {
      videoRef.current?.pause();
      if (videoRef.current) videoRef.current.currentTime = 0;
    }
  }, [autoPlayActive, isFeedMode]);

  // 3. Event Listeners Tracker
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleTimeUpdate = () => {
      setCurrentTime(video.currentTime);
      setProgress(video.duration ? (video.currentTime / video.duration) * 100 : 0);
      
      if (video.buffered.length > 0 && video.duration) {
        const bufferedEnd = video.buffered.end(video.buffered.length - 1);
        setBufferProgress((bufferedEnd / video.duration) * 100);
      }
    };

    const handleDurationChange = () => setDuration(video.duration);
    const handlePlayState = () => setIsPlaying(true);
    const handlePauseState = () => setIsPlaying(false);
    const handleWaiting = () => setIsBuffering(true);
    const handlePlaying = () => setIsBuffering(false);

    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('loadedmetadata', handleDurationChange);
    video.addEventListener('play', handlePlayState);
    video.addEventListener('pause', handlePauseState);
    video.addEventListener('waiting', handleWaiting);
    video.addEventListener('playing', handlePlaying);

    return () => {
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('loadedmetadata', handleDurationChange);
      video.removeEventListener('play', handlePlayState);
      video.removeEventListener('pause', handlePauseState);
      video.removeEventListener('waiting', handleWaiting);
      video.removeEventListener('playing', handlePlaying);
    };
  }, []);

  // Keyboard Shortcuts Control Panel (WATCH MODE ONLY)
  useEffect(() => {
    if (isFeedMode) return;

    const handleKeyDown = (e) => {
      if (document.activeElement.tagName === 'INPUT' || document.activeElement.tagName === 'TEXTAREA') return;

      const video = videoRef.current;
      if (!video) return;

      switch (e.key.toLowerCase()) {
        case ' ':
          e.preventDefault();
          togglePlay();
          break;
        case 'm':
          e.preventDefault();
          toggleMute();
          break;
        case 'f':
          e.preventDefault();
          handleFullscreen();
          break;
        case 'arrowleft':
          e.preventDefault();
          video.currentTime = Math.max(0, video.currentTime - 5);
          break;
        case 'arrowright':
          e.preventDefault();
          video.currentTime = Math.min(video.duration || 0, video.currentTime + 5);
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isFeedMode, duration, isMuted, volume]);

  useEffect(() => {
    const handleFullscreenChange = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  // Core Functional Handlers
  const togglePlay = (e) => {
    if (e) e.stopPropagation();
    if (!videoRef.current) return;

    if (videoRef.current.paused) {
      videoRef.current.play().catch(() => {});
      triggerCenterAnimation('play');
    } else {
      videoRef.current.pause();
      triggerCenterAnimation('pause');
    }
  };

  const triggerCenterAnimation = (type) => {
    setCenterIcon(type);
    setTimeout(() => {
      setCenterIcon(null);
    }, 500);
  };

  const toggleMute = (e) => {
    if (e) e.stopPropagation();
    const video = videoRef.current;
    if (!video) return;
    const nextMute = !video.muted;
    video.muted = nextMute;
    setIsMuted(nextMute);
    if (!nextMute && volume === 0) {
      video.volume = 0.5;
      setVolume(0.5);
    }
  };

  const handleSeek = (e) => {
    const video = videoRef.current;
    if (!video || !duration) return;
    const newPercentage = parseFloat(e.target.value);
    video.currentTime = (newPercentage / 100) * duration;
    setProgress(newPercentage);
  };

  const handleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen();
    }
  };

  // Change HLS track manually
  // Change HLS track manually
  const changeQuality = (levelIndex) => {
    if (hlsRef.current) {
      // 1. Force the active loading level to the target index
      hlsRef.current.currentLevel = levelIndex; 
      setCurrentQuality(levelIndex);
      setShowSettings(false);

      // 2. INSTANT SWITCH FIX: Force hls.js to drop buffered data if setting a manual lock
      if (levelIndex !== -1) {
        // Next level update handles stream config swaps instantly
        hlsRef.current.nextLevel = levelIndex; 
        
        // Clear out the video tag's internal look-ahead buffer memory entirely
        if (videoRef.current) {
          const currentTime = videoRef.current.currentTime;
          // Toggling a tiny micro-seek forces the browser to re-evaluate the source buffer pipeline
          videoRef.current.currentTime = currentTime; 
        }
      }
    }
  };

  const formatTime = (secs) => {
    if (isNaN(secs)) return '0:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  // Get current resolution name to display in main settings panel menu
  const getActiveQualityLabel = () => {
    if (currentQuality === -1) {
      if (hlsRef.current && hlsRef.current.currentLevel !== -1) {
        const activeLevel = hlsRef.current.levels[hlsRef.current.currentLevel];
        return `Auto (${activeLevel?.height}p)`;
      }
      return 'Auto';
    }
    const matched = qualities.find(q => q.index === currentQuality);
    return matched ? matched.name : 'Auto';
  };

  if (isFeedMode) {
    return (
      <div ref={containerRef} className="relative w-full h-full bg-zinc-950 overflow-hidden select-none group/mini">
        <video 
          ref={videoRef} 
          muted={isMuted}
          playsInline 
          className="w-full h-full object-cover pointer-events-none" 
        />
        <div className="absolute top-2 right-2 opacity-0 group-hover/mini:opacity-100 transition-opacity z-30">
          <button 
            onClick={toggleMute}
            className="p-1.5 rounded-full bg-black/70 hover:bg-black text-white border border-zinc-800 backdrop-blur-sm pointer-events-auto"
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div 
      ref={containerRef}
      className="relative w-full aspect-video bg-black rounded-xl overflow-hidden group select-none border border-zinc-900 shadow-2xl"
    >
      <div className="w-full h-full" onClick={togglePlay}>
        <video
          ref={videoRef}
          muted={isMuted}
          className="w-full h-full cursor-pointer object-contain"
          onDoubleClick={handleFullscreen}
          playsInline
        />
      </div>

      <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20">
        {isBuffering ? (
          <Loader2 className="w-14 h-14 animate-spin text-red-600 drop-shadow-lg" />
        ) : centerIcon ? (
          <div className="p-5 rounded-full bg-black/60 text-white animate-ping duration-300 backdrop-blur-sm">
            {centerIcon === 'play' ? <Play className="w-8 h-8 fill-current" /> : <Pause className="w-8 h-8 fill-current" />}
          </div>
        ) : null}
      </div>

      <div className="absolute bottom-0 left-0 right-0 p-4 pt-10 bg-gradient-to-t from-black via-black/80 to-transparent opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity duration-200 flex flex-col gap-3 z-10">
        
        <div className="flex items-center w-full relative group/slider">
          <input
            type="range" min="0" max="100" step="0.1"
            value={progress}
            onChange={handleSeek}
            className="w-full h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-red-600 outline-none transition-all"
            style={{
              background: `linear-gradient(to right, #dc2626 0%, #dc2626 ${progress}%, #52525b ${progress}%, #52525b ${bufferProgress}%, #27272a ${bufferProgress}%, #27272a 100%)`
            }}
          />
        </div>

        <div className="flex items-center justify-between w-full text-zinc-100">
          <div className="flex items-center gap-4">
            <button 
              onClick={(e) => { e.stopPropagation(); alert("Previous video hook triggered!"); }} 
              className="text-zinc-400 hover:text-white transition-colors"
              title="Previous Video"
            >
              <SkipBack className="w-4 h-4 fill-current" />
            </button>

            <button onClick={togglePlay} className="hover:text-red-500 transition-colors">
              {isPlaying ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current" />}
            </button>

            <button 
              onClick={(e) => { e.stopPropagation(); alert("Next video hook triggered!"); }} 
              className="text-zinc-400 hover:text-white transition-colors"
              title="Next Video"
            >
              <SkipForward className="w-4 h-4 fill-current" />
            </button>
            
            <div className="flex items-center gap-2 ml-2">
              <button onClick={toggleMute} className="hover:text-red-500 transition-colors">
                {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
              </button>
              <input 
                type="range" min="0" max="1" step="0.05"
                value={isMuted ? 0 : volume}
                onChange={(e) => {
                  const v = parseFloat(e.target.value);
                  setVolume(v);
                  if(videoRef.current) videoRef.current.volume = v;
                  setIsMuted(v === 0);
                }}
                className="w-16 h-1 bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-white"
              />
            </div>

            <div className="text-xs font-mono text-zinc-400 select-none">
              {formatTime(currentTime)} / {formatTime(duration)}
            </div>
          </div>

          <div className="flex items-center gap-4 relative">
            <button 
              onClick={(e) => { 
                e.stopPropagation(); 
                setShowSettings(!showSettings);
                setSettingsTab('main'); // reset on toggle open
              }} 
              className={`hover:text-red-500 transition-all ${showSettings ? 'text-red-500 rotate-45' : ''}`}
            >
              <Settings className="w-5 h-5" />
            </button>

            {/* NESTED SETTINGS ENGINE BOX POPUP */}
            {showSettings && (
              <div className="absolute bottom-10 right-0 bg-zinc-950 border border-zinc-800 p-2.5 rounded-xl flex flex-col gap-1 min-w-48 shadow-2xl z-50 text-xs text-zinc-200 backdrop-blur-md">
                
                {/* 1. ROOT DIALOG FRAME */}
                {settingsTab === 'main' && (
                  <>
                    <button 
                      onClick={(e) => { e.stopPropagation(); setSettingsTab('quality'); }}
                      className="flex justify-between items-center py-2 px-2 rounded hover:bg-zinc-900 text-left"
                    >
                      <span className="text-zinc-400 font-medium">Quality</span>
                      <span className="text-red-500 font-semibold">{getActiveQualityLabel()}</span>
                    </button>
                    <button 
                      onClick={(e) => { e.stopPropagation(); setSettingsTab('speed'); }}
                      className="flex justify-between items-center py-2 px-2 rounded hover:bg-zinc-900 text-left"
                    >
                      <span className="text-zinc-400 font-medium">Speed</span>
                      <span className="text-red-500 font-semibold">{playbackSpeed === 1 ? 'Normal' : `${playbackSpeed}x`}</span>
                    </button>
                  </>
                )}

                {/* 2. QUALITY SELECTOR PANEL */}
                {settingsTab === 'quality' && (
                  <div className="flex flex-col max-h-56 overflow-y-auto pr-1">
                    <div className="font-bold text-zinc-500 px-2 py-1 mb-1 border-b border-zinc-800">Select Resolution</div>
                    
                    {/* Auto Mode Button */}
                    <button
                      onClick={(e) => { e.stopPropagation(); changeQuality(-1); }}
                      className={`flex justify-between items-center py-2 px-2 rounded hover:bg-zinc-900 text-left ${currentQuality === -1 ? 'text-red-500 font-bold' : ''}`}
                    >
                      <span>Auto</span>
                      {currentQuality === -1 && <Check className="w-3.5 h-3.5" />}
                    </button>

                    {/* Extracted stream items parsed by HLS engine */}
                    {qualities.map((q) => (
                      <button
                        key={q.index}
                        onClick={(e) => { e.stopPropagation(); changeQuality(q.index); }}
                        className={`flex justify-between items-center py-2 px-2 rounded hover:bg-zinc-900 text-left ${currentQuality === q.index ? 'text-red-500 font-bold' : ''}`}
                      >
                        <span>{q.name}</span>
                        {currentQuality === q.index && <Check className="w-3.5 h-3.5" />}
                      </button>
                    ))}
                  </div>
                )}

                {/* 3. PLAYBACK SPEED SELECTOR PANEL */}
                {settingsTab === 'speed' && (
                  <div className="flex flex-col">
                    <div className="font-bold text-zinc-500 px-2 py-1 mb-1 border-b border-zinc-800">Playback Speed</div>
                    {[0.5, 1, 1.5, 2].map((speed) => (
                      <button
                        key={speed}
                        onClick={(e) => {
                          e.stopPropagation();
                          setPlaybackSpeed(speed);
                          if (videoRef.current) videoRef.current.playbackRate = speed;
                          setShowSettings(false);
                        }}
                        className={`flex justify-between items-center py-2 px-2 rounded hover:bg-zinc-900 text-left ${playbackSpeed === speed ? 'text-red-500 font-bold' : ''}`}
                      >
                        <span>{speed === 1 ? 'Normal' : `${speed}x`}</span>
                        {playbackSpeed === speed && <Check className="w-3.5 h-3.5" />}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            <button onClick={(e) => { e.stopPropagation(); handleFullscreen(); }} className="hover:text-red-500 transition-colors">
              {isFullscreen ? <Minimize className="w-5 h-5" /> : <Maximize className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}