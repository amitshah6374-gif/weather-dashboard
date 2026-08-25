/**
 * Weather Dashboard Application
 */

class WeatherDashboard {
    constructor() {
        this.currentLocation = null;
        this.savedLocations = this.loadSavedLocations();
        this.currentUnit = localStorage.getItem('weatherUnit') || 'metric';
        this.initEventListeners();
        this.loadDefaultWeather();
    }

    /**
     * Initialize event listeners
     */
    initEventListeners() {
        // Search
        const searchInput = document.getElementById('searchInput');
        const searchBtn = document.getElementById('searchBtn');
        const suggestions = document.getElementById('suggestions');

        searchInput.addEventListener('input', (e) => this.handleSearch(e, suggestions));
        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') searchBtn.click();
        });
        searchBtn.addEventListener('click', () => this.searchLocation(searchInput.value));

        // Location
        document.getElementById('currentLocationBtn').addEventListener('click', () => this.useCurrentLocation());
        
        // Refresh
        document.getElementById('refreshBtn').addEventListener('click', () => this.refreshWeather());
        
        // Unit toggle
        document.getElementById('unitToggle').addEventListener('change', (e) => this.changeUnit(e.target.value));
    }

    /**
     * Handle search input
     */
    async handleSearch(e, suggestionsEl) {
        const query = e.target.value.trim();
        
        if (query.length < 2) {
            suggestionsEl.classList.remove('active');
            return;
        }

        try {
            const results = await weatherAPI.searchLocation(query);
            
            suggestionsEl.innerHTML = '';
            
            if (results.length === 0) {
                suggestionsEl.innerHTML = '<div class="suggestion-item">No results found</div>';
            } else {
                results.forEach(result => {
                    const div = document.createElement('div');
                    div.className = 'suggestion-item';
                    div.innerHTML = `
                        <strong>${result.name}</strong>
                        <br>
                        <small>${result.displayName}</small>
                    `;
                    div.addEventListener('click', () => {
                        this.selectLocation(result);
                        suggestionsEl.classList.remove('active');
                        document.getElementById('searchInput').value = '';
                    });
                    suggestionsEl.appendChild(div);
                });
            }
            
            suggestionsEl.classList.add('active');
        } catch (error) {
            console.error('Search error:', error);
            this.showError('Search failed. Please try again.');
        }
    }

    /**
     * Select location from search results
     */
    async selectLocation(location) {
        this.currentLocation = {
            name: location.name,
            lat: location.lat,
            lon: location.lon,
            country: location.country
        };
        this.showLoading();
        await this.displayWeather();
    }

    /**
     * Search for location
     */
    async searchLocation(query) {
        if (!query.trim()) {
            this.showError('Please enter a location');
            return;
        }

        try {
            const results = await weatherAPI.searchLocation(query);
            if (results.length > 0) {
                await this.selectLocation(results[0]);
            } else {
                this.showError('Location not found');
            }
        } catch (error) {
            this.showError('Search failed: ' + error.message);
        }
    }

    /**
     * Use current geolocation
     */
    async useCurrentLocation() {
        try {
            this.showLoading();
            const coords = await weatherAPI.getCurrentLocation();
            const locationName = await weatherAPI.getLocationName(coords.lat, coords.lon);
            
            this.currentLocation = {
                name: locationName,
                lat: coords.lat,
                lon: coords.lon
            };
            
            await this.displayWeather();
        } catch (error) {
            this.showError('Error getting location: ' + error.message);
        }
    }

    /**
     * Load default weather for initial locations
     */
    async loadDefaultWeather() {
        try {
            this.showLoading();
            if (this.savedLocations.length > 0) {
                this.currentLocation = this.savedLocations[0];
                await this.displayWeather();
            } else {
                this.currentLocation = DEFAULT_LOCATIONS[0];
                await this.displayWeather();
            }
        } catch (error) {
            this.showError('Error loading weather: ' + error.message);
        }
    }

    /**
     * Display weather for current location
     */
    async displayWeather() {
        try {
            const weather = await weatherAPI.getWeatherByCoordinates(
                this.currentLocation.lat,
                this.currentLocation.lon,
                this.currentUnit
            );

            this.renderCurrentWeather(weather);
            this.renderForecast(weather);
            this.saveLocation(this.currentLocation);
            this.hideLoading();
            this.hideError();
        } catch (error) {
            this.showError('Error displaying weather: ' + error.message);
            this.hideLoading();
        }
    }

    /**
     * Render current weather
     */
    renderCurrentWeather(weather) {
        const container = document.getElementById('weatherContainer');
        const current = weather.current;

        container.innerHTML = `
            <div class="current-weather">
                <div>
                    <div class="weather-main">
                        <div class="temperature">${current.temp}${weather.units.temp}</div>
                        <div class="description">${current.description}</div>
                        <div class="feels-like">Feels like ${current.feels_like}${weather.units.temp}</div>
                    </div>
                </div>
                <div class="weather-icon">
                    <div style="font-size: 80px; margin-bottom: 20px;">${current.icon}</div>
                    <div class="location-name" style="color: var(--text-primary); font-size: 1.2em;">${this.currentLocation.name}</div>
                </div>
            </div>
            <div class="weather-details">
                <div class="detail-item">
                    <div class="label"><i class="fas fa-droplet"></i> Humidity</div>
                    <div class="value">${current.humidity}%</div>
                </div>
                <div class="detail-item">
                    <div class="label"><i class="fas fa-wind"></i> Wind Speed</div>
                    <div class="value">${current.wind_speed} ${weather.units.wind}</div>
                </div>
            </div>
            <div class="forecast-section">
                <h2>Hourly Forecast</h2>
                <div class="forecast-grid" id="hourlyForecast"></div>
            </div>
        `;

        // Render hourly forecast
        const hourlyContainer = document.getElementById('hourlyForecast');
        weather.hourly.slice(0, 8).forEach(hour => {
            hourlyContainer.innerHTML += `
                <div class="forecast-card">
                    <div class="time">${hour.time}</div>
                    <div class="icon">${hour.icon}</div>
                    <div class="temp">${hour.temp}${weather.units.temp}</div>
                    <div class="description">${hour.description}</div>
                </div>
            `;
        });
    }

    /**
     * Render weather forecast
     */
    renderForecast(weather) {
        const forecastHTML = `
            <div class="forecast-section" style="margin-top: 20px;">
                <h2>7-Day Forecast</h2>
                <div class="forecast-grid">
                    ${weather.daily.slice(0, 7).map(day => `
                        <div class="forecast-card">
                            <div class="time">${day.date}</div>
                            <div class="icon">${day.icon}</div>
                            <div class="temp">${day.max_temp}${weather.units.temp} / ${day.min_temp}${weather.units.temp}</div>
                            <div class="description">${day.description}</div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
        document.getElementById('weatherContainer').innerHTML += forecastHTML;
    }

    /**
     * Refresh weather
     */
    async refreshWeather() {
        if (this.currentLocation) {
            this.showLoading();
            await this.displayWeather();
        }
    }

    /**
     * Change temperature/wind units
     */
    async changeUnit(unit) {
        this.currentUnit = unit;
        localStorage.setItem('weatherUnit', unit);
        document.getElementById('unitToggle').value = unit;
        if (this.currentLocation) {
            this.showLoading();
            await this.displayWeather();
        }
    }

    /**
     * Save location
     */
    saveLocation(location) {
        const exists = this.savedLocations.some(loc => 
            loc.lat === location.lat && loc.lon === location.lon
        );
        
        if (!exists && this.savedLocations.length < API_CONFIG.MAX_SAVED_LOCATIONS) {
            this.savedLocations.push(location);
            localStorage.setItem('savedLocations', JSON.stringify(this.savedLocations));
            this.renderSavedLocations();
        }
    }

    /**
     * Load saved locations from localStorage
     */
    loadSavedLocations() {
        const saved = localStorage.getItem('savedLocations');
        return saved ? JSON.parse(saved) : [];
    }

    /**
     * Render saved locations
     */
    async renderSavedLocations() {
        const container = document.getElementById('savedLocationsList');
        container.innerHTML = '';

        for (const location of this.savedLocations) {
            try {
                const weather = await weatherAPI.getWeatherByCoordinates(
                    location.lat,
                    location.lon,
                    this.currentUnit
                );

                const card = document.createElement('div');
                card.className = 'location-card';
                card.innerHTML = `
                    <button class="remove-btn" onclick="dashboard.removeLocation(${location.lat}, ${location.lon})">
                        <i class="fas fa-times"></i>
                    </button>
                    <div class="location-name">${location.name}</div>
                    <div class="location-temp">${weather.current.temp}${weather.units.temp}</div>
                    <div class="location-desc">${weather.current.description}</div>
                    <div class="location-desc" style="font-size: 0.8em; color: var(--text-secondary);">
                        ${weather.current.humidity}% humidity
                    </div>
                `;
                card.addEventListener('click', () => {
                    this.currentLocation = location;
                    this.displayWeather();
                });
                container.appendChild(card);
            } catch (error) {
                console.error('Error loading saved location:', error);
            }
        }
    }

    /**
     * Remove saved location
     */
    removeLocation(lat, lon) {
        this.savedLocations = this.savedLocations.filter(loc => 
            !(loc.lat === lat && loc.lon === lon)
        );
        localStorage.setItem('savedLocations', JSON.stringify(this.savedLocations));
        this.renderSavedLocations();
    }

    /**
     * Show loading state
     */
    showLoading() {
        document.getElementById('loadingSpinner').classList.add('show');
    }

    /**
     * Hide loading state
     */
    hideLoading() {
        document.getElementById('loadingSpinner').classList.remove('show');
    }

    /**
     * Show error message
     */
    showError(message) {
        const errorEl = document.getElementById('errorMessage');
        errorEl.textContent = message;
        errorEl.classList.add('show');
    }

    /**
     * Hide error message
     */
    hideError() {
        const errorEl = document.getElementById('errorMessage');
        errorEl.classList.remove('show');
    }
}

// Initialize dashboard
const dashboard = new WeatherDashboard();
