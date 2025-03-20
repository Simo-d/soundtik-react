import React, { useState, useRef, useEffect } from 'react';
import PropTypes from 'prop-types';

/**
 * Custom audio player component
 * @param {Object} props - Component props
 */
const AudioPlayer = ({
  src,
  title = '',
  artist = '',
  showThumbnail = true,
  thumbnail = '',
  className = '',
  onPlay,
  onPause,
  onEnded,
  autoPlay = false,
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [error, setError] = useState(null);
  
  const audioRef = useRef(null);
  const progressBarRef = useRef(null);

  // Load audio and handle errors
  useEffect(() => {
    if (!src) return;
    
    const audio = audioRef.current;
    if (!audio) return;
    
    // Reset state
    setError(null);
    setCurrentTime(0);
    setDuration(0);
    setIsPlaying(false);
    
    // Handle errors
    const handleError = () => {
      setError('Could not load audio. Please check the URL and try again.');
      setIsPlaying(false);
    };
    
    audio.addEventListener('error', handleError);
    
    return () => {
      audio.removeEventListener('error', handleError);
    };
  }, [src]);

  // Handle audio metadata loaded
  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
    }
  };

  // Handle time update
  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  // Toggle play/pause
  const togglePlay = () => {
    if (!audioRef.current) return;
    
    if (isPlaying) {
      audioRef.current.pause();
      if (onPause) onPause();
    } else {
      const playPromise = audioRef.current.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            if (onPlay) onPlay();
          })
          .catch(err => {
            console.error('Playback error:', err);
            setError('Playback failed. This might be due to autoplay restrictions.');
          });
      }
    }
    setIsPlaying(!isPlaying);
  };

  // Handle progress bar click
  const handleProgressChange = (e) => {
    if (!audioRef.current || !progressBarRef.current) return;
    
    const progressBar = progressBarRef.current;
    const rect = progressBar.getBoundingClientRect();
    const pos = (e.clientX - rect.left) / progressBar.offsetWidth;
    audioRef.current.currentTime = pos * duration;
  };

  // Handle volume change
  const handleVolumeChange = (e) => {
    const value = parseFloat(e.target.value);
    setVolume(value);
    if (audioRef.current) {
      audioRef.current.volume = value;
    }
    setIsMuted(value === 0);
  };

  // Toggle mute
  const toggleMute = () => {
    if (!audioRef.current) return;
    
    if (isMuted) {
      audioRef.current.volume = volume || 1;
      setIsMuted(false);
    } else {
      audioRef.current.volume = 0;
      setIsMuted(true);
    }
  };

  // Format time in MM:SS
  const formatTime = (time) => {
    if (isNaN(time)) return '00:00';
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  // Handle audio ended
  const handleEnded = () => {
    setIsPlaying(false);
    setCurrentTime(0);
    if (onEnded) onEnded();
  };

  // Update audio volume and muted state when those states change
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume;
    }
  }, [volume, isMuted]);

  // Set up autoplay if enabled
  useEffect(() => {
    if (autoPlay && audioRef.current && src) {
      audioRef.current.play()
        .then(() => {
          setIsPlaying(true);
          if (onPlay) onPlay();
        })
        .catch(error => {
          console.error('Autoplay prevented:', error);
          setError('Autoplay was prevented by the browser. Click play to listen.');
        });
    }
  }, [autoPlay, onPlay, src]);

  return (
    <div className={`audio-player rounded-lg bg-white shadow p-4 ${className}`}>
      <div className="flex items-center">
        {showThumbnail && (
          <div className="mr-4">
            <div className="h-16 w-16 rounded bg-gray-200 flex-shrink-0 overflow-hidden">
              {thumbnail ? (
                <img src={thumbnail} alt={title} className="w-full h-full object-cover" />
              ) : (
                <div className="flex items-center justify-center h-full bg-primary text-white">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                  </svg>
                </div>
              )}
            </div>
          </div>
        )}
        
        <div className="flex-grow">
          {/* Title and Artist */}
          {(title || artist) && (
            <div className="mb-2">
              {title && <div className="font-medium text-gray-800">{title}</div>}
              {artist && <div className="text-sm text-gray-500">{artist}</div>}
            </div>
          )}
          
          {/* Audio Element */}
          <audio
            ref={audioRef}
            src={src}
            onLoadedMetadata={handleLoadedMetadata}
            onTimeUpdate={handleTimeUpdate}
            onEnded={handleEnded}
            className="hidden"
          />
          
          {/* Error Message */}
          {error && (
            <div className="mb-2 text-error text-sm">
              {error}
            </div>
          )}
          
          {/* Controls */}
          <div className="flex items-center">
            <button 
              onClick={togglePlay}
              className="mr-2 text-primary focus:outline-none hover:text-primary-light transition-colors"
              aria-label={isPlaying ? 'Pause' : 'Play'}
              disabled={!src}
            >
              {isPlaying ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              )}
            </button>
            
            <div className="flex-grow mx-2">
              <div 
                className="h-2 bg-gray-200 rounded-full cursor-pointer"
                ref={progressBarRef}
                onClick={handleProgressChange}
              >
                <div 
                  className="h-full bg-primary rounded-full transition-all duration-100"
                  style={{ width: `${duration > 0 ? (currentTime / duration) * 100 : 0}%` }}
                ></div>
              </div>
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>{formatTime(currentTime)}</span>
                <span>{formatTime(duration)}</span>
              </div>
            </div>
            
            <div className="flex items-center ml-2">
              <button 
                onClick={toggleMute}
                className="text-gray-600 focus:outline-none hover:text-primary transition-colors mr-1"
                aria-label={isMuted ? 'Unmute' : 'Mute'}
              >
                {isMuted ? (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" clipRule="evenodd" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                  </svg>
                )}
              </button>
              
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={isMuted ? 0 : volume}
                onChange={handleVolumeChange}
                className="w-16 h-1"
                style={{ accentColor: '#6200EA' }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

AudioPlayer.propTypes = {
  src: PropTypes.string.isRequired,
  title: PropTypes.string,
  artist: PropTypes.string,
  showThumbnail: PropTypes.bool,
  thumbnail: PropTypes.string,
  className: PropTypes.string,
  onPlay: PropTypes.func,
  onPause: PropTypes.func,
  onEnded: PropTypes.func,
  autoPlay: PropTypes.bool,
};

export default AudioPlayer;