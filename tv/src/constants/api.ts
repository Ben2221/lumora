import Constants from 'expo-constants';

// Parse Metro host to find development machine's local IP (e.g., 192.168.1.14)
// This enables physical test devices to connect to Next.js API automatically
const hostUri = Constants.expoConfig?.hostUri || '';
const localIp = hostUri.split(':')[0] || 'localhost';

export const API_BASE_URL = `http://${localIp}:3000`;

console.log('[API] Dynamically resolved server base URL:', API_BASE_URL);
