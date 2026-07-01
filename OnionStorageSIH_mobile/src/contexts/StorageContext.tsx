import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { StorageBox, SensorData } from '../types';

interface StorageContextType {
  boxes: StorageBox[];
  getBoxById: (id: string) => StorageBox | undefined;
  updateBoxData: (id: string, data: Partial<SensorData>) => void;
  getBoxHistory: (id: string) => SensorData[];
}

const StorageContext = createContext<StorageContextType | undefined>(undefined);

export const useStorage = () => {
  const context = useContext(StorageContext);
  if (!context) {
    throw new Error('useStorage must be used within a StorageProvider');
  }
  return context;
};

interface StorageProviderProps {
  children: ReactNode;
}

// Generate initial mock data for storage boxes
const generateInitialBoxes = (): StorageBox[] => {
  const boxes: StorageBox[] = [];
  const rows = ['A', 'B', 'C', 'D'];
  const cols = 8;

  for (const row of rows) {
    for (let col = 1; col <= cols; col++) {
      const id = `${row}${col}`;
      const isHealthy = Math.random() > 0.2; // 80% healthy, 20% spoilage
      
      boxes.push({
        id,
        status: isHealthy ? 'healthy' : 'spoilage',
        temperature: isHealthy ? 16 + Math.random() * 3 : 20 + Math.random() * 5,
        humidity: isHealthy ? 65 + Math.random() * 10 : 80 + Math.random() * 15,
        gasLevel: isHealthy ? 80 + Math.random() * 20 : 120 + Math.random() * 30,
        onionHealth: isHealthy ? 'Healthy' : 'Spoilage Detected',
        lastUpdated: new Date().toISOString(),
      });
    }
  }

  return boxes;
};

// Generate mock historical data for charts
const generateBoxHistory = (boxId: string): SensorData[] => {
  const history: SensorData[] = [];
  const now = new Date();
  
  for (let i = 9; i >= 0; i--) {
    const time = new Date(now.getTime() - i * 60000); // 1 minute intervals
    const isHealthy = Math.random() > 0.3;
    
    history.push({
      time: time.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
      }),
      temperature: isHealthy ? 16 + Math.random() * 3 : 20 + Math.random() * 5,
      humidity: isHealthy ? 65 + Math.random() * 10 : 80 + Math.random() * 15,
      gasLevel: isHealthy ? 80 + Math.random() * 20 : 120 + Math.random() * 30,
      onionHealth: isHealthy ? 'Healthy' : 'Spoilage Detected',
    });
  }
  
  return history;
};

export const StorageProvider: React.FC<StorageProviderProps> = ({ children }) => {
  const [boxes, setBoxes] = useState<StorageBox[]>([]);
  const [boxHistories, setBoxHistories] = useState<Record<string, SensorData[]>>({});

  useEffect(() => {
    const initialBoxes = generateInitialBoxes();
    setBoxes(initialBoxes);

    // Generate initial histories for all boxes
    const histories: Record<string, SensorData[]> = {};
    initialBoxes.forEach(box => {
      histories[box.id] = generateBoxHistory(box.id);
    });
    setBoxHistories(histories);

    // Simulate real-time updates
    const interval = setInterval(() => {
      setBoxes(prevBoxes => 
        prevBoxes.map(box => {
          const shouldUpdate = Math.random() > 0.7; // 30% chance to update each box
          if (!shouldUpdate) return box;

          const isHealthy = Math.random() > 0.2;
          return {
            ...box,
            status: isHealthy ? 'healthy' : 'spoilage',
            temperature: isHealthy ? 16 + Math.random() * 3 : 20 + Math.random() * 5,
            humidity: isHealthy ? 65 + Math.random() * 10 : 80 + Math.random() * 15,
            gasLevel: isHealthy ? 80 + Math.random() * 20 : 120 + Math.random() * 30,
            onionHealth: isHealthy ? 'Healthy' : 'Spoilage Detected',
            lastUpdated: new Date().toISOString(),
          };
        })
      );
    }, 5000); // Update every 5 seconds

    return () => clearInterval(interval);
  }, []);

  const getBoxById = (id: string): StorageBox | undefined => {
    return boxes.find(box => box.id === id);
  };

  const updateBoxData = (id: string, data: Partial<SensorData>) => {
    setBoxes(prevBoxes =>
      prevBoxes.map(box =>
        box.id === id
          ? {
              ...box,
              ...data,
              status: (data.gasLevel && data.gasLevel > 120) || 
                     (data.temperature && data.temperature > 20) || 
                     (data.humidity && data.humidity > 80) 
                     ? 'spoilage' : 'healthy',
              lastUpdated: new Date().toISOString(),
            }
          : box
      )
    );
  };

  const getBoxHistory = (id: string): SensorData[] => {
    return boxHistories[id] || [];
  };

  return (
    <StorageContext.Provider value={{ boxes, getBoxById, updateBoxData, getBoxHistory }}>
      {children}
    </StorageContext.Provider>
  );
};