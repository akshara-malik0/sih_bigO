import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import { io, Socket } from "socket.io-client";

const BACKEND_URL = "http://localhost:8000";

interface SensorData {
  time: string;
  temperature: number | null;
  humidity: number | null;
  co2: number | null;
  h2s: number | null;
  nh3: number | null;
}

interface ImageData {
  filename: string;
  timestamp: string;
  url: string;
}

interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
  sensorData: SensorData | null;
  latestImage: ImageData | null;
}

const SocketContext = createContext<SocketContextType>({
  socket: null,
  isConnected: false,
  sensorData: null,
  latestImage: null,
});

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error("useSocket must be used within a SocketProvider");
  }
  return context;
};

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [sensorData, setSensorData] = useState<SensorData | null>(null);
  const [latestImage, setLatestImage] = useState<ImageData | null>(null);

  useEffect(() => {
    console.log("🔌 Initializing single Socket.IO connection...");

    const newSocket = io(BACKEND_URL, {
      transports: ["polling", "websocket"],
      reconnectionDelay: 1000,
      reconnection: true,
      reconnectionAttempts: 10,
      timeout: 10000,
    });

    newSocket.on("connect", () => {
      console.log("✅ Socket connected globally - ID:", newSocket.id);
      setIsConnected(true);
    });

    newSocket.on("disconnect", (reason) => {
      console.log("❌ Socket disconnected:", reason);
      setIsConnected(false);
    });

    newSocket.on("connect_error", (error) => {
      console.error("❌ Connection Error:", error.message);
    });

    // Listen for sensor data
    newSocket.on("sensor_data", (data: any) => {
      console.log("📊 Sensor data received:", data);
      setSensorData({
        time: data.time,
        temperature: data.temperature ?? null,
        humidity: data.humidity ?? null,
        co2: data.co2 ?? null,
        h2s: data.h2s ?? null,
        nh3: data.nh3 ?? null,
      });
    });

    // Listen for new images
    newSocket.on("new_image", (data: any) => {
      console.log("📸 New image received:", data);
      setLatestImage({
        filename: data.filename,
        timestamp: data.timestamp,
        url: data.url,
      });
    });

    setSocket(newSocket);

    // Cleanup: disconnect only when app unmounts (never in normal use)
    return () => {
      console.log("🔌 Cleaning up socket connection...");
      newSocket.disconnect();
    };
  }, []); // Empty dependency array - runs ONCE

  return (
    <SocketContext.Provider
      value={{ socket, isConnected, sensorData, latestImage }}
    >
      {children}
    </SocketContext.Provider>
  );
};
