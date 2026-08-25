/**
 * Weather API Handler
 * Supports multiple weather APIs with fallback
 */

class WeatherAPI {
    constructor() {
        this.cache = new Map();
    }

    /**
     * Get weather data using Open-Meteo API (free, no key required)
     */
    async getWeatherByCoordinates(lat, lon, units = 'metric') {
        const cacheKey = `weather_${lat}_${lon}_${units}`;
        
        // Check cache
        if (this.cache.has(cacheKey)) {
            const cached = this.cache.get(cacheKey);
            if (Date.now() - cached.timestamp < API_CONFIG.CACHE_DURATION) {
                return cached.data;
            }
        }

        try {
            const params = new URLSearchParams({
                latitude: lat,
                longitude: lon,
                current: 'temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m,weather_code,is_day',
                hourly: 'temperature_2m,weather_code,wind_speed_10m',
                daily: 'weather_code,temperature_2m_max,temperature_2m_min,wind_speed_10m_max,precipitation_sum',
                timezone: 'auto',
                temperature_unit: units === 'metric' ? 'celsius' : 'fahrenheit',
                wind_speed_unit: units === 'metric' ? 'kmh' : 'mph',
                precipitation_unit: 'mm'
            });

            const response = await fetch(`${API_CONFIG.BASE_URL}?${params}`);
            
            if (!response.ok) {
                throw new Error(`Weather API error: ${response.statusText}`);
            }

            const data = await response.json();
            const weatherData = this.parseOpenMeteoData(data, units);

            // Cache the result
            this.cache.set(cacheKey, {
                data: weatherData,
                timestamp: Date.now()
            });

            return weatherData;
        } catch (error) {
            console.error('Error fetching weather data:', error);
            throw error;
        }
    }

    /**
     * Parse Open-Meteo API response
     */
    parseOpenMeteoData(data, units) {
        const current = data.current;
        const hourly = data.hourly;
        const daily = data.daily;
        const unitSymbol = units === 'metric' ? '°C' : '°F';
        const windUnit = units === 'metric' ? 'm/s' : 'mph';

        return {
            current: {
                temp: Math.round(current.temperature_2m),
                feels_like: Math.round(current.temperature_2m),
                humidity: current.relative_humidity_2m,
                wind_speed: Math.round(current.wind_speed_10m * 10) / 10,
                description: this.getWeatherDescription(current.weather_code),
                icon: this.getWeatherIcon(current.weather_code, current.is_day),
                weather_code: current.weather_code
            },
            hourly: this.parseHourlyData(hourly),
            daily: this.parseDailyData(daily),
            units: { temp: unitSymbol, wind: windUnit }
        };
    }

    /**
     * Parse hourly forecast data
     */
    parseHourlyData(hourly) {
        const forecasts = [];
        const now = new Date();
        
        for (let i = 0; i < 24; i++) {
            const time = new Date(now.getTime() + i * 60 * 60 * 1000);
            forecasts.push({
                time: time.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
                temp: Math.round(hourly.temperature_2m[i]),
                description: this.getWeatherDescription(hourly.weather_code[i]),
                icon: this.getWeatherIcon(hourly.weather_code[i], true),
                wind_speed: Math.round(hourly.wind_speed_10m[i] * 10) / 10
            });
        }
        
        return forecasts;
    }

    /**
     * Parse daily forecast data
     */
    parseDailyData(daily) {
        const forecasts = [];
        
        for (let i = 0; i < daily.time.length; i++) {
            const date = new Date(daily.time[i]);
            forecasts.push({
                date: date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }),
                max_temp: Math.round(daily.temperature_2m_max[i]),
                min_temp: Math.round(daily.temperature_2m_min[i]),
                description: this.getWeatherDescription(daily.weather_code[i]),
                icon: this.getWeatherIcon(daily.weather_code[i], true),
                precipitation: daily.precipitation_sum[i]
            });
        }
        
        return forecasts;
    }

    /**
     * Get weather description from WMO code
     */
    getWeatherDescription(code) {
        const descriptions = {
            0: 'Clear sky',
            1: 'Mainly clear',
            2: 'Partly cloudy',
            3: 'Overcast',
            45: 'Foggy',
            48: 'Depositing rime fog',
            51: 'Light drizzle',
            53: 'Moderate drizzle',
            55: 'Dense drizzle',
            61: 'Slight rain',
            63: 'Moderate rain',
            65: 'Heavy rain',
            71: 'Slight snow',
            73: 'Moderate snow',
            75: 'Heavy snow',
            77: 'Snow grains',
            80: 'Slight rain showers',
            81: 'Moderate rain showers',
            82: 'Violent rain showers',
            85: 'Slight snow showers',
            86: 'Heavy snow showers',
            95: 'Thunderstorm',
            96: 'Thunderstorm with hail',
            99: 'Thunderstorm with heavy hail'
        };
        return descriptions[code] || 'Unknown';
    }

    /**
     * Get weather icon emoji/class based on code and day/night
     */
    getWeatherIcon(code, isDay) {
        if (code === 0 || code === 1) return isDay ? '☀️' : '🌙';
        if (code === 2 || code === 3) return isDay ? '⛅' : '🌥️';
        if ([45, 48].includes(code)) return '🌫️';
        if ([51, 53, 55, 80, 81, 82].includes(code)) return '🌧️';
        if ([61, 63, 65].includes(code)) return '🌧️';
        if ([71, 73, 75, 77, 85, 86].includes(code)) return '❄️';
        if ([95, 96, 99].includes(code)) return '⛈️';
        return '🌤️';
    }

    /**
     * Search for city/location
     */
    async searchLocation(query) {
        if (!query || query.length < 2) return [];

        try {
            const params = new URLSearchParams({
                name: query,
                count: 10,
                language: 'en',
                format: 'json'
            });

            const response = await fetch(`${API_CONFIG.GEOCODING_URL}?${params}`);
            
            if (!response.ok) {
                throw new Error(`Geocoding API error: ${response.statusText}`);
            }

            const data = await response.json();
            
            return (data.results || []).map(result => ({
                name: result.name,
                country: result.country,
                admin1: result.admin1 || '',
                lat: result.latitude,
                lon: result.longitude,
                displayName: `${result.name}${result.admin1 ? ', ' + result.admin1 : ''}, ${result.country}`
            }));
        } catch (error) {
            console.error('Error searching locations:', error);
            return [];
        }
    }

    /**
     * Get user's current location
     */
    getCurrentLocation() {
        return new Promise((resolve, reject) => {
            if (!navigator.geolocation) {
                reject(new Error('Geolocation is not supported by this browser'));
            }

            navigator.geolocation.getCurrentPosition(
                position => {
                    resolve({
                        lat: position.coords.latitude,
                        lon: position.coords.longitude
                    });
                },
                error => {
                    reject(new Error(`Geolocation error: ${error.message}`));
                }
            );
        });
    }

    /**
     * Reverse geocoding - get location name from coordinates
     */
    async getLocationName(lat, lon) {
        try {
            const params = new URLSearchParams({
                latitude: lat,
                longitude: lon,
                format: 'json'
            });

            // Using open-meteo reverse geocoding
            const response = await fetch(`https://nominatim.openstreetmap.org/reverse?${params}`);
            
            if (!response.ok) {
                throw new Error('Reverse geocoding error');
            }

            const data = await response.json();
            return data.address?.city || data.address?.town || data.address?.county || 'Unknown Location';
        } catch (error) {
            console.error('Error getting location name:', error);
            return 'Unknown Location';
        }
    }
}

const weatherAPI = new WeatherAPI();
