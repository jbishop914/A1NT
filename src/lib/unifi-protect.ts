// UniFi Protect API Integration Scaffold
// Connects to Ubiquiti UniFi Protect NVR for live camera feeds,
// door access control, and video intercom functionality.
//
// Setup: Set environment variables:
//   UNIFI_PROTECT_HOST    — NVR hostname/IP (e.g., 192.168.1.1)
//   UNIFI_PROTECT_PORT    — API port (default: 443)
//   UNIFI_PROTECT_USERNAME
//   UNIFI_PROTECT_PASSWORD
//   UNIFI_PROTECT_API_KEY — Optional: API key for token-based auth

export interface UnifiCamera {
  id: string;
  name: string;
  type: "UVC-G4-Pro" | "UVC-G4-Doorbell" | "UVC-G4-Bullet" | "UVC-AI-360" | string;
  state: "CONNECTED" | "DISCONNECTED" | "UPDATING";
  host: string;
  mac: string;
  isRecording: boolean;
  isDoorbell: boolean;
  lastMotion: number | null;
  lastRing: number | null; // doorbell ring timestamp
  channels: CameraChannel[];
}

export interface CameraChannel {
  id: number;
  name: string;
  width: number;
  height: number;
  fps: number;
  rtspAlias: string; // RTSP stream path
}

export interface DoorLock {
  id: string;
  name: string;
  type: "UAP-AC-Pro" | "UA-Hub" | "UA-Lite" | string;
  state: "LOCKED" | "UNLOCKED" | "UNKNOWN";
  lastAccess: number | null;
  cameraId?: string; // linked camera for video intercom
}

export interface ProtectEvent {
  id: string;
  type: "motion" | "ring" | "access" | "disconnect";
  cameraId: string;
  start: number;
  end: number | null;
  thumbnail?: string;
  score: number; // motion confidence 0-100
}

// API Client
export class UnifiProtectClient {
  private host: string;
  private port: number;
  private token: string | null = null;
  private csrfToken: string | null = null;

  constructor(
    host?: string,
    port?: number,
  ) {
    this.host = host || process.env.UNIFI_PROTECT_HOST || "localhost";
    this.port = port || Number(process.env.UNIFI_PROTECT_PORT) || 443;
  }

  private get baseUrl() {
    return `https://${this.host}:${this.port}`;
  }

  /**
   * Authenticate with UniFi Protect NVR
   * Returns a session token for subsequent requests
   */
  async authenticate(username?: string, password?: string): Promise<boolean> {
    const user = username || process.env.UNIFI_PROTECT_USERNAME;
    const pass = password || process.env.UNIFI_PROTECT_PASSWORD;

    if (!user || !pass) {
      console.warn("UniFi Protect: No credentials provided");
      return false;
    }

    try {
      const response = await fetch(`${this.baseUrl}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: user, password: pass }),
      });

      if (!response.ok) return false;

      // Extract tokens from response headers
      this.token = response.headers.get("set-cookie")?.split(";")[0] || null;
      this.csrfToken = response.headers.get("x-csrf-token") || null;

      return true;
    } catch (err) {
      console.error("UniFi Protect auth failed:", err);
      return false;
    }
  }

  /**
   * Get all cameras from the NVR
   */
  async getCameras(): Promise<UnifiCamera[]> {
    try {
      const response = await fetch(`${this.baseUrl}/proxy/protect/api/cameras`, {
        headers: this.authHeaders(),
      });
      if (!response.ok) return [];
      return response.json();
    } catch {
      return [];
    }
  }

  /**
   * Get RTSP stream URL for a camera
   * Can be used with video.js, hls.js, or native <video> element via proxy
   */
  getRtspUrl(camera: UnifiCamera, channel: number = 0): string {
    const ch = camera.channels[channel];
    if (!ch) return "";
    return `rtsp://${this.host}:7447/${ch.rtspAlias}`;
  }

  /**
   * Get a snapshot image URL for a camera
   */
  getSnapshotUrl(cameraId: string, width: number = 640): string {
    return `${this.baseUrl}/proxy/protect/api/cameras/${cameraId}/snapshot?w=${width}&force=true`;
  }

  /**
   * Get live video stream URL (RTSPS → proxied for web)
   * In production, this would go through a media proxy (e.g., go2rtc, mediamtx)
   * that converts RTSP to HLS/WebRTC for browser playback
   */
  getWebStreamUrl(cameraId: string): string {
    // This would be your media proxy endpoint
    // e.g., go2rtc running alongside the app
    const proxyHost = process.env.NEXT_PUBLIC_STREAM_PROXY_HOST || "localhost:1984";
    return `http://${proxyHost}/api/stream.mp4?src=${cameraId}`;
  }

  /**
   * Trigger door unlock via UniFi Access
   */
  async unlockDoor(doorId: string, duration: number = 5): Promise<boolean> {
    try {
      const response = await fetch(
        `${this.baseUrl}/proxy/protect/api/doorlocks/${doorId}/unlock`,
        {
          method: "POST",
          headers: {
            ...this.authHeaders(),
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ duration }),
        }
      );
      return response.ok;
    } catch {
      return false;
    }
  }

  /**
   * Get recent motion/ring events
   */
  async getEvents(
    start?: number,
    end?: number,
    limit: number = 30
  ): Promise<ProtectEvent[]> {
    const params = new URLSearchParams({
      limit: String(limit),
      ...(start && { start: String(start) }),
      ...(end && { end: String(end) }),
    });

    try {
      const response = await fetch(
        `${this.baseUrl}/proxy/protect/api/events?${params}`,
        { headers: this.authHeaders() }
      );
      if (!response.ok) return [];
      return response.json();
    } catch {
      return [];
    }
  }

  /**
   * Subscribe to real-time events via WebSocket
   */
  subscribeToEvents(
    onEvent: (event: ProtectEvent) => void
  ): WebSocket | null {
    try {
      const ws = new WebSocket(
        `wss://${this.host}:${this.port}/proxy/protect/ws/updates`
      );

      ws.onmessage = (msg) => {
        try {
          const data = JSON.parse(msg.data);
          if (data.action?.modelKey === "event") {
            onEvent(data.payload as ProtectEvent);
          }
        } catch {
          // ignore parse errors
        }
      };

      return ws;
    } catch {
      return null;
    }
  }

  private authHeaders(): Record<string, string> {
    const headers: Record<string, string> = {};
    if (this.token) headers["Cookie"] = this.token;
    if (this.csrfToken) headers["X-CSRF-Token"] = this.csrfToken;
    return headers;
  }
}

// Singleton instance
let clientInstance: UnifiProtectClient | null = null;

export function getProtectClient(): UnifiProtectClient {
  if (!clientInstance) {
    clientInstance = new UnifiProtectClient();
  }
  return clientInstance;
}
