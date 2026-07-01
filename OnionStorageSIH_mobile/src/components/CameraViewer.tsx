import React, { useState, useEffect } from "react";
import {
  Camera,
  Download,
  Trash2,
  AlertTriangle,
  CheckCircle,
} from "lucide-react";
import TranslatedText from "./TranslatedText";
import { useLanguage } from "../contexts/LanguageContext";
import { io, Socket } from "socket.io-client";

interface CapturedImage {
  id: string;
  timestamp: string;
  url: string;
  name: string;
  boxId: string;
  trigger: string;
  value: string;
  imageBase64?: string;
}

interface CameraViewerProps {
  boxId: string;
  temperature: number;
  humidity: number;
  gasLevel: number;
}

const CameraViewer: React.FC<CameraViewerProps> = ({
  boxId,
  temperature,
  humidity,
  gasLevel,
}) => {
  const { translateText } = useLanguage();

  const [capturedImages, setCapturedImages] = useState<CapturedImage[]>([]);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  const [notification, setNotification] = useState<{
    show: boolean;
    message: string;
    type: "success" | "error" | "warning";
  }>({
    show: false,
    message: "",
    type: "success",
  });

  // 🔥 FIXED — One backend URL everywhere
  const BACKEND_URL = "http://localhost:8000";

  const showNotification = (
    message: string,
    type: "success" | "error" | "warning" = "success"
  ) => {
    setNotification({ show: true, message, type });
    setTimeout(
      () =>
        setNotification({
          show: false,
          message: "",
          type: "success",
        }),
      4000
    );
  };

  // Connect to backend
  useEffect(() => {
    const newSocket = io(BACKEND_URL, {
      transports: ["websocket", "polling"],
    });

    newSocket.on("connect", () => {
      console.log("✅ Connected to backend");
      setIsConnected(true);
      showNotification("Connected to camera feed", "success");
    });

    newSocket.on("disconnect", () => {
      console.log("❌ Disconnected from backend");
      setIsConnected(false);
    });

    newSocket.on("new_image", (data: any) => {
      console.log("📸 New image received:", data);

      const newImage: CapturedImage = {
        id: `img_${Date.now()}`,
        timestamp: data.timestamp,
        url: `${BACKEND_URL}${data.url}`, // FIXED
        name: data.filename,
        boxId: boxId,
        trigger: "Alert from ESP32-CAM",
        value: `T: ${temperature}°C, H: ${humidity}%, G: ${gasLevel}ppm`,
      };

      setCapturedImages((prev) => [newImage, ...prev].slice(0, 20));
      showNotification("⚠️ New alert captured!", "warning");
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, [boxId, temperature, humidity, gasLevel]);

  // Fetch existing images on load
  useEffect(() => {
    const fetchExistingImages = async () => {
      try {
        // 🔥 FIXED URL — no double /images/images
        const response = await fetch(`${BACKEND_URL}/images`);

        if (response.ok) {
          const data = await response.json();

          const formatted = data.images.map((img: any, index: number) => ({
            id: `existing_${index}`,
            timestamp: img.timestamp,
            url: `${BACKEND_URL}${img.url}`, // FIXED
            name: img.filename,
            boxId,
            trigger: "Previous Alert",
            value: "Historical capture",
          }));

          setCapturedImages(formatted);
        }
      } catch (error) {
        console.log("❌ Failed to fetch existing images:", error);
      }
    };

    fetchExistingImages();
  }, [boxId]);

  const handleDownloadImage = (url: string, name: string) => {
    const link = document.createElement("a");
    link.href = url;
    link.download = name;
    link.click();
    showNotification("Image downloaded successfully", "success");
  };

  const handleDeleteImage = (id: string) => {
    setCapturedImages((prev) => prev.filter((img) => img.id !== id));
    showNotification("Image removed from dashboard", "success");
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="flex items-center space-x-2">
            <TranslatedText
              as="h3"
              text="ESP32-CAM Surveillance"
              className="text-lg font-semibold text-gray-900"
            />

            {isConnected ? (
              <span className="flex items-center space-x-1 px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                <TranslatedText text="Live" />
              </span>
            ) : (
              <span className="flex items-center space-x-1 px-2 py-1 bg-gray-100 text-gray-700 text-xs font-medium rounded-full">
                <div className="w-2 h-2 bg-gray-500 rounded-full" />
                <TranslatedText text="Offline" />
              </span>
            )}
          </div>

          <TranslatedText
            as="p"
            text="Receiving alerts from ESP32-CAM device"
            className="text-sm text-gray-600 mt-1"
          />
        </div>

        <div
          className={`px-4 py-2 rounded-lg ${
            capturedImages.length > 0
              ? "bg-red-50 border border-red-200"
              : "bg-green-50 border-green-200"
          }`}
        >
          <div className="text-center">
            <div
              className={`text-xs font-medium ${
                capturedImages.length > 0 ? "text-red-700" : "text-green-700"
              }`}
            >
              {capturedImages.length > 0 ? (
                <TranslatedText text="ALERTS DETECTED" />
              ) : (
                <TranslatedText text="NO ALERTS" />
              )}
            </div>

            <div className="text-xs text-gray-600 mt-0.5">
              <TranslatedText
                text="{count} images stored"
                values={{ count: capturedImages.length }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Notification */}
      {notification.show && (
        <div
          className={`mb-4 p-3 rounded-lg border-l-4 ${
            notification.type === "success"
              ? "bg-green-50 border-green-400 text-green-800"
              : notification.type === "error"
              ? "bg-red-50 border-red-400 text-red-800"
              : "bg-yellow-50 border-yellow-400 text-yellow-800"
          }`}
        >
          <div className="flex items-center space-x-2">
            {notification.type === "warning" && (
              <AlertTriangle className="w-4 h-4" />
            )}
            {notification.type === "success" && (
              <CheckCircle className="w-4 h-4" />
            )}
            <span className="text-sm font-medium">{notification.message}</span>
          </div>
        </div>
      )}

      {/* Image Grid */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <TranslatedText
            as="h4"
            text="Alert Captures"
            className="text-md font-semibold text-gray-900"
          />
          <span className="text-sm text-gray-500">
            <TranslatedText
              text="{count} images"
              values={{ count: capturedImages.length }}
            />
          </span>
        </div>

        {capturedImages.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {capturedImages.map((img) => (
              <div key={img.id} className="relative group">
                <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden border-2 border-red-200">
                  <img
                    src={img.url}
                    alt={img.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src =
                        "https://placehold.co/200?text=Missing";
                    }}
                  />
                </div>

                {/* Hover Buttons */}
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 rounded-lg flex items-center justify-center">
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleDownloadImage(img.url, img.name)}
                      className="p-2 bg-white/20 hover:bg-white/30 rounded-full text-white"
                    >
                      <Download className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => handleDeleteImage(img.id)}
                      className="p-2 bg-red-500/80 hover:bg-red-500 rounded-full text-white"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="mt-2 text-xs space-y-1">
                  <div className="text-gray-900 font-medium truncate">
                    ⚠️ {img.trigger}
                  </div>
                  <div className="text-gray-500">{img.value}</div>
                  <div className="text-gray-400">{img.timestamp}</div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-gray-500 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
            <Camera className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <TranslatedText
              text="No alerts captured yet"
              className="text-sm font-medium"
            />
            <p className="text-xs text-gray-400 mt-1">
              {isConnected
                ? "Waiting for ESP32-CAM to send alert images"
                : "Connecting to backend..."}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CameraViewer;
