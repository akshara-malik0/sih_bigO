import React, { useState } from "react";
import { useStorage } from "../contexts/StorageContext";
import { useAuth } from "../contexts/AuthContext";
import {
  LogOut,
  Search,
  Filter,
  RefreshCw,
  Check,
  AlertTriangle,
  User,
} from "lucide-react";
import TranslatedText from "../components/TranslatedText";
import LanguageSwitcher from "../components/LanguageSwitcher";
import TranslatedTextRaw from "../components/TranslatedTextRaw";

interface GridViewScreenProps {
  onBoxSelect: (boxId: string) => void;
  onNavigateToAccount: () => void;
}

const GridViewScreen: React.FC<GridViewScreenProps> = ({
  onBoxSelect,
  onNavigateToAccount,
}) => {
  const { boxes } = useStorage();
  const { user, logout } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    "all" | "healthy" | "spoilage"
  >("all");

  const filteredBoxes = boxes.filter((box) => {
    const matchesSearch = box.id
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesFilter = statusFilter === "all" || box.status === statusFilter;
    return matchesSearch && matchesFilter;
  });

  const healthyCount = boxes.filter((box) => box.status === "healthy").length;
  const spoilageCount = boxes.filter((box) => box.status === "spoilage").length;

  const getStatusStyle = (status: string) => {
    return status === "healthy"
      ? "bg-emerald-50 border-emerald-300 hover:border-emerald-500"
      : "bg-red-50 border-red-300 hover:border-red-500";
  };

  const getStatusChip = (status: string) => {
    return status === "healthy" ? (
      <span className="flex items-center gap-1 text-[10px] px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded-full">
        <Check className="w-3 h-3" /> <TranslatedText text="Healthy" />
      </span>
    ) : (
      <span className="flex items-center gap-1 text-[10px] px-2 py-0.5 bg-red-100 text-red-700 rounded-full">
        <AlertTriangle className="w-3 h-3" /> <TranslatedText text="Alert" />
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
          <div className="flex items-center gap-3">
            <img src="/onion.png" className="w-9 h-9" alt="Onion Logo" />
            <div>
              <h1 className="text-xl font-bold text-gray-900">
                <TranslatedText text="Storage Grid Overview" />
              </h1>
              <p className="text-sm text-gray-500">
                <TranslatedText text="Welcome back" />,{" "}
                <span className="font-medium">{user?.name}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => window.location.reload()}
              className="p-2 text-gray-500 hover:text-gray-800 rounded-lg hover:bg-gray-100 transition"
              title="Refresh"
            >
              <RefreshCw className="w-5 h-5" />
            </button>

            <button
              onClick={onNavigateToAccount}
              className="flex items-center space-x-2 px-4 py-2 
                           text-gray-700 hover:bg-gray-100 rounded-lg transition"
            >
              <User className="w-4 h-4" />
              <span>
                <TranslatedText text="My Account" />
              </span>
            </button>

            <button
              onClick={logout}
              className="flex items-center gap-2 px-4 py-2 rounded-lg 
              bg-gray-100 hover:bg-gray-200 text-gray-700 transition"
            >
              <LogOut className="w-4 h-4" />
              <span>
                <TranslatedText text="Logout" />
              </span>
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-5 mb-8">
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 flex items-center gap-4">
            <span className="w-10 h-10 flex items-center justify-center rounded-lg bg-blue-50 text-blue-600 font-semibold">
              #
            </span>
            <div>
              <p className="text-xs font-medium text-gray-500">
                <TranslatedText text="Total Boxes" />
              </p>
              <p className="text-2xl font-bold text-gray-900">{boxes.length}</p>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 flex items-center gap-4">
            <span className="w-10 h-10 flex items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 font-semibold">
              ✓
            </span>
            <div>
              <p className="text-xs font-medium text-gray-500">
                <TranslatedText text="Healthy" />
              </p>
              <p className="text-2xl font-bold text-gray-900">{healthyCount}</p>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 flex items-center gap-4">
            <span className="w-10 h-10 flex items-center justify-center rounded-lg bg-yellow-50 text-yellow-600 font-semibold">
              ⚠
            </span>
            <div>
              <p className="text-xs font-medium text-gray-500">
                <TranslatedText text="About to Rot" />
              </p>
              <p className="text-2xl font-bold text-gray-900">0</p>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 flex items-center gap-4">
            <span className="w-10 h-10 flex items-center justify-center rounded-lg bg-red-50 text-red-600 font-semibold">
              ✕
            </span>
            <div>
              <p className="text-xs font-medium text-gray-500">
                <TranslatedText text="Spoilage" />
              </p>
              <p className="text-2xl font-bold text-gray-900">
                {spoilageCount}
              </p>
            </div>
          </div>
        </div>

        {/* Search + Filter */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 mb-8">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search box ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-3 py-2 rounded-lg border border-gray-300 focus:border-purple-500 focus:ring-purple-500"
              />
            </div>

            <div className="flex items-center gap-2">
              <Filter className="text-gray-400 w-5 h-5" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="rounded-lg px-3 py-2 border border-gray-300 focus:border-purple-500 focus:ring-purple-500"
              >
                <option value="all">
                  <TranslatedTextRaw text="All" />
                </option>

                <option value="healthy">
                  <TranslatedTextRaw text="Healthy" />
                </option>

                <option value="spoilage">
                  <TranslatedTextRaw text="Spoilage" />
                </option>
              </select>
            </div>
          </div>
        </div>

        {/* Storage Grid */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          <div className="flex justify-between mb-5">
            <h2 className="text-lg font-semibold text-gray-800">
              <TranslatedText text="Storage Boxes" />
            </h2>
            <p className="text-sm text-gray-500">
              <TranslatedText text="Showing" /> {filteredBoxes.length}{" "}
              <TranslatedText text="of" /> {boxes.length}
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-4">
            {filteredBoxes.map((box) => (
              <button
                key={box.id}
                onClick={() => onBoxSelect(box.id)}
                className={`relative rounded-xl border-2 p-3 aspect-square 
                  flex flex-col items-center justify-center gap-1
                  hover:shadow-md transition-all duration-200 
                  ${getStatusStyle(box.status)}`}
              >
                <span className="font-bold text-xl text-gray-800">
                  {box.id}
                </span>
                {getStatusChip(box.status)}
              </button>
            ))}
          </div>

          {filteredBoxes.length === 0 && (
            <div className="text-center py-10 text-gray-500">
              <Search className="w-10 h-10 mx-auto mb-3 text-gray-400" />
              <TranslatedText text="No matching boxes found" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default GridViewScreen;
