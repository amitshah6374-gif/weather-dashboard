# Weather Dashboard

A real-time weather dashboard application that fetches data from public weather APIs and displays current conditions, hourly forecasts, and 7-day forecasts.

## Features

### Core Features
- 🌍 **Real-time Weather Data** - Fetch current weather conditions for any location
- 🎯 **Location Search** - Search and select from thousands of locations worldwide
- 📍 **Geolocation** - Use your device's current location automatically
- 🌡️ **Unit Toggle** - Switch between Metric (°C, km/h) and Imperial (°F, mph)
- 📊 **Multiple Forecasts**
  - Hourly forecast for next 24 hours
  - 7-day daily forecast
- 💾 **Saved Locations** - Save up to 5 favorite locations for quick access
- 🎨 **Dark Theme UI** - Modern gradient-based dark interface
- ⚡ **Responsive Design** - Works seamlessly on desktop and mobile
- 🔄 **Smart Caching** - Cache results for 15 minutes to reduce API calls

### Weather Information Displayed
- Current temperature
- "Feels like" temperature
- Weather description (cloudy, rainy, sunny, etc.)
- Humidity percentage
- Wind speed
- Precipitation forecast
- Weather icons and emojis

## Technology Stack

### Frontend
- **HTML5** - Semantic markup
- **CSS3** - Modern styling with CSS Grid and Flexbox
- **Vanilla JavaScript** - No external dependencies (except Font Awesome icons)
- **Font Awesome** - Weather and UI icons

### APIs Used
- **Open-Meteo API** - Free weather data (primary)
  - No API key required
  - WMO weather codes for accurate descriptions
  - Supports multiple weather parameters
  - URL: https://api.open-meteo.com/v1/forecast

- **Geocoding API** - Location search and reverse geocoding
  - URL: https://geocoding-api.open-meteo.com/v1/search

### Optional
- **OpenWeatherMap** - Alternative weather provider (requires API key)
- **Nominatim** - Reverse geocoding for location names

## Setup & Installation

### Prerequisites
- Modern web browser (Chrome, Firefox, Safari, Edge)
- No server required (runs completely on client-side)
- No API keys needed (uses free Open-Meteo API)

### Steps

1. **Clone the repository**
   ```bash
   git clone https://github.com/amitshah6374-gif/weather-dashboard.git
   cd weather-dashboard
   ```

2. **Open in browser**
   - Double-click `index.html` to open locally
   - OR serve with a local server:
   ```bash
   # Python 3
   python -m http.server 8000
   
   # Node.js (with http-server)
   npx http-server
   
   # Live Server extension in VS Code
   ```

3. **Access the application**
   - Open `http://localhost:8000` (or your chosen port)

## File Structure

```
weather-dashboard/
├── index.html          # Main HTML file
├── styles.css          # All styling
├── config.js           # API configuration
├── weatherApi.js       # Weather API wrapper class
├── app.js              # Main application logic
├── README.md           # This file
└── package.json        # Project metadata (optional)
```

## Usage

### Search for Weather
1. Type a city name in the search box
2. Select from suggestions (shows city, country)
3. Press Enter or click the search button
4. Weather data loads automatically

### Use Current Location
1. Click the "Use Current Location" button
2. Allow browser location access when prompted
3. Weather for your location displays

### Save Locations
- Click on any saved location card to quickly view its weather
- Up to 5 locations can be saved
- Click the X button to remove a location
- Saved locations persist in browser storage

### Change Units
- Use the dropdown to switch between:
  - **Metric**: °C for temperature, km/h for wind
  - **Imperial**: °F for temperature, mph for wind
- Selection is saved to browser

### Refresh Weather
- Click the "Refresh" button to get latest data
- Cache is cleared and new data is fetched

## API Details

### Open-Meteo API

**Advantages:**
- ✅ Free tier with no authentication
- ✅ High accuracy
- ✅ Good rate limits
- ✅ Supports multiple languages
- ✅ WMO weather codes

**Rate Limits:**
- 10,000 calls/day for free tier
- 300 calls/minute

**Endpoint:**
```
https://api.open-meteo.com/v1/forecast
```

**Parameters:**
- `latitude` - Location latitude
- `longitude` - Location longitude
- `current` - Current weather data
- `hourly` - Hourly forecast data
- `daily` - Daily forecast data
- `timezone` - Timezone (auto-detected)

## Caching Strategy

- Results are cached for **15 minutes**
- Cache key: `weather_${lat}_${lon}_${unit}`
- Manual refresh clears cache
- Browser localStorage for saved locations

## Weather Codes

The application uses WMO Weather codes:
- `0` - Clear sky
- `1` - Mainly clear
- `2` - Partly cloudy
- `3` - Overcast
- `45/48` - Foggy
- `51-55` - Drizzle
- `61-65` - Rain
- `71-77` - Snow
- `80-82` - Showers
- `85-86` - Snow showers
- `95-99` - Thunderstorm

## Error Handling

- **Network errors** - Displays error message with retry option
- **Invalid locations** - Shows "No results found" message
- **Geolocation denied** - Graceful fallback to manual search
- **API failures** - Falls back to cached data if available

## Browser Support

- ✅ Chrome 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Edge 90+
- ✅ Mobile browsers (iOS Safari, Chrome Mobile)

**Required APIs:**
- Fetch API
- Geolocation API (optional)
- LocalStorage
- CSS Grid & Flexbox

## Performance

- **First Load**: ~1-2 seconds
- **Subsequent Loads**: <500ms (with cache)
- **Bundle Size**: ~50KB (all files)
- **No external dependencies**: Lightweight and fast

## Future Enhancements

- [ ] Weather alerts and warnings
- [ ] Air quality index (AQI)
- [ ] UV index information
- [ ] Pollen forecast
- [ ] Weather charts and graphs
- [ ] Historical weather data
- [ ] Weather comparison between locations
- [ ] Dark/Light theme toggle
- [ ] Multiple language support
- [ ] PWA (Progressive Web App) support
- [ ] Offline mode with Service Workers
- [ ] Push notifications for severe weather
- [ ] Share weather via URL
- [ ] Map view with weather overlay

## Troubleshooting

### Weather not loading
- Check internet connection
- Clear browser cache and reload
- Check if Open-Meteo API is accessible
- Try a different location

### Geolocation not working
- Ensure HTTPS or localhost
- Check browser permissions
- Allow location access when prompted

### Saved locations not persisting
- Check browser storage settings
- Ensure cookies/storage is not blocked
- Try a different browser

## Contributing

Contributions are welcome! Feel free to:
- Report bugs
- Suggest features
- Submit pull requests
- Improve documentation

## License

MIT License - Feel free to use this project for personal or commercial purposes.

## Credits

- **Open-Meteo** - Free weather API
- **Font Awesome** - Icons library
- **Weather icons** - Unicode emoji set

## Support

For issues, questions, or suggestions:
- Open an issue on GitHub
- Check existing issues for solutions
- Review API documentation

## Live Demo

Try the live version: [Weather Dashboard](https://amitshah6374-gif.github.io/weather-dashboard/)

---

**Made with ❤️ by Amit Shah**
