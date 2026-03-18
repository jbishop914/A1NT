"use client";

import { useState, useRef, useEffect } from "react";
import {
  Video,
  VideoOff,
  Maximize2,
  Minimize2,
  Volume2,
  VolumeX,
  DoorOpen,
  DoorClosed,
  Circle,
  GripVertical,
  X,
  Wifi,
  WifiOff,
  Eye,
} from "lucide-react";

type CameraStatus = "online" | "offline" | "recording" | "motion";

interface CameraFeedProps {
  id: string;
  name: string;
  location?: string;
  status?: CameraStatus;
  isDoorbell?: boolean;
  streamUrl?: string; // HLS/WebRTC/MP4 stream URL
  snapshotUrl?: string; // Fallback snapshot image
  onClose?: () => void;
  onDoorUnlock?: () => void;
  className?: string;
  compact?: boolean;
}

export function CameraWidget({
  id,
  name,
  location,
  status = "online",
  isDoorbell = false,
  streamUrl,
  snapshotUrl,
  onClose,
  onDoorUnlock,
  className = "",
  compact = false,
}: CameraFeedProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [expanded, setExpanded] = useState(false);
  const [muted, setMuted] = useState(true);
  const [doorLocked, setDoorLocked] = useState(true);
  const [isLive, setIsLive] = useState(false);

  // Attempt to connect to live stream
  useEffect(() => {
    if (streamUrl && videoRef.current) {
      const video = videoRef.current;
      video.src = streamUrl;
      video.muted = muted;
      video
        .play()
        .then(() => setIsLive(true))
        .catch(() => setIsLive(false));
    }
  }, [streamUrl, muted]);

  const handleDoorToggle = () => {
    setDoorLocked(!doorLocked);
    onDoorUnlock?.();
  };

  const statusColor = {
    online: "bg-emerald-500",
    offline: "bg-red-500",
    recording: "bg-red-500 animate-pulse",
    motion: "bg-amber-500 animate-pulse",
  };

  const statusLabel = {
    online: "Live",
    offline: "Offline",
    recording: "REC",
    motion: "Motion",
  };

  const widgetSize = expanded
    ? "w-[640px] h-[400px]"
    : compact
      ? "w-[240px] h-[160px]"
      : "w-[320px] h-[200px]";

  return (
    <div
      className={`
        ${widgetSize} rounded-lg overflow-hidden
        bg-black/80 backdrop-blur-xl border border-white/10
        shadow-2xl shadow-black/50
        transition-all duration-300 ease-out
        group relative
        ${className}
      `}
      data-testid={`camera-widget-${id}`}
    >
      {/* Drag handle */}
      <div className="absolute top-0 left-0 right-0 h-7 z-20 cursor-move flex items-center px-2 bg-gradient-to-b from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
        <GripVertical className="w-3 h-3 text-white/50" />
      </div>

      {/* Video / Snapshot / Placeholder */}
      <div className="absolute inset-0 bg-neutral-950">
        {streamUrl ? (
          <video
            ref={videoRef}
            className="w-full h-full object-cover"
            autoPlay
            playsInline
            muted={muted}
            loop
          />
        ) : snapshotUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={snapshotUrl}
            alt={name}
            className="w-full h-full object-cover"
          />
        ) : (
          /* Mock feed — animated scan lines + noise pattern */
          <div className="w-full h-full relative overflow-hidden">
            {/* Simulated dark camera view */}
            <div className="absolute inset-0 bg-gradient-to-br from-neutral-900 via-neutral-800/80 to-neutral-900" />
            {/* Scan line effect */}
            <div
              className="absolute inset-0 opacity-[0.03]"
              style={{
                backgroundImage:
                  "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.03) 2px, rgba(255,255,255,0.03) 4px)",
              }}
            />
            {/* Subtle vignette */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_40%,rgba(0,0,0,0.4)_100%)]" />
            {/* Center icon */}
            <div className="absolute inset-0 flex items-center justify-center">
              {status === "offline" ? (
                <VideoOff className="w-8 h-8 text-white/20" />
              ) : (
                <Eye className="w-8 h-8 text-white/15" />
              )}
            </div>
          </div>
        )}
      </div>

      {/* Top bar — status + name */}
      <div className="absolute top-0 left-0 right-0 z-10 px-3 pt-2 pb-6 bg-gradient-to-b from-black/70 to-transparent">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 min-w-0">
            <div className="flex items-center gap-1.5">
              <div className={`w-1.5 h-1.5 rounded-full ${statusColor[status]}`} />
              <span className="text-[10px] font-mono uppercase tracking-wider text-white/70">
                {statusLabel[status]}
              </span>
            </div>
            <span className="text-xs font-medium text-white truncate">
              {name}
            </span>
          </div>

          {/* Close button */}
          {onClose && (
            <button
              onClick={onClose}
              className="opacity-0 group-hover:opacity-100 transition-opacity p-0.5 rounded hover:bg-white/10"
              data-testid={`camera-close-${id}`}
            >
              <X className="w-3 h-3 text-white/60" />
            </button>
          )}
        </div>
        {location && !compact && (
          <p className="text-[10px] text-white/40 mt-0.5 truncate">{location}</p>
        )}
      </div>

      {/* Bottom controls */}
      <div className="absolute bottom-0 left-0 right-0 z-10 px-3 pb-2 pt-6 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1">
            {/* Connection indicator */}
            {isLive ? (
              <Wifi className="w-3 h-3 text-emerald-400" />
            ) : (
              <WifiOff className="w-3 h-3 text-white/30" />
            )}

            {/* Mute toggle */}
            <button
              onClick={() => setMuted(!muted)}
              className="p-1 rounded hover:bg-white/10 transition-colors"
              data-testid={`camera-mute-${id}`}
            >
              {muted ? (
                <VolumeX className="w-3.5 h-3.5 text-white/60" />
              ) : (
                <Volume2 className="w-3.5 h-3.5 text-white/60" />
              )}
            </button>

            {/* Record indicator */}
            {status === "recording" && (
              <div className="flex items-center gap-1 ml-1">
                <Circle className="w-2 h-2 fill-red-500 text-red-500 animate-pulse" />
                <span className="text-[9px] font-mono text-red-400">REC</span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-1">
            {/* Door control (doorbell cameras) */}
            {isDoorbell && (
              <button
                onClick={handleDoorToggle}
                className={`
                  p-1 rounded transition-colors
                  ${doorLocked ? "hover:bg-white/10" : "bg-emerald-500/20 hover:bg-emerald-500/30"}
                `}
                data-testid={`camera-door-${id}`}
              >
                {doorLocked ? (
                  <DoorClosed className="w-3.5 h-3.5 text-white/60" />
                ) : (
                  <DoorOpen className="w-3.5 h-3.5 text-emerald-400" />
                )}
              </button>
            )}

            {/* Expand toggle */}
            <button
              onClick={() => setExpanded(!expanded)}
              className="p-1 rounded hover:bg-white/10 transition-colors"
              data-testid={`camera-expand-${id}`}
            >
              {expanded ? (
                <Minimize2 className="w-3.5 h-3.5 text-white/60" />
              ) : (
                <Maximize2 className="w-3.5 h-3.5 text-white/60" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Motion detection overlay flash */}
      {status === "motion" && (
        <div className="absolute inset-0 border-2 border-amber-500/50 rounded-lg pointer-events-none animate-pulse" />
      )}
    </div>
  );
}

// Grid of camera feeds for the CC
interface CameraGridProps {
  cameras: CameraFeedProps[];
  compact?: boolean;
}

export function CameraGrid({ cameras, compact = true }: CameraGridProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {cameras.map((cam) => (
        <CameraWidget key={cam.id} {...cam} compact={compact} />
      ))}
    </div>
  );
}
