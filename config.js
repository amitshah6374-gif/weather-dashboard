// Weather API Configuration
const API_CONFIG = {
    // Using Open-Meteo API (free, no API key required)
    // For production, you can use OpenWeatherMap or other services
    BASE_URL: 'https://api.open-meteo.com/v1/forecast',
    GEOCODING_URL: 'https://geocoding-api.open-meteo.com/v1/search',
    
    // Alternative: OpenWeatherMap (requires API key)
    // Get free API key from: https://openweathermap.org/api
    OPENWEATHER_URL: 'https://api.openweathermap.org/data/2.5',
    OPENWEATHER_API_KEY: 'YOUR_OPENWEATHER_API_KEY_HERE', // Replace with your key
    
    // Cache duration in milliseconds (15 minutes)
    CACHE_DURATION: 15 * 60 * 1000,
    
    // Maximum saved locations
    MAX_SAVED_LOCATIONS: 5
};

// Default locations to show on load
const DEFAULT_LOCATIONS = [
    { name: 'London', lat: 51.5074, lon: -0.1278 },
    { name: 'New York', lat: 40.7128, lon: -74.0060 },
    { name: 'Tokyo', lat: 35.6762, lon: 139.6503 }
];
