// City data
const popularCities = [
    { name: 'Dombivli' },
    { name: 'Kalyan' },
    { name: 'Thakurli' }
];

const allMumbaiCities = [
    { name: 'Airoli' },
    { name: 'Ambernath' },
    { name: 'Andheri' },
    { name: 'Badlapur' },
    { name: 'Bandra' },
    { name: 'Belapur' },
    { name: 'Bhiwandi' },
    { name: 'Borivali' },
    { name: 'Bhandup' },
    { name: 'Colaba' },
    { name: 'Charni Road' },
    { name: 'Churchgate' },
    { name: 'Currey Road' },
    { name: 'Dadar' },
    { name: 'Dahisar' },
    { name: 'Dombivli' },
    { name: 'Ghatkopar' },
    { name: 'Goregaon' },
    { name: 'Grant Road' },
    { name: 'Juhu' },
    { name: 'Kalyan' },
    { name: 'Kandivali' },
    { name: 'Khar' },
    { name: 'Kharghar' },
    { name: 'Kurla' },
    { name: 'Lower Parel' },
    { name: 'Mahim' },
    { name: 'Malad' },
    { name: 'Matunga' },
    { name: 'Mulund' },
    { name: 'Mumbai Central' },
    { name: 'Navi Mumbai' },
    { name: 'Nerul' },
    { name: 'Panvel' },
    { name: 'Parel' },
    { name: 'Powai' },
    { name: 'Santacruz' },
    { name: 'Sion' },
    { name: 'Thane' },
    { name: 'Ulhasnagar' },
    { name: 'Vasai' },
    { name: 'Vashi' },
    { name: 'Vikhroli' },
    { name: 'Vile Parle' },
    { name: 'Virar' },
    { name: 'Wadala' },
    { name: 'Worli' }
];

// Helper function to highlight matching text
function getHighlightedText(text, searchTerm) {
    if (!searchTerm) return text;
    const lowerText = text.toLowerCase();
    const lowerSearchTerm = searchTerm.toLowerCase();
    const startIndex = lowerText.indexOf(lowerSearchTerm);
    if (startIndex === -1) return text;
    const beforeMatch = text.slice(0, startIndex);
    const match = text.slice(startIndex, startIndex + searchTerm.length);
    const afterMatch = text.slice(startIndex + searchTerm.length);
    return `${beforeMatch}<strong>${match}</strong>${afterMatch}`;
}

// Show location overlay
function showLocationOverlay() {
    const locationOverlay = document.getElementById('location');
    if (locationOverlay) {
        locationOverlay.style.display = 'block';
    }
}

// Hide location overlay
function hideLocationOverlay() {
    const locationOverlay = document.getElementById('location');
    if (locationOverlay) {
        locationOverlay.style.display = 'none';
    }
}

// Initialize page
function initLocationPage() {
    populateCities();
    setupLocationDetection();
    setupSearchFunctionality();
    setupClickOutside();
    restoreLocation();
    setupLocationLink();
}

// Setup location link click handler
function setupLocationLink() {
    const locationLink = document.querySelector('.nav-links li a[href="#location"]');
    if (locationLink) {
        locationLink.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            showLocationOverlay();
        });
    }
}

// Populate cities grid
function populateCities() {
    const citiesGrid = document.getElementById('citiesGrid');
    if (!citiesGrid) return;

    citiesGrid.innerHTML = ''; // Clear existing content

    popularCities.forEach(city => {
        const cityCard = document.createElement('div');
        cityCard.className = 'city-card';
        cityCard.innerHTML = `<h3 class="city-name">${city.name}</h3>`;
        cityCard.addEventListener('click', (e) => {
            e.stopPropagation();
            selectCity(city.name);
        });
        citiesGrid.appendChild(cityCard);
    });
}

// Handle city selection
function selectCity(cityName) {
    const searchInput = document.getElementById('locationSearch');
    if (searchInput) {
        searchInput.value = cityName;
    }
    hideDropdown();

    const locationLink = document.querySelector('.nav-links li a[href="#location"]');
    if (locationLink) {
        locationLink.textContent = cityName;
        localStorage.setItem('selectedLocation', cityName);
        sessionStorage.setItem('hasVisited', 'true'); // Add this line
    }

    hideLocationOverlay();
}

// Setup location detection
function setupLocationDetection() {
    const detectButton = document.getElementById('detectLocation');
    if (!detectButton) return;

    detectButton.addEventListener('click', (e) => {
        e.stopPropagation();
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                position => {
                    const { latitude, longitude } = position.coords;
                    console.log(`Detected location: ${latitude}, ${longitude}`);
                    // You can add reverse geocoding here to get city name
                    // For now, let's just select a default city
                    selectCity('Mumbai Central');
                },
                error => {
                    console.error('Error detecting location:', error);
                    alert('Unable to detect location. Please try again or select a city manually.');
                }
            );
        } else {
            alert('Geolocation is not supported by your browser');
        }
    });
}

// Show dropdown with search results and highlighting
function showDropdown(filteredCities) {
    const dropdown = document.getElementById('searchDropdown');
    const searchInput = document.getElementById('locationSearch');
    if (!dropdown) return;

    dropdown.innerHTML = '';
    if (filteredCities.length === 0) {
        dropdown.style.display = 'none';
        return;
    }

    const searchTerm = searchInput.value;

    filteredCities.forEach(city => {
        const item = document.createElement('div');
        item.className = 'dropdown-item';
        item.innerHTML = getHighlightedText(city.name, searchTerm);
        item.addEventListener('click', (e) => {
            e.stopPropagation();
            selectCity(city.name);
        });
        dropdown.appendChild(item);
    });

    dropdown.style.display = 'block';
}

// Hide dropdown
function hideDropdown() {
    const dropdown = document.getElementById('searchDropdown');
    if (dropdown) {
        dropdown.style.display = 'none';
    }
}

// Setup search functionality
function setupSearchFunctionality() {
    const searchInput = document.getElementById('locationSearch');
    if (!searchInput) return;

    searchInput.addEventListener('click', (e) => {
        e.stopPropagation();
    });

    searchInput.addEventListener('input', (e) => {
        e.stopPropagation();
        const searchTerm = e.target.value.toLowerCase();
        
        if (searchTerm === '') {
            hideDropdown();
            return;
        }

        const filteredCities = allMumbaiCities.filter(city =>
            city.name.toLowerCase().includes(searchTerm)
        );

        showDropdown(filteredCities);
    });

    searchInput.addEventListener('focus', (e) => {
        const searchTerm = e.target.value.toLowerCase();
        if (searchTerm) {
            const filteredCities = allMumbaiCities.filter(city =>
                city.name.toLowerCase().includes(searchTerm)
            );
            showDropdown(filteredCities);
        }
    });
}

// Setup click outside behavior
function setupClickOutside() {
    const locationContainer = document.querySelector('.location-container');
    if (locationContainer) {
        locationContainer.addEventListener('click', (e) => {
            e.stopPropagation();
        });
    }

    document.addEventListener('click', () => {
        hideDropdown();
        hideLocationOverlay();
    });

    const navigationBar = document.querySelector('.NavigationBar');
    if (navigationBar) {
        navigationBar.addEventListener('click', (e) => {
            e.stopPropagation();
        });
    }
}

// Restore previously selected location
function restoreLocation() {
    // Default display text
    const defaultLocationText = 'Location';
    
    const locationLink = document.querySelector('.nav-links li a[href="#location"]');
    if (!locationLink) return;

    // Check if this is the first visit to the page in this session
    const isFirstVisit = sessionStorage.getItem('hasVisited') === null;
    
    if (isFirstVisit) {
        // First visit - show default text and set visited flag
        locationLink.textContent = defaultLocationText;
        sessionStorage.setItem('hasVisited', 'true');
        // Clear any previously saved location
        localStorage.removeItem('selectedLocation');
    } else {
        // Not first visit - restore saved location if exists
        const savedLocation = localStorage.getItem('selectedLocation');
        if (savedLocation) {
            locationLink.textContent = savedLocation;
        } else {
            locationLink.textContent = defaultLocationText;
        }
    }
}

// Initialize everything when DOM is loaded
document.addEventListener('DOMContentLoaded', initLocationPage);