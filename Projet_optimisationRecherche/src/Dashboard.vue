<script setup lang="ts">
import { ref, computed, onBeforeUnmount, nextTick } from 'vue';
import * as XLSX from 'xlsx';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const query = ref('');
const location = ref('');
const limit = ref(5);
const isExtracting = ref(false);
const progress = ref(0);
const results = ref<any[]>([]);
let eventSource: EventSource | null = null;

// Reactive state for filters and sorting
const minRating = ref<string>('all');
const websiteFilter = ref<string>('all');
const sortBy = ref<string>('default');

// Map Selection & Modal State
const showMapModal = ref(false);
const coords = ref<{ lat: number; lng: number; zoom: number } | null>(null);
const previewCoords = ref<{ lat: number; lng: number } | null>(null);
const searchQueryMap = ref('');
const searchResultsMap = ref<any[]>([]);
const isSearchingMap = ref(false);
const radius = ref(2000); // Visual search radius indicator in meters (default 2km)

let map: L.Map | null = null;
let marker: L.Marker | null = null;
let circle: L.Circle | null = null;

// Nominatim OpenStreetMap Geocoding
const searchLocationOnMap = async () => {
  if (!searchQueryMap.value.trim()) return;
  isSearchingMap.value = true;
  try {
    const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQueryMap.value)}`, {
      headers: {
        'User-Agent': 'GeoScraperPro-UserAgent'
      }
    });
    const data = await response.json();
    searchResultsMap.value = data;
  } catch (e) {
    console.error("Geocoding error:", e);
  } finally {
    isSearchingMap.value = false;
  }
};

const selectSearchResult = (result: any) => {
  const latVal = parseFloat(result.lat);
  const lngVal = parseFloat(result.lon);
  searchResultsMap.value = [];
  searchQueryMap.value = result.display_name;
  if (map) {
    map.setView([latVal, lngVal], 14);
    updateMarkerPosition(latVal, lngVal);
  }
};

// Map Lifecycle Methods
const initMap = () => {
  nextTick(() => {
    const mapContainer = document.getElementById('map-container');
    if (!mapContainer) return;

    if (map) {
      map.remove();
      map = null;
    }

    // Centered on Lyon, France by default if no coordinates are selected
    const defaultLat = coords.value?.lat || 45.764043;
    const defaultLng = coords.value?.lng || 4.835659;
    const defaultZoom = coords.value?.zoom || 13;

    map = L.map('map-container', {
      zoomControl: false
    }).setView([defaultLat, defaultLng], defaultZoom);

    L.control.zoom({ position: 'topright' }).addTo(map);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '© OpenStreetMap'
    }).addTo(map);

    // Custom CSS Pin Marker to avoid static asset issues in Vite
    const customPinIcon = L.divIcon({
      className: 'custom-div-icon',
      html: '<div class="custom-pin"></div>',
      iconSize: [30, 30],
      iconAnchor: [15, 30]
    });

    marker = L.marker([defaultLat, defaultLng], {
      icon: customPinIcon,
      draggable: true
    }).addTo(map);

    // Set initial preview coordinates
    previewCoords.value = { lat: defaultLat, lng: defaultLng };

    // Add semi-transparent circle for area visual representation
    circle = L.circle([defaultLat, defaultLng], {
      radius: radius.value,
      color: '#6d28d9',
      fillColor: '#6d28d9',
      fillOpacity: 0.08,
      weight: 1.5
    }).addTo(map);

    // Synchronize circle with marker drag
    marker.on('drag', (e: any) => {
      const latLng = e.target.getLatLng();
      if (circle) circle.setLatLng(latLng);
      previewCoords.value = {
        lat: Number(latLng.lat.toFixed(6)),
        lng: Number(latLng.lng.toFixed(6))
      };
    });

    // Handle map click to reposition marker and circle
    map.on('click', (e: any) => {
      const { lat, lng } = e.latlng;
      updateMarkerPosition(lat, lng);
    });
  });
};

const updateMarkerPosition = (latVal: number, lngVal: number) => {
  if (marker) {
    marker.setLatLng([latVal, lngVal]);
    if (circle) circle.setLatLng([latVal, lngVal]);
  }
  previewCoords.value = {
    lat: Number(latVal.toFixed(6)),
    lng: Number(lngVal.toFixed(6))
  };
};

const updateRadius = () => {
  if (circle) {
    circle.setRadius(radius.value);
  }
};

const openMapModal = () => {
  showMapModal.value = true;
  initMap();
};

const closeMapModal = () => {
  showMapModal.value = false;
  if (map) {
    map.remove();
    map = null;
    marker = null;
    circle = null;
  }
  searchResultsMap.value = [];
  searchQueryMap.value = '';
};

const applyCoordsSelection = () => {
  if (marker && map) {
    const latLng = marker.getLatLng();
    const currentZoom = map.getZoom();
    coords.value = {
      lat: Number(latLng.lat.toFixed(6)),
      lng: Number(latLng.lng.toFixed(6)),
      zoom: currentZoom
    };
    location.value = `${coords.value.lat}, ${coords.value.lng}`;
  }
  closeMapModal();
};

const clearCoordsSelection = () => {
  coords.value = null;
  location.value = '';
};

onBeforeUnmount(() => {
  if (map) {
    map.remove();
  }
});

const parseNote = (noteStr: any): number => {
  if (!noteStr) return 0;
  const noteStrClean = String(noteStr).replace(',', '.').trim();
  const parsed = parseFloat(noteStrClean);
  return isNaN(parsed) ? 0 : parsed;
};

const hasWebsite = (website: any): boolean => {
  if (!website) return false;
  const webStr = String(website).trim().toLowerCase();
  return !['non renseigné', 'n/a', 'non trouvé', 'non renseignee', ''].includes(webStr);
};

// Computed property to filter and sort results in real-time
const filteredAndSortedResults = computed(() => {
  let list = [...results.value];

  // 1. Filter by Rating
  if (minRating.value !== 'all') {
    const minVal = parseFloat(minRating.value);
    list = list.filter(item => parseNote(item.note) >= minVal);
  }

  // 2. Filter by Website
  if (websiteFilter.value === 'yes') {
    list = list.filter(item => hasWebsite(item.website));
  } else if (websiteFilter.value === 'no') {
    list = list.filter(item => !hasWebsite(item.website));
  }

  // 3. Sort
  if (sortBy.value === 'rating-desc') {
    list.sort((a, b) => parseNote(b.note) - parseNote(a.note));
  } else if (sortBy.value === 'rating-asc') {
    list.sort((a, b) => parseNote(a.note) - parseNote(b.note));
  } else if (sortBy.value === 'name-asc') {
    list.sort((a, b) => {
      const nameA = a.name || '';
      const nameB = b.name || '';
      return nameA.localeCompare(nameB, 'fr', { sensitivity: 'base' });
    });
  } else if (sortBy.value === 'name-desc') {
    list.sort((a, b) => {
      const nameA = a.name || '';
      const nameB = b.name || '';
      return nameB.localeCompare(nameA, 'fr', { sensitivity: 'base' });
    });
  }

  return list;
});

const startExtraction = () => {
  if (!query.value || !location.value) return;
  isExtracting.value = true;
  progress.value = 0;
  results.value = [];
  
  if (eventSource) {
    eventSource.close();
  }

  const url = new URL('http://localhost:3000/api/scrape');
  url.searchParams.append('query', query.value);
  url.searchParams.append('location', location.value);
  url.searchParams.append('limit', limit.value.toString());
  
  // If custom coordinates are active, append them
  if (coords.value && location.value === `${coords.value.lat}, ${coords.value.lng}`) {
    url.searchParams.append('lat', coords.value.lat.toString());
    url.searchParams.append('lng', coords.value.lng.toString());
    url.searchParams.append('zoom', coords.value.zoom.toString());
  }

  const token = localStorage.getItem('token');
  if (token) url.searchParams.append('token', token);

  eventSource = new EventSource(url.toString());

  eventSource.onmessage = (event) => {
    const message = JSON.parse(event.data);
    if (message.type === 'progress') {
      progress.value = message.data;
    } else if (message.type === 'result') {
      results.value = [...results.value, message.data];
    } else if (message.type === 'done') {
      eventSource?.close();
      progress.value = 100;
      isExtracting.value = false;
    } else if (message.type === 'error') {
      eventSource?.close();
      alert("Erreur: " + message.data);
      isExtracting.value = false;
    }
  };

  eventSource.onerror = (error) => {
    console.error("SSE Error:", error);
    eventSource?.close();
    isExtracting.value = false;
  };
};

const exportToExcel = () => {
  if (filteredAndSortedResults.value.length === 0) return;

  const dataForExcel = filteredAndSortedResults.value.map(item => ({
    'Nom du Commerce': item.name,
    'Téléphone': item.phone,
    'Ouverture': item.ouverture,
    'Site Web': item.website,
    'Adresse': item.adresse,
    'Note': item.note
  }));

  const worksheet = XLSX.utils.json_to_sheet(dataForExcel);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Commerces");

  XLSX.writeFile(workbook, `Extraction_${query.value || 'Data'}.xlsx`);
};

import { useRouter } from 'vue-router';
const router = useRouter();

const logout = () => {
  localStorage.removeItem('token');
  router.push('/login');
};
</script>

<template>
  <main class="dashboard-fullscreen">
    <div class="dashboard-layout">
      <!-- Left Panel: Sidebar Control Center -->
      <aside class="dashboard-sidebar">
        <header class="header">
          <div class="brand-group">
            <h1>GeoScraper <span class="brand-badge">Pro</span></h1>
            <p>Google Maps to CRM Automation</p>
          </div>
        </header>

        <div class="search-panel">
          <div class="input-group">
            <label for="query">Type d'établissement</label>
            <input type="text" id="query" v-model="query" placeholder="ex: Restaurants, Plombiers..." />
          </div>
          
          <div class="input-group relative-input">
            <div class="label-row">
              <label for="location">Localisation</label>
              <button 
                type="button" 
                class="map-trigger-btn" 
                @click="openMapModal"
                title="Sélectionner une zone géographique sur la carte"
              >
                Sélectionner sur la carte
              </button>
            </div>
            <div class="input-with-action">
              <input 
                type="text" 
                id="location" 
                v-model="location" 
                placeholder="ex: Lyon, France" 
                :class="{ 'custom-coords-active': coords && location === `${coords.lat}, ${coords.lng}` }"
              />
              <button 
                v-if="coords && location === `${coords.lat}, ${coords.lng}`" 
                class="clear-coords-btn" 
                @click="clearCoordsSelection" 
                title="Réinitialiser les coordonnées"
              >
                ✕
              </button>
            </div>
            <span v-if="coords && location === `${coords.lat}, ${coords.lng}`" class="coords-badge">
              Zone personnalisée active (lat: {{coords.lat}}, lng: {{coords.lng}})
            </span>
          </div>

          <div class="input-group">
            <label for="limit">Résultats max</label>
            <input type="number" id="limit" v-model="limit" min="1" max="50" />
          </div>

          <div class="action-group">
            <button class="primary-btn start-btn" @click="startExtraction" :disabled="isExtracting">
              <span v-if="!isExtracting">Démarrer l'extraction</span>
              <span v-else>Extraction... ({{ progress }}%)</span>
            </button>
            
            <div class="progress-bar-container" v-if="isExtracting || progress === 100">
              <div class="progress-bar" :style="{ width: progress + '%' }"></div>
            </div>
          </div>
        </div>

        <div class="sidebar-footer">
          <button class="logout-btn" @click="logout">Se déconnecter</button>
        </div>
      </aside>

      <!-- Right Panel: Main Content Workspace -->
      <section class="dashboard-main">
        <div class="panel-header">
          <div class="panel-title-group">
            <h2>Résultats en direct</h2>
            <span class="stats-badge">{{ filteredAndSortedResults.length }} / {{ results.length }} affichés</span>
          </div>
          <button class="export-btn" @click="exportToExcel" :disabled="isExtracting || progress !== 100 || filteredAndSortedResults.length === 0">
            Exporter vers Excel
          </button>
        </div>

        <!-- Dynamic Sorting & Filtering Section -->
        <div class="filters-bar">
          <div class="filter-group">
            <label for="rating-filter">⭐ Note min.</label>
            <select id="rating-filter" v-model="minRating">
              <option value="all">Toutes</option>
              <option value="3">3.0+</option>
              <option value="4">4.0+</option>
              <option value="4.5">4.5+</option>
            </select>
          </div>
          <div class="filter-group">
            <label for="website-filter">🌐 Site Web</label>
            <select id="website-filter" v-model="websiteFilter">
              <option value="all">Tous</option>
              <option value="yes">Avec site internet</option>
              <option value="no">Sans site internet</option>
            </select>
          </div>
          <div class="filter-group">
            <label for="sort-by">↕️ Trier par</label>
            <select id="sort-by" v-model="sortBy">
              <option value="default">Ordre d'extraction</option>
              <option value="rating-desc">Note : Décroissante</option>
              <option value="rating-asc">Note : Croissante</option>
              <option value="name-asc">Nom : A-Z</option>
              <option value="name-desc">Nom : Z-A</option>
            </select>
          </div>
        </div>
        
        <div class="table-container">
          <table>
            <thead>
              <tr>
                <th class="name-cell">Nom de l'établissement</th>
                <th class="phone-cell">Téléphone</th>
                <th class="ouverture-cell">Ouverture</th>
                <th class="website-cell">Site Web</th>
                <th class="address-cell">Adresse</th>
                <th class="note-cell">Note</th>
                <th class="status-cell">Statut</th>
              </tr>
            </thead>
            <tbody>
              <!-- Show real results if any -->
              <template v-if="filteredAndSortedResults.length > 0">
                <tr v-for="result in filteredAndSortedResults" :key="result.id" :class="{'processing': result.status === 'Scraping...'}">
                  <td class="name-cell">
                    <a :href="`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(result.name + ' ' + (result.adresse && result.adresse !== 'N/A' && result.adresse !== 'Non trouvée' ? result.adresse : ''))}`" 
                       target="_blank" 
                       rel="noopener noreferrer" 
                       class="business-link"
                       :title="result.name">
                      {{ result.name }}
                    </a>
                  </td>
                  <td class="phone-cell">{{ result.phone }}</td>
                  <td class="ouverture-cell">
                    <span :class="{'text-open': result.ouverture === 'Ouvert' || result.ouverture === 'Ouvert 24h/24', 'text-closed': result.ouverture === 'Fermé'}" :title="result.ouverture">
                      {{ result.ouverture }}
                    </span>
                  </td>
                  <td class="website-cell">
                    <a v-if="result.website && !['N/A', 'Non trouvé', 'Non renseigné'].includes(result.website)" 
                       :href="result.website" 
                       target="_blank" 
                       rel="noopener noreferrer" 
                       class="website-link"
                       :title="result.website">
                      {{ result.website }}
                    </a>
                    <span v-else class="website-text" :title="result.website">{{ result.website }}</span>
                  </td>
                  <td class="address-cell" :title="result.adresse">{{ result.adresse }}</td> 
                  <td class="note-cell">{{ result.note }}</td>
                  <td class="status-cell">
                    <span class="status-badge" :class="result.status.toLowerCase().replace(/\./g, '')">
                      {{ result.status }}
                    </span>
                  </td>
                </tr>
              </template>
              
              <!-- Skeleton rows when empty -->
              <template v-else>
                <tr v-for="i in limit || 5" :key="'skeleton-'+i" class="skeleton-row">
                  <td class="name-cell"><div class="skeleton-box skeleton-text skeleton-wide"></div></td>
                  <td class="phone-cell"><div class="skeleton-box skeleton-text"></div></td>
                  <td class="ouverture-cell"><div class="skeleton-box skeleton-text skeleton-short"></div></td>
                  <td class="website-cell"><div class="skeleton-box skeleton-text"></div></td>
                  <td class="address-cell"><div class="skeleton-box skeleton-text skeleton-wide"></div></td>
                  <td class="note-cell"><div class="skeleton-box skeleton-text skeleton-short"></div></td>
                  <td class="status-cell"><div class="skeleton-box skeleton-badge"></div></td>
                </tr>
              </template>
            </tbody>
          </table>
        </div>
      </section>
    </div>

    <!-- Beautiful Map Modal with Glassmorphism -->
    <div class="map-modal-overlay" v-if="showMapModal" @click.self="closeMapModal">
      <div class="map-modal">
        <div class="map-modal-header">
          <h3>Cibler la zone géographique</h3>
          <button class="close-btn" @click="closeMapModal">✕</button>
        </div>
        
        <div class="map-modal-body">
          <div class="map-search-bar">
            <div class="search-input-wrapper">
              <input 
                type="text" 
                v-model="searchQueryMap" 
                placeholder="Rechercher une ville, une adresse... (ex: Paris, France)" 
                @keyup.enter="searchLocationOnMap"
              />
              <button class="map-search-btn" @click="searchLocationOnMap" :disabled="isSearchingMap">
                <span v-if="!isSearchingMap">Rechercher</span>
                <span v-else>Recherche...</span>
              </button>
            </div>
            
            <!-- Nominatim Autocomplete Dropdown -->
            <div class="map-search-results" v-if="searchResultsMap.length > 0">
              <div 
                v-for="result in searchResultsMap" 
                :key="result.place_id" 
                class="search-result-item" 
                @click="selectSearchResult(result)"
              >
                <span class="icon">📍</span>
                <span class="name">{{ result.display_name }}</span>
              </div>
            </div>
          </div>
          
          <div class="map-container-wrapper">
            <div id="map-container"></div>
            <div class="map-center-indicator">
              <span class="instruction-bubble">Cliquez ou déplacez le marqueur pour cibler</span>
            </div>
          </div>
          
          <div class="map-controls">
            <div class="radius-slider-group">
              <div class="slider-label">
                <span>Rayon de visualisation</span>
                <span class="radius-value">{{ (radius / 1000).toFixed(1) }} km</span>
              </div>
              <input 
                type="range" 
                v-model.number="radius" 
                min="500" 
                max="25000" 
                step="500" 
                @input="updateRadius"
              />
            </div>
          </div>
        </div>
        
        <div class="map-modal-footer">
          <div class="selected-coords-info">
            <span class="coords-tag">COORDONNÉES CIBLÉES</span>
            <span class="coords-numbers" v-if="previewCoords">
              {{ previewCoords.lat }}, {{ previewCoords.lng }}
            </span>
            <span class="coords-numbers" v-else>Chargement...</span>
          </div>
          <div class="actions">
            <button class="cancel-btn" @click="closeMapModal">Annuler</button>
            <button class="apply-btn" @click="applyCoordsSelection">Confirmer la zone</button>
          </div>
        </div>
      </div>
    </div>
  </main>
</template>

<style scoped>
.dashboard-fullscreen {
  position: relative;
  width: 100vw;
  min-height: 100vh;
  display: flex;
  background: var(--surface-color);
}

.dashboard-layout {
  display: grid;
  grid-template-columns: 320px 1fr;
  width: 100%;
  min-height: 100vh;
}

@media (max-width: 1024px) {
  .dashboard-layout {
    grid-template-columns: 1fr;
  }
}

.dashboard-sidebar {
  display: flex;
  flex-direction: column;
  gap: 2.5rem;
  border-right: 1px solid var(--border-color);
  padding: 2rem;
  background: var(--surface-color);
}

@media (max-width: 1024px) {
  .dashboard-sidebar {
    border-right: none;
    padding: 1.5rem;
    border-bottom: 1px solid var(--border-color);
  }
}

.brand-group h1 {
  font-family: 'Outfit', sans-serif;
  font-size: 1.6rem;
  font-weight: 400;
  letter-spacing: -0.02em;
  color: var(--text-main);
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.brand-badge {
  font-size: 0.6rem;
  font-weight: 800;
  background: var(--primary);
  color: var(--primary-contrast);
  padding: 0.15rem 0.4rem;
  border-radius: 4px;
  letter-spacing: 0.05em;
  text-transform: uppercase;
}

.brand-group p {
  font-size: 0.75rem;
  color: var(--text-muted);
  margin-top: 0.25rem;
  font-weight: 500;
}

.search-panel {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.start-btn {
  width: 100%;
}

.action-group {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-top: 0.5rem;
}

.sidebar-footer {
  margin-top: auto;
  padding-top: 1rem;
}

.logout-btn {
  background: transparent;
  border: 1px solid var(--border-color);
  color: #ef4444;
  border-radius: var(--radius-sm);
  padding: 0.5rem 1rem;
  font-size: 0.8rem;
  font-weight: 600;
  cursor: pointer;
  width: 100%;
  transition: all 0.15s ease;
}

.logout-btn:hover {
  background: #fef2f2;
  border-color: #fca5a5;
}

/* Right main side */
.dashboard-main {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  padding: 2rem 3rem;
  background: var(--bg-color);
  overflow-y: auto;
  max-height: 100vh;
}

.text-open {
  color: #059669; /* Green */
  font-weight: 600;
}

.text-closed {
  color: #dc2626; /* Red */
  font-weight: 600;
}

/* Skeleton Loading Animation */
.skeleton-row td {
  padding: 1.125rem 1.5rem;
}

.skeleton-box {
  background: #f4f4f5;
  border-radius: 4px;
}

.skeleton-text {
  height: 14px;
  width: 70%;
}

.skeleton-wide {
  width: 90%;
}

.skeleton-short {
  width: 40%;
}

.skeleton-badge {
  height: 20px;
  width: 60px;
  border-radius: 10px;
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 1rem;
}

.panel-title-group {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.panel-title-group h2 {
  font-family: 'Outfit', sans-serif;
  font-size: 1.2rem;
  font-weight: 600;
  color: var(--text-main);
}

.stats-badge {
  display: inline-block;
  padding: 0.2rem 0.6rem;
  background: #f5f3ff;
  border: 1px solid #ddd6fe;
  color: var(--primary);
  border-radius: 9999px;
  font-size: 0.7rem;
  font-weight: 600;
}

.export-btn {
  background: var(--surface-color);
  border: 1px solid var(--border-color);
  color: var(--text-main);
  border-radius: var(--radius-sm);
  padding: 0.5rem 1rem;
  font-size: 0.8rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s ease;
}

.export-btn:hover:not(:disabled) {
  background: #fafafa;
  border-color: var(--text-main);
}

.export-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

/* Filters bar styling (very slim inline look) */
.filters-bar {
  display: flex;
  flex-wrap: wrap;
  gap: 1.5rem;
  align-items: center;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid #f4f4f5;
}

.filter-group {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.filter-group label {
  font-size: 0.7rem;
  font-weight: 700;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.filter-group select {
  background: var(--surface-color);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-sm);
  padding: 0.35rem 1.8rem 0.35rem 0.5rem;
  color: var(--text-main);
  font-size: 0.8rem;
  font-weight: 500;
  transition: all 0.15s ease;
  font-family: 'Inter', sans-serif;
  cursor: pointer;
  outline: none;
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%2371717a' stroke-width='2'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' d='M19 9l-7 7-7-7'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 0.5rem center;
  background-size: 0.75rem;
  min-width: 120px;
}

.filter-group select:focus {
  border-color: var(--primary);
}

/* Links & Text style in table cells */
.business-link {
  color: var(--text-main);
  text-decoration: none;
  font-weight: 600;
  display: block;
  max-width: 100%;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.business-link:hover {
  text-decoration: underline;
}

.website-link {
  color: var(--text-muted);
  text-decoration: none;
  display: block;
  max-width: 100%;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.website-link:hover {
  color: var(--text-main);
  text-decoration: underline;
}

.website-text {
  display: block;
  max-width: 100%;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  color: var(--text-muted);
}

/* Specific column constraint styles to prevent table breaking */
.name-cell {
  max-width: 150px;
}
.phone-cell {
  white-space: nowrap;
}
.email-cell {
  max-width: 120px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.website-cell {
  max-width: 140px;
}
.address-cell {
  max-width: 200px;
  white-space: normal !important;
  word-wrap: break-word;
  overflow-wrap: break-word;
  line-height: 1.4;
  color: var(--text-muted);
}
.note-cell {
  text-align: center;
  font-weight: 600;
}
.status-cell {
  white-space: nowrap;
}

/* Location input styling details */
.relative-input {
  position: relative;
}

.label-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.map-trigger-btn {
  background: none;
  border: none;
  color: var(--primary);
  font-size: 0.7rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  cursor: pointer;
  padding: 0;
  transition: color 0.15s ease;
}

.map-trigger-btn:hover {
  color: var(--primary-hover);
  text-decoration: underline;
}

.input-with-action {
  position: relative;
  display: flex;
  align-items: center;
  width: 100%;
}

.input-with-action input {
  width: 100%;
}

.input-with-action input.custom-coords-active {
  border-color: var(--primary);
  background: #f5f3ff;
  color: var(--primary);
  font-weight: 500;
}

.clear-coords-btn {
  position: absolute;
  right: 8px;
  background: #f4f4f5;
  border: none;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  color: var(--text-muted);
  font-size: 0.65rem;
  font-weight: bold;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.15s ease;
}

.clear-coords-btn:hover {
  background: #ede9fe;
  color: var(--primary);
}

.coords-badge {
  display: block;
  font-size: 0.7rem;
  font-weight: 500;
  color: var(--primary);
  margin-top: 0.25rem;
}

/* Map Modal Overlay styles */
.map-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(9, 9, 11, 0.4);
  backdrop-filter: blur(4px);
  -webkit-backdrop-filter: blur(4px);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
}

.map-modal {
  background: var(--surface-color);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-lg);
  width: 90%;
  max-width: 700px;
  max-height: 90vh;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.05), 0 10px 10px -5px rgba(0, 0, 0, 0.03);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.map-modal-header {
  padding: 1rem 1.5rem;
  border-bottom: 1px solid var(--border-color);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.map-modal-header h3 {
  font-family: 'Outfit', sans-serif;
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--text-main);
}

.close-btn {
  background: none;
  border: none;
  font-size: 1.1rem;
  color: var(--text-muted);
  cursor: pointer;
  transition: color 0.15s ease;
}

.close-btn:hover {
  color: var(--text-main);
}

.map-modal-body {
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  overflow-y: auto;
}

.map-search-bar {
  position: relative;
  display: flex;
  flex-direction: column;
  z-index: 1010;
}

.search-input-wrapper {
  display: flex;
  gap: 0.5rem;
}

.search-input-wrapper input {
  flex: 1;
  background: var(--surface-color);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-sm);
  padding: 0.5rem 0.75rem;
  font-size: 0.85rem;
  font-family: 'Inter', sans-serif;
}

.search-input-wrapper input:focus {
  outline: none;
  border-color: var(--primary);
}

.map-search-btn {
  background: var(--primary);
  color: var(--primary-contrast);
  border: none;
  border-radius: var(--radius-sm);
  padding: 0 1rem;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s ease;
}

.map-search-btn:hover {
  background: var(--primary-hover);
}

.map-search-results {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: var(--surface-color);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-sm);
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.05);
  margin-top: 0.25rem;
  max-height: 180px;
  overflow-y: auto;
}

.search-result-item {
  padding: 0.5rem 0.75rem;
  cursor: pointer;
  display: flex;
  gap: 0.5rem;
  font-size: 0.8rem;
  border-bottom: 1px solid var(--border-color);
  transition: background-color 0.1s ease;
}

.search-result-item:hover {
  background: #fbfbfb;
}

.search-result-item .name {
  color: var(--text-main);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.map-container-wrapper {
  position: relative;
  border-radius: var(--radius-md);
  overflow: hidden;
  border: 1px solid var(--border-color);
}

#map-container {
  height: 300px;
  width: 100%;
  z-index: 1;
}

.map-center-indicator {
  position: absolute;
  bottom: 8px;
  left: 50%;
  transform: translateX(-50%);
  pointer-events: none;
  z-index: 1000;
}

.instruction-bubble {
  background: var(--primary);
  color: var(--primary-contrast);
  padding: 0.3rem 0.6rem;
  border-radius: 9999px;
  font-size: 0.7rem;
  font-weight: 500;
}

.map-controls {
  background: #fbfbfb;
  padding: 0.75rem 1rem;
  border-radius: var(--radius-sm);
  border: 1px solid var(--border-color);
}

.radius-slider-group {
  display: flex;
  flex-direction: column;
  gap: 0.375rem;
}

.slider-label {
  display: flex;
  justify-content: space-between;
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--text-muted);
}

.radius-value {
  color: var(--text-main);
}

.radius-slider-group input[type="range"] {
  width: 100%;
  height: 4px;
  background: #e4e4e7;
  border-radius: 2px;
  outline: none;
  -webkit-appearance: none;
  cursor: pointer;
}

.radius-slider-group input[type="range"]::-webkit-slider-thumb {
  -webkit-appearance: none;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: var(--primary);
  transition: transform 0.1s ease;
}

.radius-slider-group input[type="range"]::-webkit-slider-thumb:hover {
  transform: scale(1.2);
}

.map-modal-footer {
  padding: 1rem 1.5rem;
  border-top: 1px solid var(--border-color);
  background: #fbfbfb;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.selected-coords-info {
  display: flex;
  flex-direction: column;
  gap: 0.15rem;
}

.coords-tag {
  font-size: 0.6rem;
  font-weight: 800;
  letter-spacing: 0.05em;
  color: var(--text-muted);
}

.coords-numbers {
  font-family: monospace;
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--text-main);
}

.cancel-btn {
  background: var(--surface-color);
  border: 1px solid var(--border-color);
  color: var(--text-muted);
  border-radius: var(--radius-sm);
  padding: 0.5rem 1rem;
  font-size: 0.8rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s ease;
}

.cancel-btn:hover {
  background: #fbfbfb;
  color: var(--text-main);
}

.apply-btn {
  background: var(--primary);
  color: var(--primary-contrast);
  border: none;
  border-radius: var(--radius-sm);
  padding: 0.5rem 1.25rem;
  font-size: 0.8rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s ease;
}

.apply-btn:hover {
  background: var(--primary-hover);
}

/* Leaflet Pin (Monochrome UI style override) */
.custom-pin {
  width: 24px;
  height: 24px;
  border-radius: 50% 50% 50% 0;
  background: var(--primary);
  position: absolute;
  transform: rotate(-45deg);
  left: 50%;
  top: 50%;
  margin: -12px 0 0 -12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  border: 2px solid white;
  z-index: 99;
}

.custom-pin::after {
  content: '';
  width: 8px;
  height: 8px;
  margin: 6px 0 0 6px;
  background: white;
  position: absolute;
  border-radius: 50%;
}
</style>
