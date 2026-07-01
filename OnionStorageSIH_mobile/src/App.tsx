import React, { useState, useEffect } from "react";
import { LanguageProvider } from "./contexts/LanguageContext";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { StorageProvider } from "./contexts/StorageContext";
import LoginScreen from "./screens/LoginScreen";
import GridViewScreen from "./screens/GridViewScreen";
import BoxDashboardScreen from "./screens/BoxDashboardScreen";
import MyAccountScreen from "./screens/MyAccountScreen";
import LanguageModal from "./components/LanguageModal";

type Screen = "login" | "grid" | "dashboard" | "account";

interface AppState {
  currentScreen: Screen;
  selectedBoxId: string | null;
}

const AppContent: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const [appState, setAppState] = useState<AppState>({
    currentScreen: isAuthenticated ? "grid" : "login",
    selectedBoxId: null,
  });

  const handleLogin = () => {
    setAppState({
      currentScreen: "grid",
      selectedBoxId: null,
    });
  };

  const handleBoxSelect = (boxId: string) => {
    setAppState({
      currentScreen: "dashboard",
      selectedBoxId: boxId,
    });
  };

  const handleBackToGrid = () => {
    setAppState({
      currentScreen: "grid",
      selectedBoxId: null,
    });
  };

  const handleNavigateToAccount = () => {
    setAppState({
      currentScreen: "account",
      selectedBoxId: null,
    });
  };

  const handleNavigateToGrid = () => {
    setAppState({
      currentScreen: "grid",
      selectedBoxId: null,
    });
  };

  if (!isAuthenticated) {
    return <LoginScreen onLogin={handleLogin} />;
  }

  return (
    <>
      {/* -------------------------- FIX #2 -------------------------- */}
      {/* Hide LanguageModal only on dashboard screen */}
      <LanguageModal />

      {/* ------------------------------------------------------------ */}

      {/* Main Content */}
      {appState.currentScreen === "grid" && (
        <GridViewScreen
          onBoxSelect={handleBoxSelect}
          onNavigateToAccount={handleNavigateToAccount}
        />
      )}

      {/* -------------------------- FIX #3 -------------------------- */}
      {appState.currentScreen === "dashboard" && appState.selectedBoxId && (
        <BoxDashboardScreen
          boxId={appState.selectedBoxId}
          onBack={handleBackToGrid}
        />
      )}
      {/* ------------------------------------------------------------ */}

      {appState.currentScreen === "account" && (
        <MyAccountScreen
          onBack={handleBackToGrid}
          onNavigateToGrid={handleNavigateToGrid}
          onNavigateToBox={handleBoxSelect}
        />
      )}
    </>
  );
};

function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <StorageProvider>
          <div className="font-exo">
            <AppContent />
          </div>
        </StorageProvider>
      </AuthProvider>
    </LanguageProvider>
  );
}

export default App;
