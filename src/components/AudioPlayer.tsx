import React, { useEffect, useRef, useState } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  Volume2,
  VolumeX,
  Download,
  RotateCw,
  Gauge,
  Sparkles,
} from 'lucide-react';
import { base64ToBlobUrl, downloadAudio, formatTime } from '../utils/audio';

interface AudioPlayerProps {
  base64Audio: string;
  title?: string;
  voiceName?: string;
  isInterview?: boolean;
  onDownload?: () => void;
}

export const AudioPlayer: React.FC<AudioPlayerProps> = ({
  base64Audio,
  title = 'التسجيل الصوتي — استوديو BARITONE',
  voiceName,
  isInterview = false,
}) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [blobUrl, setBlobUrl] = useState<string>('');
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.9);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1.0);

  // Convert base64 to Blob URL whenever base64 changes
  useEffect(() => {
    if (!base64Audio) return;
    const url = base64ToBlobUrl(base64Audio, 'audio/wav');
    setBlobUrl(url);
    setIsPlaying(false);
    setCurrentTime(0);

    return () => {
      URL.revokeObjectURL(url);
    };
  }, [base64Audio]);

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play().catch(console.error);
    }
  };

  const handleTimeUpdate = () => {
    if (!audioRef.current) return;
    setCurrentTime(audioRef.current.currentTime);
  };

  const handleLoadedMetadata = () => {
    if (!audioRef.current) return;
    setDuration(audioRef.current.duration);
    audioRef.current.volume = volume;
    audioRef.current.playbackRate = playbackRate;
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    setCurrentTime(time);
    if (audioRef.current) {
      audioRef.current.currentTime = time;
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const vol = parseFloat(e.target.value);
    setVolume(vol);
    setIsMuted(vol === 0);
    if (audioRef.current) {
      audioRef.current.volume = vol;
    }
  };

  const toggleMute = () => {
    if (!audioRef.current) return;
    const newMuted = !isMuted;
    setIsMuted(newMuted);
    audioRef.current.volume = newMuted ? 0 : volume;
  };

  const cycleSpeed = () => {
    const speeds = [1.0, 1.25, 1.5, 0.85];
    const nextIdx = (speeds.indexOf(playbackRate) + 1) % speeds.length;
    const newSpeed = speeds[nextIdx];
    setPlaybackRate(newSpeed);
    if (audioRef.current) {
      audioRef.current.playbackRate = newSpeed;
    }
  };

  const skipSeconds = (seconds: number) => {
    if (!audioRef.current) return;
    audioRef.current.currentTime = Math.max(0, Math.min(duration, audioRef.current.currentTime + seconds));
  };

  const handleDownloadWav = () => {
    const filename = `baritone_${isInterview ? 'interview' : 'solo'}_${Date.now()}.wav`;
    downloadAudio(base64Audio, filename, 'audio/wav');
  };

  // Generate synthetic waveform bars for visual aesthetic
  const waveformHeights = [25, 45, 70, 95, 60, 40, 85, 100, 75, 40, 65, 80, 50, 90, 65, 35, 75, 55, 95, 45, 30, 80, 60, 40];

  return (
    <div className="relative overflow-hidden rounded-2xl border border-red-200 bg-white p-5 md:p-6 shadow-md glow-red-subtle">
      {/* Background Audio Element */}
      {blobUrl && (
        <audio
          ref={audioRef}
          src={blobUrl}
          onTimeUpdate={handleTimeUpdate}
          onLoadedMetadata={handleLoadedMetadata}
          onEnded={() => setIsPlaying(false)}
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
        />
      )}

      {/* Top Header / Metadata */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-100 pb-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-600 text-white shadow-md shadow-red-500/20">
            <Sparkles className="h-5 w-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-gray-900 text-base md:text-lg">{title}</h3>
              <span className="rounded-full bg-red-50 px-2.5 py-0.5 text-[11px] font-semibold text-red-700 border border-red-200">
                WAV 24kHz
              </span>
            </div>
            {voiceName && (
              <p className="text-xs text-gray-500">
                الصوت: <span className="text-red-700 font-medium">{voiceName}</span>
                {isInterview ? ' (وضع اللقاء الإعلامي)' : ' (استوديو منفرد)'}
              </p>
            )}
          </div>
        </div>

        {/* Download action */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleDownloadWav}
            className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-3.5 py-2 text-xs font-semibold text-red-700 transition-all hover:bg-red-600 hover:text-white hover:shadow-md active:scale-95"
            title="تحميل الملف بصيغة WAV نقاوة استوديو كاملة"
          >
            <Download className="h-3.5 w-3.5" />
            <span>تحميل WAV Master</span>
          </button>
        </div>
      </div>

      {/* Center Waveform & Progress Scrubber */}
      <div className="my-5">
        <div className="mb-2 flex items-center justify-between text-xs font-mono text-gray-500">
          <span>{formatTime(currentTime)}</span>
          <div className="flex items-center gap-1.5">
            {isPlaying && (
              <span className="inline-flex items-center gap-1 text-[11px] text-red-600 font-medium">
                <span className="h-1.5 w-1.5 rounded-full bg-red-600 animate-ping" />
                استماع مباشر
              </span>
            )}
            <span>/ {formatTime(duration || 0)}</span>
          </div>
        </div>

        {/* Visual Animated Waveform Bars */}
        <div className="relative mb-2 flex h-14 w-full items-center justify-between gap-1 overflow-hidden rounded-xl bg-gray-50 px-3 py-2 border border-gray-200">
          {waveformHeights.map((h, i) => {
            const barProgress = i / waveformHeights.length;
            const currentProgress = duration > 0 ? currentTime / duration : 0;
            const isPassed = barProgress <= currentProgress;
            return (
              <div
                key={i}
                className="flex h-full flex-1 items-center justify-center cursor-pointer"
                onClick={() => {
                  if (audioRef.current && duration > 0) {
                    audioRef.current.currentTime = barProgress * duration;
                  }
                }}
              >
                <div
                  className={`w-full max-w-[4px] rounded-full transition-all duration-200 ${
                    isPassed
                      ? 'bg-gradient-to-t from-red-700 to-red-500'
                      : 'bg-gray-200'
                  } ${isPlaying && isPassed ? 'scale-y-110 shadow-xs' : ''}`}
                  style={{
                    height: `${isPlaying ? Math.max(20, (h * (0.6 + Math.random() * 0.4))) : h}%`,
                  }}
                />
              </div>
            );
          })}
        </div>

        {/* Custom Range Slider */}
        <input
          type="range"
          min={0}
          max={duration || 100}
          step={0.05}
          value={currentTime}
          onChange={handleSeek}
          className="h-1.5 w-full cursor-pointer appearance-none rounded-lg bg-gray-200 accent-red-600"
        />
      </div>

      {/* Control Console */}
      <div className="flex flex-wrap items-center justify-between gap-4 pt-1">
        {/* Speed & Replay Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={cycleSpeed}
            className="flex items-center gap-1 rounded-lg border border-gray-200 bg-gray-50 px-2.5 py-1.5 text-xs font-mono font-bold text-gray-700 hover:border-red-400 hover:text-red-600"
            title="تغيير سرعة الاستماع"
          >
            <Gauge className="h-3.5 w-3.5" />
            <span>{playbackRate}x</span>
          </button>

          <button
            onClick={() => skipSeconds(-5)}
            className="rounded-lg border border-gray-200 bg-gray-50 p-2 text-gray-600 hover:text-gray-900 hover:border-gray-300"
            title="رجوع 5 ثوانٍ"
          >
            <RotateCcw className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={() => skipSeconds(5)}
            className="rounded-lg border border-gray-200 bg-gray-50 p-2 text-gray-600 hover:text-gray-900 hover:border-gray-300"
            title="تقديم 5 ثوانٍ"
          >
            <RotateCw className="h-3.5 w-3.5" />
          </button>
        </div>

        {/* Big Master Play Button */}
        <button
          onClick={togglePlay}
          className="flex h-13 w-13 items-center justify-center rounded-2xl bg-gradient-to-br from-red-600 to-red-700 text-white shadow-lg shadow-red-600/30 transition-all hover:scale-105 active:scale-95"
          title={isPlaying ? 'إيقاف مؤقت' : 'تشغيل'}
        >
          {isPlaying ? (
            <Pause className="h-6 w-6 fill-current" />
          ) : (
            <Play className="h-6 w-6 fill-current translate-x-[-1px]" />
          )}
        </button>

        {/* Volume & Mute */}
        <div className="flex items-center gap-2">
          <button
            onClick={toggleMute}
            className="text-gray-500 hover:text-gray-900"
            title={isMuted ? 'إلغاء الكتم' : 'كتم'}
          >
            {isMuted || volume === 0 ? (
              <VolumeX className="h-4 w-4 text-red-500" />
            ) : (
              <Volume2 className="h-4 w-4 text-gray-700" />
            )}
          </button>
          <input
            type="range"
            min={0}
            max={1}
            step={0.05}
            value={isMuted ? 0 : volume}
            onChange={handleVolumeChange}
            className="h-1 w-20 cursor-pointer appearance-none rounded-lg bg-gray-200 accent-red-600"
          />
        </div>
      </div>
    </div>
  );
};
