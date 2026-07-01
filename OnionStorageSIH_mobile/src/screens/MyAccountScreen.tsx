import React, { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useStorage } from "../contexts/StorageContext";
import { useLanguage } from "../contexts/LanguageContext";
import TranslatedText from "../components/TranslatedText";
import {
  ArrowLeft,
  User as UserIcon,
  Mail,
  Phone,
  Edit2,
  Save,
  X,
  Grid,
  Plus,
  Camera,
  LogOut,
  Globe,
  Bell,
  Clock,
  Box,
  AlertCircle,
  CheckCircle,
} from "lucide-react";

interface MyAccountScreenProps {
  onBack: () => void;
  onNavigateToGrid: () => void;
  onNavigateToBox: (boxId: string) => void;
}

const MyAccountScreen: React.FC<MyAccountScreenProps> = ({
  onBack,
  onNavigateToGrid,
  onNavigateToBox,
}) => {
  const { user, updateUser, logout } = useAuth();

  // FIX #1: Add safety check for storage context
  const storage = useStorage();
  const getBoxesForUser = storage?.getBoxesForUser || (() => []);
  const recentActions = storage?.recentActions || [];

  // FIX #2: Add safety check for language context
  const languageContext = useLanguage();
  const currentLanguage = languageContext?.currentLanguage || {
    nativeName: "English",
    code: "en",
  };
  const setShowLanguageModal =
    languageContext?.setShowLanguageModal || (() => {});

  const [isEditing, setIsEditing] = useState(false);

  // FIX #3: Handle potential undefined user properties safely
  const [editedUser, setEditedUser] = useState({
    name: user?.name || "",
    email: user?.email || "",
    phone: (user as any)?.phone || "", // Cast to any if phone isn't in User type yet
  });

  const [preferences, setPreferences] = useState({
    notifications: true,
    emailAlerts: true,
    smsAlerts: false,
  });

  // FIX #4: Ensure userBoxes is always an array
  const userBoxes = getBoxesForUser() || [];

  const healthyBoxes = userBoxes.filter((box) => box.status === "healthy");
  const spoilageBoxes = userBoxes.filter((box) => box.status === "spoilage");

  const handleSave = () => {
    // Only call update if the function exists
    if (updateUser) {
      updateUser(editedUser);
    }
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditedUser({
      name: user?.name || "",
      email: user?.email || "",
      phone: (user as any)?.phone || "",
    });
    setIsEditing(false);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "success":
        return (
          <span className="flex items-center space-x-1 px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
            <CheckCircle className="w-3 h-3" />
            <TranslatedText text="Success" />
          </span>
        );
      case "pending":
        return (
          <span className="flex items-center space-x-1 px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-800 rounded-full">
            <Clock className="w-3 h-3" />
            <TranslatedText text="Pending" />
          </span>
        );
      case "failed":
        return (
          <span className="flex items-center space-x-1 px-2 py-1 text-xs font-medium bg-red-100 text-red-800 rounded-full">
            <AlertCircle className="w-3 h-3" />
            <TranslatedText text="Failed" />
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <button
                onClick={onBack}
                className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div className="flex items-center space-x-3">
                <img
                  src="/onion.png"
                  className="w-8 h-8"
                  alt="Onion Storage Logo"
                />
                <div>
                  <h1 className="text-xl font-bold text-gray-900">
                    <TranslatedText text="My Account" />
                  </h1>
                  <p className="text-sm text-gray-600">
                    <TranslatedText text="Manage your profile and preferences" />
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {/* Profile Info Section */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-gray-900">
                  <TranslatedText text="Profile Information" />
                </h2>
                {!isEditing ? (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-purple-600 hover:text-purple-700 hover:bg-purple-50 rounded-lg transition-colors"
                  >
                    <Edit2 className="w-4 h-4" />
                    <TranslatedText text="Edit" />
                  </button>
                ) : (
                  <div className="flex space-x-2">
                    <button
                      onClick={handleSave}
                      className="flex items-center space-x-2 px-4 py-2 text-sm font-medium bg-purple-600 text-white hover:bg-purple-700 rounded-lg transition-colors"
                    >
                      <Save className="w-4 h-4" />
                      <TranslatedText text="Save" />
                    </button>
                    <button
                      onClick={handleCancel}
                      className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      <X className="w-4 h-4" />
                      <TranslatedText text="Cancel" />
                    </button>
                  </div>
                )}
              </div>

              <div className="flex items-start space-x-6">
                <div className="flex-shrink-0">
                  <div className="w-24 h-24 bg-purple-100 rounded-full flex items-center justify-center">
                    <UserIcon className="w-12 h-12 text-purple-600" />
                  </div>
                </div>

                <div className="flex-1 space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <TranslatedText text="Name" />
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={editedUser.name}
                        onChange={(e) =>
                          setEditedUser({ ...editedUser, name: e.target.value })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      />
                    ) : (
                      <p className="text-gray-900">{user?.name}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <TranslatedText text="Email" />
                    </label>
                    <div className="flex items-center space-x-2">
                      <Mail className="w-4 h-4 text-gray-400" />
                      {isEditing ? (
                        <input
                          type="email"
                          value={editedUser.email}
                          onChange={(e) =>
                            setEditedUser({
                              ...editedUser,
                              email: e.target.value,
                            })
                          }
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        />
                      ) : (
                        <p className="text-gray-900">{user?.email}</p>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <TranslatedText text="Phone" />
                    </label>
                    <div className="flex items-center space-x-2">
                      <Phone className="w-4 h-4 text-gray-400" />
                      {isEditing ? (
                        <input
                          type="tel"
                          value={editedUser.phone}
                          onChange={(e) =>
                            setEditedUser({
                              ...editedUser,
                              phone: e.target.value,
                            })
                          }
                          placeholder="+91 1234567890"
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        />
                      ) : (
                        <p className="text-gray-900">
                          {(user as any)?.phone ? (
                            (user as any).phone
                          ) : (
                            <TranslatedText text="Not provided" />
                          )}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                <TranslatedText text="Quick Actions" />
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <button
                  onClick={onNavigateToGrid}
                  className="flex flex-col items-center justify-center p-6 border-2 border-gray-200 rounded-lg hover:border-purple-300 hover:bg-purple-50 transition-all"
                >
                  <Grid className="w-8 h-8 text-purple-600 mb-2" />
                  <span className="text-sm font-medium text-gray-900">
                    <TranslatedText text="View My Grid" />
                  </span>
                </button>

                <button
                  onClick={() => alert("Add Box feature coming soon")}
                  className="flex flex-col items-center justify-center p-6 border-2 border-gray-200 rounded-lg hover:border-purple-300 hover:bg-purple-50 transition-all"
                >
                  <Plus className="w-8 h-8 text-purple-600 mb-2" />
                  <span className="text-sm font-medium text-gray-900">
                    <TranslatedText text="Add Box" />
                  </span>
                </button>

                <button
                  onClick={() => alert("Camera viewer navigation coming soon")}
                  className="flex flex-col items-center justify-center p-6 border-2 border-gray-200 rounded-lg hover:border-purple-300 hover:bg-purple-50 transition-all"
                >
                  <Camera className="w-8 h-8 text-purple-600 mb-2" />
                  <span className="text-sm font-medium text-gray-900">
                    <TranslatedText text="Manage Devices" />
                  </span>
                </button>
              </div>
            </div>

            {/* Connected Boxes Stats */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                <TranslatedText text="Connected Boxes" />
              </h2>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">
                    {userBoxes.length}
                  </div>
                  <div className="text-sm text-gray-600">
                    <TranslatedText text="Total Boxes" />
                  </div>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">
                    {healthyBoxes.length}
                  </div>
                  <div className="text-sm text-gray-600">
                    <TranslatedText text="Healthy" />
                  </div>
                </div>
                <div className="bg-red-50 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-red-600">
                    {spoilageBoxes.length}
                  </div>
                  <div className="text-sm text-gray-600">
                    <TranslatedText text="Alerts" />
                  </div>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">
                    {userBoxes.length > 0
                      ? Math.round(
                          (healthyBoxes.length / userBoxes.length) * 100
                        )
                      : 0}
                    %
                  </div>
                  <div className="text-sm text-gray-600">
                    <TranslatedText text="Health Score" />
                  </div>
                </div>
              </div>

              <div className="space-y-2 max-h-64 overflow-y-auto">
                {userBoxes.slice(0, 8).map((box) => (
                  <button
                    key={box.id}
                    onClick={() => onNavigateToBox(box.id)}
                    className="w-full flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:border-purple-300 hover:bg-purple-50 transition-all"
                  >
                    <div className="flex items-center space-x-3">
                      <Box className="w-5 h-5 text-gray-400" />
                      <div className="text-left">
                        <div className="font-medium text-gray-900">
                          <TranslatedText text={`Box ${box.id}`} />
                        </div>
                        <div className="text-xs text-gray-500">
                          {box.temperature.toFixed(1)}°C,{" "}
                          {Math.round(box.humidity)}%
                        </div>
                      </div>
                    </div>
                    <div
                      className={`w-3 h-3 rounded-full ${
                        box.status === "healthy" ? "bg-green-500" : "bg-red-500"
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* Recent Activity - Fixed potential crash here */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                <TranslatedText text="Recent Activity" />
              </h2>

              <div className="space-y-3">
                {/* FIX #5: Safe navigation for recentActions */}
                {(recentActions || []).slice(0, 5).map((action) => (
                  <div
                    key={action.id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <Clock className="w-4 h-4 text-gray-400" />
                        <span className="text-sm font-medium text-gray-900">
                          <TranslatedText text={action.action} />
                        </span>
                      </div>
                      <div className="mt-1 text-xs text-gray-500">
                        {action.boxId && (
                          <span>
                            <TranslatedText text="Box" /> {action.boxId} •{" "}
                          </span>
                        )}
                        {new Date(action.timestamp).toLocaleString()}
                      </div>
                      {action.oldValue !== "-" && (
                        <div className="mt-1 text-xs text-gray-600">
                          <span className="text-red-600">
                            {action.oldValue}
                          </span>
                          {" → "}
                          <span className="text-green-600">
                            {action.newValue}
                          </span>
                        </div>
                      )}
                    </div>
                    <div>{getStatusBadge(action.status)}</div>
                  </div>
                ))}

                {(!recentActions || recentActions.length === 0) && (
                  <div className="text-center text-gray-500 text-sm py-4">
                    <TranslatedText text="No recent activity" />
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                <TranslatedText text="Preferences" />
              </h2>

              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      <Globe className="w-5 h-5 text-purple-600" />
                      <span className="font-medium text-gray-900">
                        <TranslatedText text="Language" />
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowLanguageModal(true)}
                    className="w-full px-4 py-2 text-left border border-gray-300 rounded-lg hover:border-purple-300 hover:bg-purple-50 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-gray-900">
                        {currentLanguage?.nativeName || "English"}
                      </span>
                      <span className="text-sm text-gray-500">
                        {currentLanguage?.code?.toUpperCase() || "EN"}
                      </span>
                    </div>
                  </button>
                </div>

                <div className="pt-4 border-t border-gray-200">
                  <div className="flex items-center space-x-2 mb-3">
                    <Bell className="w-5 h-5 text-purple-600" />
                    <span className="font-medium text-gray-900">
                      <TranslatedText text="Notifications" />
                    </span>
                  </div>

                  <div className="space-y-3">
                    {/* Notification Toggles */}
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-700">
                        <TranslatedText text="Push Notifications" />
                      </span>
                      <button
                        onClick={() =>
                          setPreferences({
                            ...preferences,
                            notifications: !preferences.notifications,
                          })
                        }
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                          preferences.notifications
                            ? "bg-purple-600"
                            : "bg-gray-300"
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            preferences.notifications
                              ? "translate-x-6"
                              : "translate-x-1"
                          }`}
                        />
                      </button>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-700">
                        <TranslatedText text="Email Alerts" />
                      </span>
                      <button
                        onClick={() =>
                          setPreferences({
                            ...preferences,
                            emailAlerts: !preferences.emailAlerts,
                          })
                        }
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                          preferences.emailAlerts
                            ? "bg-purple-600"
                            : "bg-gray-300"
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            preferences.emailAlerts
                              ? "translate-x-6"
                              : "translate-x-1"
                          }`}
                        />
                      </button>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-700">
                        <TranslatedText text="SMS Alerts" />
                      </span>
                      <button
                        onClick={() =>
                          setPreferences({
                            ...preferences,
                            smsAlerts: !preferences.smsAlerts,
                          })
                        }
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                          preferences.smsAlerts
                            ? "bg-purple-600"
                            : "bg-gray-300"
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            preferences.smsAlerts
                              ? "translate-x-6"
                              : "translate-x-1"
                          }`}
                        />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                <TranslatedText text="Account Actions" />
              </h2>

              <button
                onClick={logout}
                className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg transition-colors font-medium"
              >
                <LogOut className="w-5 h-5" />
                <TranslatedText text="Logout" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyAccountScreen;
