export interface StorageBox {
  id: string;
  status: 'healthy' | 'spoilage';
  temperature: number;
  humidity: number;
  gasLevel: number;
  onionHealth: string;
  lastUpdated: string;
}

export interface SensorData {
  temperature: number;
  humidity: number;
  gasLevel: number;
  onionHealth: string;
  time: string;
}

export interface User {
  email: string;
  name: string;
}