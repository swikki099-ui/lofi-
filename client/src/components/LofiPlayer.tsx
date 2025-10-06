import { useState, useEffect, useRef } from 'react';
import { Play, Pause, SkipForward, SkipBack, Volume2, VolumeX, Sun, Moon, Radio, Video as VideoIcon, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import Hls from 'hls.js';

interface BackgroundVideo {
  id: string;
  name: string;
  url: string;
}

interface RadioStation {
  id: string;
  name: string;
  genre: string;
  url: string;
}

interface YouTubeVideo {
  id: string;
  title: string;
  thumbnail: string;
  channelTitle?: string;
  description?: string;
}

declare global {
  interface Window {
    YT: any;
    onYouTubeIframeAPIReady: () => void;
  }
}

const backgroundVideos: BackgroundVideo[] = [
  { id: '1', name: 'Rainy Window', url: 'https://cdn.pixabay.com/video/2023/05/06/160934-825667267_large.mp4' },
  { id: '2', name: 'Cozy Study Room', url: 'https://cdn.pixabay.com/video/2022/10/18/135485-762293598_large.mp4' },
  { id: '3', name: 'City Night', url: 'https://cdn.pixabay.com/video/2023/07/28/173513-849691526_large.mp4' },
  { id: '4', name: 'Forest Ambience', url: 'https://cdn.pixabay.com/video/2023/04/21/159430-819936854_large.mp4' },
  { id: '5', name: 'Ocean Waves', url: 'https://cdn.pixabay.com/video/2022/11/28/141200-777337480_large.mp4' },
];

const hindiRadioStations: RadioStation[] = [
  { id: '1', name: 'Radio City 91.1 FM', genre: 'Bollywood Hits', url: 'https://prclive4.listenon.in/radiocity' },
  { id: '2', name: 'Red FM 93.5', genre: 'Bollywood & Indie', url: 'https://stream.zenolive.com/8wv4d8g4344tv' },
  { id: '3', name: 'Radio Mirchi 98.3 FM', genre: 'Top Bollywood', url: 'https://radioindia.net/radio/mirchi983delhi/icecast.audio' },
  { id: '4', name: 'Vividh Bharati', genre: 'Classic Hindi', url: 'https://air.pc.cdn.bitgravity.com/air/live/pbaudio031/playlist.m3u8' },
  { id: '5', name: 'AIR FM Gold', genre: 'Retro Bollywood', url: 'https://air.pc.cdn.bitgravity.com/air/live/pbaudio120/playlist.m3u8' },
  { id: '6', name: 'Fever 104 FM', genre: 'Hindi Pop', url: 'https://stream.zenolive.com/5r8qzb8zqtzuv' },
  { id: '7', name: 'Big FM 92.7', genre: 'Bollywood Mix', url: 'https://stream.zenolive.com/2whmsybsxrhvv' },
  { id: '8', name: 'Radio One 94.3', genre: 'Hindi & English', url: 'https://stream.zenolive.com/smf5kdh3re5tv' },
];

export default function LofiPlayer() {
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(70);
  const [isMuted, setIsMuted] = useState(false);
  const [mode, setMode] = useState<'youtube' | 'radio'>('youtube');
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState<YouTubeVideo[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [modalResults, setModalResults] = useState<YouTubeVideo[]>([]);
  const [currentVideo, setCurrentVideo] = useState<YouTubeVideo | null>(null);
  const [playlist, setPlaylist] = useState<YouTubeVideo[]>([]);
  const [currentPlaylistIndex, setCurrentPlaylistIndex] = useState(0);
  const [selectedBackground, setSelectedBackground] = useState(backgroundVideos[0].id);
  const [videoFit, setVideoFit] = useState<'cover' | 'contain'>('cover');
  const [selectedRadio, setSelectedRadio] = useState(hindiRadioStations[0].id);
  const [isSearching, setIsSearching] = useState(false);
  const [ytReady, setYtReady] = useState(false);
  
  const youtubePlayerRef = useRef<any>(null);
  const radioPlayerRef = useRef<HTMLAudioElement>(null);
  const hlsRef = useRef<Hls | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  const searchTimeoutRef = useRef<NodeJS.Timeout>();
  const { toast } = useToast();

  // Initialize YouTube IFrame API
  useEffect(() => {
    if (!window.YT) {
      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      const firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);
    }

    window.onYouTubeIframeAPIReady = () => {
      setYtReady(true);
    };

    if (window.YT?.loaded) {
      setYtReady(true);
    }
  }, []);

  // Create YouTube player when ready
  useEffect(() => {
    if (ytReady && !youtubePlayerRef.current) {
      youtubePlayerRef.current = new window.YT.Player('youtube-player', {
        height: '0',
        width: '0',
        playerVars: {
          autoplay: 0,
          controls: 0,
        },
        events: {
          onReady: (event: any) => {
            event.target.setVolume(volume);
          },
          onStateChange: (event: any) => {
            if (event.data === window.YT.PlayerState.PLAYING) {
              setIsPlaying(true);
            } else if (event.data === window.YT.PlayerState.PAUSED) {
              setIsPlaying(false);
            } else if (event.data === window.YT.PlayerState.ENDED) {
              handleNext();
            }
          },
        },
      });
    }
  }, [ytReady]);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme]);

  useEffect(() => {
    if (mode === 'youtube' && youtubePlayerRef.current?.setVolume) {
      youtubePlayerRef.current.setVolume(isMuted ? 0 : volume);
    } else if (mode === 'radio' && radioPlayerRef.current) {
      radioPlayerRef.current.volume = isMuted ? 0 : volume / 100;
    }
  }, [volume, isMuted, mode]);

  useEffect(() => {
    drawVisualizer();
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isPlaying]);

  // Initialize radio player and cleanup
  useEffect(() => {
    // Load the first station on mount
    if (radioPlayerRef.current && selectedRadio) {
      const station = hindiRadioStations.find(s => s.id === selectedRadio);
      if (station) {
        const isHLS = station.url.includes('.m3u8');
        
        if (isHLS && Hls.isSupported()) {
          const hls = new Hls({
            enableWorker: true,
            lowLatencyMode: true,
          });
          hlsRef.current = hls;
          hls.loadSource(station.url);
          hls.attachMedia(radioPlayerRef.current);
        } else if (isHLS && radioPlayerRef.current.canPlayType('application/vnd.apple.mpegurl')) {
          radioPlayerRef.current.src = station.url;
          radioPlayerRef.current.load();
        } else {
          radioPlayerRef.current.src = station.url;
          radioPlayerRef.current.load();
        }
      }
    }

    // Cleanup on unmount
    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
    };
  }, []);

  // Cleanup when switching modes
  useEffect(() => {
    if (mode === 'youtube' && hlsRef.current) {
      hlsRef.current.destroy();
      hlsRef.current = null;
    }
  }, [mode]);

  const drawVisualizer = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const width = canvas.width;
    const height = canvas.height;
    const barCount = 50;
    const barWidth = width / barCount;
    
    const animate = () => {
      ctx.clearRect(0, 0, width, height);
      
      for (let i = 0; i < barCount; i++) {
        const barHeight = isPlaying 
          ? Math.random() * height * 0.8 
          : height * 0.1;
        
        const gradient = ctx.createLinearGradient(0, height, 0, height - barHeight);
        gradient.addColorStop(0, 'hsl(280, 65%, 65%)');
        gradient.addColorStop(1, 'hsl(280, 65%, 65%, 0.2)');
        
        ctx.fillStyle = gradient;
        ctx.fillRect(i * barWidth + barWidth * 0.2, height - barHeight, barWidth * 0.6, barHeight);
      }
      
      animationRef.current = requestAnimationFrame(animate);
    };
    
    animate();
  };

  const handlePlayPause = () => {
    if (mode === 'youtube') {
      if (youtubePlayerRef.current?.getPlayerState) {
        const state = youtubePlayerRef.current.getPlayerState();
        if (state === window.YT.PlayerState.PLAYING) {
          youtubePlayerRef.current.pauseVideo();
        } else {
          if (!currentVideo) {
            toast({
              title: "No video selected",
              description: "Please search and select a video to play",
              variant: "destructive",
            });
            return;
          }
          youtubePlayerRef.current.playVideo();
        }
      }
    } else {
      if (radioPlayerRef.current) {
        if (isPlaying) {
          radioPlayerRef.current.pause();
          setIsPlaying(false);
        } else {
          radioPlayerRef.current.play().then(() => {
            setIsPlaying(true);
          }).catch((error) => {
            console.error('Radio play error:', error);
            toast({
              title: "Playback Error",
              description: "Failed to play radio station. Please try another station.",
              variant: "destructive",
            });
          });
        }
      }
    }
  };

  const handleNext = () => {
    if (mode === 'youtube' && playlist.length > 0) {
      const nextIndex = (currentPlaylistIndex + 1) % playlist.length;
      setCurrentPlaylistIndex(nextIndex);
      playVideo(playlist[nextIndex]);
    }
  };

  const handlePrevious = () => {
    if (mode === 'youtube' && playlist.length > 0) {
      const prevIndex = currentPlaylistIndex === 0 ? playlist.length - 1 : currentPlaylistIndex - 1;
      setCurrentPlaylistIndex(prevIndex);
      playVideo(playlist[prevIndex]);
    }
  };

  const searchYouTube = async (query: string, maxResults: number = 5) => {
    try {
      setIsSearching(true);
      const response = await fetch(`/api/youtube/search?q=${encodeURIComponent(query)}&maxResults=${maxResults}`);
      
      if (!response.ok) {
        throw new Error('Search failed');
      }
      
      const data = await response.json();
      return data.results || [];
    } catch (error) {
      console.error('YouTube search error:', error);
      toast({
        title: "Search Error",
        description: "Failed to search YouTube. Please try again.",
        variant: "destructive",
      });
      return [];
    } finally {
      setIsSearching(false);
    }
  };

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    
    if (query.length > 2) {
      searchTimeoutRef.current = setTimeout(async () => {
        const results = await searchYouTube(query, 5);
        setSuggestions(results);
      }, 500);
    } else {
      setSuggestions([]);
    }
  };

  const handleSearchSubmit = async () => {
    if (searchQuery.trim()) {
      const results = await searchYouTube(searchQuery, 20);
      setModalResults(results);
      setShowModal(true);
      setSuggestions([]);
    }
  };

  const playVideo = (video: YouTubeVideo) => {
    setCurrentVideo(video);
    
    if (!playlist.find(v => v.id === video.id)) {
      const newPlaylist = [...playlist, video];
      setPlaylist(newPlaylist);
      setCurrentPlaylistIndex(newPlaylist.length - 1);
    } else {
      const index = playlist.findIndex(v => v.id === video.id);
      setCurrentPlaylistIndex(index);
    }
    
    if (youtubePlayerRef.current?.loadVideoById) {
      youtubePlayerRef.current.loadVideoById(video.id);
      setIsPlaying(true);
    }
    
    setSuggestions([]);
    setShowModal(false);
  };

  const handleRadioChange = (stationId: string) => {
    setSelectedRadio(stationId);
    setIsPlaying(false);
    
    // Clean up previous HLS instance
    if (hlsRef.current) {
      hlsRef.current.destroy();
      hlsRef.current = null;
    }
    
    if (radioPlayerRef.current) {
      const station = hindiRadioStations.find(s => s.id === stationId);
      if (station) {
        const isHLS = station.url.includes('.m3u8');
        
        if (isHLS && Hls.isSupported()) {
          // Use HLS.js for .m3u8 streams
          const hls = new Hls({
            enableWorker: true,
            lowLatencyMode: true,
          });
          hlsRef.current = hls;
          hls.loadSource(station.url);
          hls.attachMedia(radioPlayerRef.current);
          
          hls.on(Hls.Events.MANIFEST_PARSED, () => {
            console.log('HLS manifest loaded for:', station.name);
          });
          
          hls.on(Hls.Events.ERROR, (event, data) => {
            console.error('HLS error:', data);
            if (data.fatal) {
              toast({
                title: "Streaming Error",
                description: `Failed to load ${station.name}. Please try another station.`,
                variant: "destructive",
              });
            }
          });
        } else if (isHLS && radioPlayerRef.current.canPlayType('application/vnd.apple.mpegurl')) {
          // Native HLS support (Safari)
          radioPlayerRef.current.src = station.url;
          radioPlayerRef.current.load();
        } else {
          // Regular audio stream
          radioPlayerRef.current.src = station.url;
          radioPlayerRef.current.load();
        }
      }
    }
  };

  const currentRadioStation = hindiRadioStations.find(s => s.id === selectedRadio);
  const currentBgVideo = backgroundVideos.find(v => v.id === selectedBackground);

  return (
    <div className="relative h-screen w-full overflow-hidden">
      {/* Background Video */}
      <div className="absolute inset-0 z-0">
        <video
          key={currentBgVideo?.url}
          autoPlay
          loop
          muted
          playsInline
          className={`h-full w-full ${videoFit === 'cover' ? 'object-cover' : 'object-contain'} transition-all duration-500`}
        >
          <source src={currentBgVideo?.url} type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-black/40 dark:bg-black/40"></div>
      </div>

      {/* YouTube Player */}
      <div id="youtube-player" className="hidden"></div>
      
      {/* Radio Player */}
      <audio 
        ref={radioPlayerRef} 
        preload="none"
        onError={(e) => {
          console.error('Radio error:', e);
          setIsPlaying(false);
        }}
      />

      {/* Glassmorphic Control Panel */}
      <div className="relative z-10 h-screen flex items-start md:items-center justify-start">
        <div className="w-full md:w-[480px] h-full md:h-auto md:max-h-[90vh] overflow-y-auto bg-white/15 dark:bg-black/15 backdrop-blur-2xl border border-white/10 md:rounded-r-3xl md:rounded-l-none p-6 space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white font-display">Lofi Player</h1>
              <p className="text-sm text-white/75">Relax & Focus</p>
            </div>
            <Button
              size="icon"
              variant="ghost"
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="text-white hover-elevate"
              data-testid="button-theme-toggle"
            >
              {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </Button>
          </div>

          {/* Mode Switcher */}
          <div className="flex gap-2">
            <Button
              variant={mode === 'youtube' ? 'default' : 'ghost'}
              onClick={() => {
                setMode('youtube');
                setIsPlaying(false);
                if (radioPlayerRef.current) {
                  radioPlayerRef.current.pause();
                }
              }}
              className="flex-1"
              data-testid="button-mode-youtube"
            >
              <VideoIcon className="w-4 h-4 mr-2" />
              YouTube
            </Button>
            <Button
              variant={mode === 'radio' ? 'default' : 'ghost'}
              onClick={() => {
                setMode('radio');
                setIsPlaying(false);
                if (youtubePlayerRef.current?.pauseVideo) {
                  youtubePlayerRef.current.pauseVideo();
                }
              }}
              className="flex-1"
              data-testid="button-mode-radio"
            >
              <Radio className="w-4 h-4 mr-2" />
              Radio
            </Button>
          </div>

          {/* YouTube Mode */}
          {mode === 'youtube' && (
            <div className="space-y-4">
              {/* Search */}
              <div className="relative">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/60" />
                  <Input
                    type="text"
                    placeholder="Search lofi music..."
                    value={searchQuery}
                    onChange={(e) => handleSearch(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearchSubmit()}
                    className="pl-10 bg-white/10 border-white/10 text-white placeholder:text-white/50 focus-visible:ring-primary"
                    data-testid="input-search"
                    disabled={isSearching}
                  />
                </div>
                
                {/* Suggestions Dropdown */}
                {suggestions.length > 0 && (
                  <div className="absolute top-full mt-2 w-full bg-white/15 dark:bg-black/15 backdrop-blur-xl border border-white/10 rounded-lg overflow-hidden z-50">
                    {suggestions.map((suggestion) => (
                      <button
                        key={suggestion.id}
                        onClick={() => playVideo(suggestion)}
                        className="w-full px-4 py-3 text-left text-sm text-white hover-elevate flex items-start gap-3"
                        data-testid={`suggestion-${suggestion.id}`}
                      >
                        <img 
                          src={suggestion.thumbnail} 
                          alt={suggestion.title}
                          className="w-12 h-9 object-cover rounded flex-shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm line-clamp-2">{suggestion.title}</p>
                          {suggestion.channelTitle && (
                            <p className="text-xs text-white/60 mt-0.5">{suggestion.channelTitle}</p>
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Now Playing */}
              {currentVideo && (
                <div className="bg-white/10 backdrop-blur-lg rounded-lg p-4 border border-white/10">
                  <p className="text-xs text-white/60 uppercase tracking-wide mb-2">Now Playing</p>
                  <div className="flex items-start gap-3">
                    <img 
                      src={currentVideo.thumbnail} 
                      alt={currentVideo.title}
                      className="w-16 h-12 object-cover rounded flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-white font-medium text-sm line-clamp-2" data-testid="text-now-playing">
                        {currentVideo.title}
                      </p>
                      {currentVideo.channelTitle && (
                        <p className="text-xs text-white/60 mt-1">{currentVideo.channelTitle}</p>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Radio Mode */}
          {mode === 'radio' && (
            <div className="space-y-4">
              <Select value={selectedRadio} onValueChange={handleRadioChange}>
                <SelectTrigger className="bg-white/10 border-white/10 text-white" data-testid="select-radio-station">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {hindiRadioStations.map((station) => (
                    <SelectItem key={station.id} value={station.id}>
                      <div>
                        <div className="font-medium">{station.name}</div>
                        <div className="text-xs text-muted-foreground">{station.genre}</div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Current Station */}
              {currentRadioStation && (
                <div className="bg-white/10 backdrop-blur-lg rounded-lg p-4 border border-white/10">
                  <p className="text-xs text-white/60 uppercase tracking-wide mb-1">Live Now</p>
                  <p className="text-white font-medium" data-testid="text-current-station">{currentRadioStation.name}</p>
                  <Badge variant="secondary" className="mt-2">{currentRadioStation.genre}</Badge>
                </div>
              )}
            </div>
          )}

          {/* Playback Controls */}
          <div className="flex items-center justify-center gap-4">
            <Button
              size="icon"
              variant="ghost"
              onClick={handlePrevious}
              disabled={mode === 'radio' || playlist.length === 0}
              className="text-white"
              data-testid="button-previous"
            >
              <SkipBack className="w-5 h-5" />
            </Button>
            <Button
              size="icon"
              onClick={handlePlayPause}
              className="w-14 h-14"
              data-testid="button-play-pause"
            >
              {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6 ml-0.5" />}
            </Button>
            <Button
              size="icon"
              variant="ghost"
              onClick={handleNext}
              disabled={mode === 'radio' || playlist.length === 0}
              className="text-white"
              data-testid="button-next"
            >
              <SkipForward className="w-5 h-5" />
            </Button>
          </div>

          {/* Volume Control */}
          <div className="flex items-center gap-3">
            <Button
              size="icon"
              variant="ghost"
              onClick={() => setIsMuted(!isMuted)}
              className="text-white"
              data-testid="button-mute"
            >
              {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
            </Button>
            <Slider
              value={[volume]}
              onValueChange={([val]) => {
                setVolume(val);
                setIsMuted(false);
              }}
              max={100}
              step={1}
              className="flex-1"
              data-testid="slider-volume"
            />
            <span className="text-white text-sm w-10 text-right">{volume}%</span>
          </div>

          {/* Visualizer */}
          <div className="bg-white/5 backdrop-blur-sm rounded-lg p-4 border border-white/10">
            <canvas
              ref={canvasRef}
              width={432}
              height={100}
              className="w-full h-24 rounded"
            />
          </div>

          {/* Background Controls */}
          <div className="space-y-3">
            <label className="text-xs text-white/75 uppercase tracking-wide">Background Video</label>
            <Select value={selectedBackground} onValueChange={setSelectedBackground}>
              <SelectTrigger className="bg-white/10 border-white/10 text-white" data-testid="select-background">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {backgroundVideos.map((video) => (
                  <SelectItem key={video.id} value={video.id}>
                    {video.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <div className="flex gap-2">
              <Button
                variant={videoFit === 'cover' ? 'default' : 'secondary'}
                onClick={() => setVideoFit('cover')}
                className="flex-1"
                size="sm"
                data-testid="button-fit-cover"
              >
                Cover
              </Button>
              <Button
                variant={videoFit === 'contain' ? 'default' : 'secondary'}
                onClick={() => setVideoFit('contain')}
                className="flex-1"
                size="sm"
                data-testid="button-fit-contain"
              >
                Contain
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Search Results Modal */}
      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto" aria-describedby="search-results-description">
          <DialogHeader>
            <DialogTitle>Search Results for "{searchQuery}"</DialogTitle>
          </DialogHeader>
          <p id="search-results-description" className="sr-only">
            Click on a video to play it
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
            {modalResults.map((result) => (
              <button
                key={result.id}
                onClick={() => playVideo(result)}
                className="bg-card rounded-lg p-3 text-left hover-elevate border border-card-border"
                data-testid={`result-${result.id}`}
              >
                <img 
                  src={result.thumbnail} 
                  alt={result.title}
                  className="w-full aspect-video object-cover rounded mb-2"
                />
                <p className="font-medium text-sm line-clamp-2">{result.title}</p>
                {result.channelTitle && (
                  <p className="text-xs text-muted-foreground mt-1">{result.channelTitle}</p>
                )}
              </button>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
