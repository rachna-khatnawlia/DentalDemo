import { AppState, AppStateStatus } from "react-native";
import { io, Socket } from "socket.io-client";
import API_CONFIG from "../config/api.config";
import SecureStorage from "./secureStorage";

type SocketEventListener = (data: any) => void;

class SocketService {
  private socket: Socket | null = null;
  private isConnected: boolean = false;
  private listeners: Map<string, Set<SocketEventListener>> = new Map();
  private appStateSubscription: any = null;

  init() {
    this.appStateSubscription = AppState.addEventListener(
      "change",
      this.handleAppStateChange
    );
  }

  destroy() {
    if (this.appStateSubscription) {
      this.appStateSubscription.remove();
    }
    this.disconnect();
  }

  private handleAppStateChange = (nextAppState: AppStateStatus) => {
    if (nextAppState === "active") {
      this.connect();
    } else if (nextAppState === "background") {
      // Disconnect socket in background to conserve mobile battery
      this.disconnect();
    }
  };

  async connect() {
    if (this.socket && this.isConnected) return;

    const token = await SecureStorage.getToken();
    if (!token) return;

    try {
      this.socket = io(API_CONFIG.SOCKET_URL, {
        transports: ["websocket"],
        auth: { token },
        autoConnect: true,
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 2000,
        timeout: 5000,
      });

      this.socket.on("connect", () => {
        this.isConnected = true;
        console.log("[SocketService] Connected to DentaCare Realtime Gateway");
      });

      this.socket.on("disconnect", (reason) => {
        this.isConnected = false;
        console.log("[SocketService] Disconnected:", reason);
      });

      this.socket.on("connect_error", (error) => {
        this.isConnected = false;
        console.log("[SocketService] Connection error (server may be offline):", error.message);
      });

      // Bind all registered listeners
      this.listeners.forEach((callbacks, event) => {
        callbacks.forEach((cb) => {
          this.socket?.on(event, cb);
        });
      });
    } catch (e) {
      console.warn("[SocketService] Failed to initialize socket", e);
    }
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
    }
  }

  on(event: string, callback: SocketEventListener) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(callback);

    if (this.socket) {
      this.socket.on(event, callback);
    }
  }

  off(event: string, callback?: SocketEventListener) {
    if (!callback) {
      this.listeners.delete(event);
      this.socket?.off(event);
      return;
    }

    const set = this.listeners.get(event);
    if (set) {
      set.delete(callback);
      if (set.size === 0) {
        this.listeners.delete(event);
      }
    }
    this.socket?.off(event, callback);
  }

  emit(event: string, data?: any) {
    if (this.socket && this.isConnected) {
      this.socket.emit(event, data);
    }
  }
}

export const socketService = new SocketService();
export default socketService;
