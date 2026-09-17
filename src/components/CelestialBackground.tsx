import React, { useState, useEffect, useRef } from 'react';
import { WallpaperOption } from '../types';
import { WavesShaderBackground } from './WavesShaderBackground';
import { getBackgroundById, DynamicBackgroundItem } from '../data/backgroundData';
import { getCachedVideoUrl, cacheVideoInBackground } from '../services/videoCacheService';
import { ambientSound } from '../utils/ambientSoundManager';

interface CelestialBackgroundProps {
  wallpaper?: WallpaperOption;
  bgId?: string;
  theme?: 'nur-dark' | 'nur-light';
}

export const CelestialBackground: React.FC<CelestialBackgroundProps> = ({ 
  bgId = 'mecca',
  theme = 'nur-dark' 
}) => {
  const isLight = theme === 'nur-light';
  const [isMobileScreen, setIsMobileScreen] = useState(() => {
    return typeof window !== 'undefined' ? window.innerWidth < 768 : false;
  });
  const [videoSrc, setVideoSrc] = useState<string>('');
  const [videoReady, setVideoReady] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const currentBg: DynamicBackgroundItem = getBackgroundById(bgId);

  // Screen size detection for responsive mobile vs desktop/tablet media
  useEffect(() => {
    const handleResize = () => {
      setIsMobileScreen(window.innerWidth < 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const photoUrl = isMobileScreen ? currentBg.mobile.photo : currentBg.desktop.photo;
  const targetVideoUrl = isMobileScreen ? currentBg.mobile.video : currentBg.desktop.video;

  // Video source loading & local caching strategy
  useEffect(() => {
    let isCancelled = false;
    setVideoReady(false);

    if (currentBg.isShader || !targetVideoUrl) {
      setVideoSrc('');
      return;
    }

    // Step 1: Set immediate target video URL
    setVideoSrc(targetVideoUrl);

    // Step 2: Check IndexedDB / Cache API in background
    getCachedVideoUrl(targetVideoUrl).then((cachedBlobUrl) => {
      if (!isCancelled && cachedBlobUrl) {
        setVideoSrc(cachedBlobUrl);
      } else if (!isCancelled) {
        cacheVideoInBackground(targetVideoUrl).then((newBlobUrl) => {
          if (!isCancelled && newBlobUrl && newBlobUrl.startsWith('blob:')) {
            setVideoSrc(newBlobUrl);
          }
        }).catch(() => {});
      }
    }).catch(() => {});

    return () => {
      isCancelled = true;
    };
  }, [currentBg.id, currentBg.isShader, targetVideoUrl, isMobileScreen]);

  // Attempt autoPlay and sound playback
  useEffect(() => {
    if (videoRef.current && videoSrc) {
      const v = videoRef.current;
      const muted = ambientSound.getIsMuted();
      const vol = ambientSound.getVolume();
      v.muted = muted;
      v.volume = vol;
      v.load();

      const playPromise = v.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            setVideoReady(true);
          })
          .catch(() => {
            // Autoplay policy fallback: start playing muted, then unmute on user interaction
            v.muted = true;
            v.play().then(() => {
              setVideoReady(true);
            }).catch(() => {});
          });
      }
    }
  }, [videoSrc]);

  // Subscribe to ambient sound changes from settings/store
  useEffect(() => {
    const unsub = ambientSound.subscribe(() => {
      if (videoRef.current) {
        const muted = ambientSound.getIsMuted();
        const vol = ambientSound.getVolume();
        videoRef.current.muted = muted;
        videoRef.current.volume = vol;
        if (!muted && videoRef.current.paused) {
          videoRef.current.play().catch(() => {});
        }
      }
    });
    return unsub;
  }, []);

  // Global user interaction listener to unmute video audio seamlessly
  useEffect(() => {
    const handleFirstInteraction = () => {
      if (videoRef.current) {
        const muted = ambientSound.getIsMuted();
        const vol = ambientSound.getVolume();
        videoRef.current.muted = muted;
        videoRef.current.volume = vol;
        if (videoRef.current.paused) {
          videoRef.current.play().catch(() => {});
        }
      }
    };

    window.addEventListener('click', handleFirstInteraction, { passive: true });
    window.addEventListener('touchstart', handleFirstInteraction, { passive: true });
    return () => {
      window.removeEventListener('click', handleFirstInteraction);
      window.removeEventListener('touchstart', handleFirstInteraction);
    };
  }, []);

  return (
    <div 
      className="fixed inset-0 pointer-events-none z-0 overflow-hidden select-none bg-[#050918]"
      aria-hidden="true"
    >
      {/* If WebGL Shader mode is selected */}
      {currentBg.isShader ? (
        <WavesShaderBackground theme={theme} />
      ) : (
        <>
          {/* Static Instant Poster Photo (Always renders behind video so no blank screen) */}
          <div 
            className="absolute inset-0 bg-cover bg-center transition-opacity duration-1000 scale-105"
            style={{
              backgroundImage: `url(${photoUrl})`,
              filter: isLight 
                ? 'brightness(1.0) contrast(1.02)' 
                : 'brightness(0.9) contrast(1.05)',
            }}
          />

          {/* Smooth Looping Dynamic Video Background with Audio */}
          {videoSrc && (
            <video
              ref={videoRef}
              key={`${videoSrc}-${isMobileScreen ? 'mobile' : 'desktop'}`}
              autoPlay
              loop
              playsInline
              preload="auto"
              poster={photoUrl}
              onCanPlay={() => setVideoReady(true)}
              onLoadedData={() => setVideoReady(true)}
              className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 scale-105 ${
                videoReady ? 'opacity-100' : 'opacity-90'
              }`}
              style={{
                filter: isLight 
                  ? 'brightness(1.0) contrast(1.02)' 
                  : 'brightness(0.9) contrast(1.05)',
              }}
            >
              <source src={videoSrc} type="video/mp4" />
            </video>
          )}
        </>
      )}

      {/* Atmospheric Contrast Overlay */}
      <div 
        className="absolute inset-0 pointer-events-none transition-all duration-700"
        style={{
          background: isLight
            ? 'radial-gradient(ellipse at 50% 30%, rgba(255, 255, 255, 0.05) 0%, rgba(240, 235, 224, 0.25) 100%)'
            : 'radial-gradient(ellipse at 50% 30%, rgba(6, 11, 32, 0.15) 0%, rgba(6, 11, 32, 0.55) 100%)',
        }}
      />
    </div>
  );
};
export default CelestialBackground;
