<script setup lang="ts">
import { ref, computed, onBeforeUnmount, nextTick, watch } from 'vue';
import * as XLSX from 'xlsx';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const query = ref('');
const location = ref('');
const limit = ref(5);
const isExtracting = ref(false);
const progress = ref(0);
const results = ref<any[]>([]);
const activeProfile = ref('standard');
let eventSource: EventSource | null = null;

// Reactive state for filters and sorting
const minRating = ref<string>('all');
const websiteFilter = ref<string>('all');
const sortBy = ref<string>('default');

const currentPage = ref(1);
const itemsPerPage = ref(20);

watch([minRating, websiteFilter, sortBy], () => {
  currentPage.value = 1;
});

// Map Selection & Modal State
const showMapModal = ref(false);
const coords = ref<{ lat: number; lng: number; zoom: number } | null>(null);
const previewCoords = ref<{ lat: number; lng: number } | null>(null);
const searchQueryMap = ref('');
const searchResultsMap = ref<any[]>([]);
const isSearchingMap = ref(false);
const radius = ref(2000); // Visual search radius indicator in meters (default 2km)

const selectedResult = ref<any>(null);

let map: L.Map | null = null;
let marker: L.Marker | null = null;
let circle: L.Circle | null = null;

const openResult = (result: any) => {
  selectedResult.value = result;
};

const closeResultModal = () => {
  selectedResult.value = null;
};

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

const getOuvertureClass = (ouverture: any): string => {
  if (!ouverture) return 'text-muted';
  const str = String(ouverture).toLowerCase();
  if (str.includes('ouvert')) return 'text-green';
  if (str.includes('fermé') || str.includes('ferme')) return 'text-red';
  return 'text-muted';
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

const totalPages = computed(() => Math.ceil(filteredAndSortedResults.value.length / itemsPerPage.value) || 1);

const paginatedResults = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value;
  return filteredAndSortedResults.value.slice(start, start + itemsPerPage.value);
});

const startExtraction = () => {
  if (!query.value || !location.value) return;
  isExtracting.value = true;
  progress.value = 0;
  results.value = [];
  currentPage.value = 1;
  
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

  url.searchParams.append('profile', activeProfile.value);

  eventSource = new EventSource(url.toString(), { withCredentials: true });

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

const logout = async () => {
  try {
    await fetch('http://localhost:3000/api/logout', { method: 'POST', credentials: 'include' });
  } catch (e) {
    console.error(e);
  }
  router.push('/login');
};
</script>

<template>
  <main class="dashboard-fullscreen">
    <div class="dashboard-layout">
      <!-- Left Panel: Sidebar Control Center -->
      <aside class="sidebar">
        <div class="sidebar-header">
          <svg viewBox="0 0 256 256" class="sidebar-logo" fill="currentColor">
            <path d="M 144 256 L 27.598 256 L 144 139.598 Z M 256 207.5 L 200 256 L 200 56 L 0 56 L 48 0 L 256 0 Z M 0 204.402 L 0 112 L 92.402 112 Z" />
          </svg>
          <button class="logout-icon-btn" @click="logout" title="Se déconnecter">
            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line>
            </svg>
          </button>
        </div>

        <div class="workspace-row">
          <span class="workspace-badge">G</span>
          <span class="workspace-label">GeoScraper Pro</span>
        </div>

        <div class="search-panel">
          <div class="input-group">
            <label for="profile">Profil d'extraction</label>
            <select id="profile" v-model="activeProfile" style="width: 100%; background: var(--surface-color); border: 1px solid var(--border-color); border-radius: 6px; padding: 0.6rem 0.8rem; color: var(--text-main); font-size: 13px;">
              <option value="standard">Standard</option>
              <option value="dev">Développeur Informatique (B2B)</option>
            </select>
          </div>

          <div class="input-group">
            <label for="query">Recherche</label>
            <input type="text" id="query" v-model="query" placeholder="ex: Restaurants..." />
          </div>
          
          <div class="input-group">
            <div class="label-row">
              <label for="location">Zone</label>
              <button type="button" class="map-trigger-btn" @click="openMapModal" title="Carte">
                <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
              </button>
            </div>
            <div class="input-with-action">
              <input type="text" id="location" v-model="location" placeholder="ex: Paris" :class="{ 'custom-coords-active': coords && location === `${coords.lat}, ${coords.lng}` }" />
              <button v-if="coords && location === `${coords.lat}, ${coords.lng}`" class="clear-coords-btn" @click="clearCoordsSelection">✕</button>
            </div>
          </div>

          <div class="input-group">
            <label for="limit">Limite</label>
            <input type="number" id="limit" v-model="limit" min="1" max="500" />
          </div>

          <button class="scrape-btn" @click="startExtraction" :disabled="isExtracting">
            <svg v-if="!isExtracting" viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
            </svg>
            <span v-if="!isExtracting">Lancer l'extraction</span>
            <span v-else>Extraction... {{ progress }}%</span>
          </button>
          
          <div class="progress-bar-container" v-if="isExtracting || progress === 100">
            <div class="progress-bar" :style="{ width: progress + '%' }"></div>
          </div>
        </div>
      </aside>

      <!-- Right Panel: Main Content Workspace -->
      <main class="main-panel">
        <div class="panel-header">
          <div class="panel-header-left">
            <div class="panel-badge">G</div>
            <div>
              <div class="panel-title">GeoScraper</div>
              <div class="panel-subtitle">
                <template v-if="query && location">{{ query }} · {{ location }}</template>
                <template v-else>Prêt à extraire</template>
              </div>
            </div>
          </div>
          <button class="export-btn" @click="exportToExcel" :disabled="isExtracting || progress !== 100 || filteredAndSortedResults.length === 0">
            Exporter Excel
          </button>
        </div>

        <!-- Stats Grid & Filters -->
        <div class="stats-grid">
          <div class="stat-cell">
            <div class="stat-value">{{ filteredAndSortedResults.length }}</div>
            <div class="stat-key">RÉSULTATS</div>
            <div class="stat-sub">Lieux filtrés affichés</div>
          </div>
          <div class="stat-cell filter-cell">
            <label>NOTE MIN.</label>
            <select v-model="minRating">
              <option value="all">Toutes</option>
              <option value="3">3.0+</option>
              <option value="4">4.0+</option>
              <option value="4.5">4.5+</option>
            </select>
          </div>
          <div class="stat-cell filter-cell">
            <label>SITE WEB</label>
            <select v-model="websiteFilter">
              <option value="all">Tous</option>
              <option value="yes">Avec site</option>
              <option value="no">Sans site</option>
            </select>
          </div>
          <div class="stat-cell filter-cell">
            <label>TRIER PAR</label>
            <select v-model="sortBy">
              <option value="default">Défaut</option>
              <option value="rating-desc">Note max</option>
              <option value="name-asc">A-Z</option>
            </select>
          </div>
        </div>

        <!-- Data table -->
        <div class="data-table">
          <div class="table-header-row">
            <span class="col-nom">Nom</span>
            <span class="col-phone">Téléphone</span>
            <span class="col-addr">Adresse</span>
            <span class="col-open">Ouverture</span>
            <span class="col-score">Note</span>
            <span class="col-status">Statut</span>
          </div>
          
          <div class="table-body">
            <template v-if="filteredAndSortedResults.length > 0">
              <div class="table-row clickable" v-for="result in paginatedResults" :key="result.id" @click="openResult(result)">
                <span class="col-nom row-name" :title="result.name">{{ result.name }}</span>
                <span class="col-phone row-muted">{{ result.phone }}</span>
                <span class="col-addr row-muted" :title="result.adresse">{{ result.adresse }}</span>
                <span class="col-open font-semibold" :class="getOuvertureClass(result.ouverture)">{{ result.ouverture || 'Inconnu' }}</span>
                <span class="col-score row-score">{{ result.note }}</span>
                <span class="col-status">
                  <span class="badge" :class="result.status.toLowerCase().replace(/\./g, '')">
                    {{ result.status }}
                  </span>
                </span>
              </div>
            </template>
            <template v-else-if="isExtracting">
              <div class="table-row skeleton-row" v-for="i in Math.min(limit || 5, 8)" :key="'skel-'+i">
                <span class="col-nom"><div class="skeleton-box w-3/4"></div></span>
                <span class="col-phone"><div class="skeleton-box w-1/2"></div></span>
                <span class="col-addr"><div class="skeleton-box w-full"></div></span>
                <span class="col-open"><div class="skeleton-box w-2/3"></div></span>
                <span class="col-score"><div class="skeleton-box w-1/3"></div></span>
                <span class="col-status"><div class="skeleton-box w-2/3 badge-skel"></div></span>
              </div>
            </template>
            <template v-else-if="results.length === 0">
              <div class="empty-state">
                <svg viewBox="0 0 24 24" class="empty-icon" fill="none" stroke="currentColor" stroke-width="1.5">
                  <circle cx="12" cy="12" r="10"></circle>
                  <path d="M8 12h8M12 8v8" stroke-linecap="round"></path>
                </svg>
                <h3>Prêt pour l'extraction</h3>
                <p>Définissez un profil, saisissez votre recherche et votre zone géographique à gauche, puis lancez l'extraction.</p>
              </div>
            </template>
            <template v-else>
              <div class="empty-state">
                <svg viewBox="0 0 24 24" class="empty-icon" fill="none" stroke="currentColor" stroke-width="1.5">
                  <circle cx="12" cy="12" r="10"></circle>
                  <path d="m15 9-6 6M9 9l6 6" stroke-linecap="round"></path>
                </svg>
                <h3>Aucun résultat trouvé</h3>
                <p>Aucun prospect ne correspond aux filtres de recherche actuels. Essayez d'ajuster la note minimale ou le filtre de site web.</p>
              </div>
            </template>
          </div>
        </div>

        <div class="pagination-controls" v-if="totalPages > 1 && !isExtracting">
          <button class="page-btn" :disabled="currentPage === 1" @click="currentPage--">Précédent</button>
          <span class="page-info">Page {{ currentPage }} / {{ totalPages }}</span>
          <button class="page-btn" :disabled="currentPage === totalPages" @click="currentPage++">Suivant</button>
        </div>
      </main>
    </div>

    <!-- Map Modal -->
    <div class="map-modal-overlay" v-if="showMapModal" @click.self="closeMapModal">
      <div class="map-modal">
        <div class="map-modal-header">
          <h3>Cibler la zone géographique</h3>
          <button class="close-btn" @click="closeMapModal">✕</button>
        </div>
        
        <div class="map-modal-body">
          <div class="map-search-bar">
            <div class="search-input-wrapper">
              <input type="text" v-model="searchQueryMap" placeholder="Ex: Paris, France" @keyup.enter="searchLocationOnMap"/>
              <button class="map-search-btn" @click="searchLocationOnMap" :disabled="isSearchingMap">
                {{ isSearchingMap ? '...' : 'Chercher' }}
              </button>
            </div>
            
            <div class="map-search-results" v-if="searchResultsMap.length > 0">
              <div v-for="result in searchResultsMap" :key="result.place_id" class="search-result-item" @click="selectSearchResult(result)">
                <span>📍</span> <span class="name">{{ result.display_name }}</span>
              </div>
            </div>
          </div>
          
          <div class="map-container-wrapper">
            <div id="map-container"></div>
          </div>
          
          <div class="radius-slider-group">
            <div class="slider-label"><span>Rayon de visualisation</span><span>{{ (radius / 1000).toFixed(1) }} km</span></div>
            <input type="range" v-model.number="radius" min="500" max="25000" step="500" @input="updateRadius"/>
          </div>
        </div>
        
        <div class="map-modal-footer">
          <button class="cancel-btn" @click="closeMapModal">Annuler</button>
          <button class="apply-btn" @click="applyCoordsSelection">Confirmer la zone</button>
        </div>
      </div>
    </div>

    <!-- Result Details Modal -->
    <div class="result-modal-overlay" v-if="selectedResult" @click.self="closeResultModal">
      <div class="result-modal">
        <div class="result-modal-header">
          <h3>Détails du résultat</h3>
          <button class="close-btn" @click="closeResultModal">✕</button>
        </div>
        <div class="result-modal-body">
          <div class="detail-row">
            <span class="detail-label">Nom</span>
            <span class="detail-value">{{ selectedResult.name || 'Non renseigné' }}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Téléphone</span>
            <span class="detail-value">{{ selectedResult.phone || 'Non renseigné' }}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Adresse</span>
            <span class="detail-value">{{ selectedResult.adresse || 'Non renseigné' }}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Ouverture</span>
            <span class="detail-value font-semibold" :class="getOuvertureClass(selectedResult.ouverture)">{{ selectedResult.ouverture || 'Inconnu' }}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Note</span>
            <span class="detail-value row-score">{{ selectedResult.note || 'N/A' }}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Site Web</span>
            <span class="detail-value">
              <a v-if="hasWebsite(selectedResult.website)" :href="selectedResult.website.startsWith('http') ? selectedResult.website : 'https://' + selectedResult.website" target="_blank" rel="noopener noreferrer" class="website-link">
                {{ selectedResult.website }}
              </a>
              <span v-else>Non renseigné</span>
            </span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Statut</span>
            <span class="badge" :class="selectedResult.status.toLowerCase().replace(/\./g, '')">
              {{ selectedResult.status }}
            </span>
          </div>
          <div class="detail-row" v-if="selectedResult.businessAnalysis">
            <span class="detail-label" style="color: var(--primary);">Analyse Commerciale</span>
            <span class="detail-value" style="background: var(--surface-raised); padding: 8px; border-radius: 6px; border-left: 3px solid var(--primary); font-size: 13px;">{{ selectedResult.businessAnalysis }}</span>
          </div>
        </div>
        <div class="result-modal-footer">
          <button class="cancel-btn" @click="closeResultModal">Fermer</button>
        </div>
      </div>
    </div>
  </main>
</template>

<style scoped>
/* ========================
   DASHBOARD LAYOUT
   ======================== */
.dashboard-fullscreen {
  width: 100vw;
  height: 100vh;
  background: var(--bg-color);
  display: flex;
}

.dashboard-layout {
  display: grid;
  grid-template-columns: 260px 1fr;
  width: 100%;
  height: 100%;
  background: var(--surface-color);
  overflow: hidden;
  font-family: 'Inter', sans-serif;
}

/* ========================
   SIDEBAR
   ======================== */
.sidebar {
  width: 260px;
  background: var(--surface-raised);
  border-right: 1px solid var(--border-color);
  display: flex;
  flex-direction: column;
  padding: 1.5rem;
}

.sidebar-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 2rem;
}

.sidebar-logo {
  width: 28px;
  height: 28px;
  color: var(--text-main);
}

.logout-icon-btn {
  background: transparent;
  border: none;
  color: var(--text-muted);
  cursor: pointer;
  transition: color 0.15s;
}

.logout-icon-btn:hover {
  color: #ef4444;
}

.workspace-row {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 2.5rem;
  padding: 0.5rem;
  background: var(--surface-color);
  border-radius: 8px;
  border: 1px solid var(--border-color);
}

.workspace-badge {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 6px;
  background: var(--primary);
  color: var(--primary-contrast);
  font-size: 14px;
  font-weight: 700;
}

.workspace-label {
  color: var(--text-main);
  font-size: 13px;
  font-weight: 600;
}

.search-panel {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.input-group label, .label-row label {
  display: block;
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.05em;
  color: var(--text-muted);
  text-transform: uppercase;
  margin-bottom: 0.5rem;
}

.input-group input {
  width: 100%;
  background: var(--surface-color);
  border: 1px solid var(--border-color);
  border-radius: 6px;
  padding: 0.6rem 0.8rem;
  color: var(--text-main);
  font-size: 13px;
  transition: border-color 0.15s;
}

.input-group input:focus {
  outline: none;
  border-color: var(--primary);
}

.label-row {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
}

.map-trigger-btn {
  background: transparent;
  border: none;
  color: var(--primary);
  cursor: pointer;
  padding: 0 0 0.5rem 0;
}

.map-trigger-btn:hover {
  color: var(--primary-hover);
}

.input-with-action {
  position: relative;
  display: flex;
  align-items: center;
}

.clear-coords-btn {
  position: absolute;
  right: 8px;
  background: var(--surface-raised);
  border: none;
  color: var(--text-muted);
  width: 20px;
  height: 20px;
  border-radius: 50%;
  font-size: 10px;
  cursor: pointer;
}

.clear-coords-btn:hover {
  background: #e4e4e7;
}

.scrape-btn {
  margin-top: 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  background: #f5f3ff;
  border: 1px solid #ddd6fe;
  color: var(--primary);
  padding: 0.8rem;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s;
}

.scrape-btn:hover:not(:disabled) {
  background: #ede9fe;
}

.scrape-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.progress-bar-container {
  height: 4px;
  background: var(--border-color);
  border-radius: 2px;
  overflow: hidden;
}

.progress-bar {
  height: 100%;
  background: var(--primary);
  transition: width 0.3s;
}

/* ========================
   MAIN PANEL
   ======================== */
.main-panel {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 2rem 3rem;
  gap: 1.5rem;
  overflow: hidden;
  background: var(--bg-color);
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-shrink: 0;
}

.panel-header-left {
  display: flex;
  align-items: center;
  gap: 16px;
}

.panel-badge {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  background: var(--primary);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  font-weight: 700;
}

.panel-title {
  font-size: 20px;
  font-weight: 600;
  color: var(--text-main);
}

.panel-subtitle {
  font-size: 13px;
  color: var(--text-muted);
  margin-top: 4px;
}

.export-btn {
  background: var(--surface-color);
  border: 1px solid var(--border-color);
  color: var(--text-main);
  padding: 0.6rem 1.2rem;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.15s;
}

.export-btn:hover:not(:disabled) {
  background: var(--surface-raised);
}

.export-btn:disabled {
  opacity: 0.3;
}

/* STATS GRID */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  border: 1px solid var(--border-color);
  border-radius: 12px;
  background: var(--surface-color);
  flex-shrink: 0;
}

.stat-cell {
  padding: 1.25rem 1.5rem;
  border-right: 1px solid var(--border-color);
  display: flex;
  flex-direction: column;
  justify-content: center;
}
.stat-cell:last-child { border-right: none; }

.stat-value {
  font-size: 24px;
  font-weight: 600;
  color: var(--text-main);
}

.stat-key {
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.1em;
  color: var(--text-muted);
  margin-top: 4px;
}

.stat-sub {
  font-size: 11px;
  color: #a1a1aa;
  margin-top: 2px;
}

.filter-cell label {
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.1em;
  color: var(--text-muted);
  margin-bottom: 8px;
}

.filter-cell select {
  background: transparent;
  border: none;
  color: var(--text-main);
  font-size: 14px;
  font-weight: 500;
  outline: none;
  cursor: pointer;
}

.filter-cell select option {
  background: var(--surface-color);
}

/* DATA TABLE */
.data-table {
  flex: 1;
  display: flex;
  flex-direction: column;
  border: 1px solid var(--border-color);
  border-radius: 12px;
  background: var(--surface-color);
  overflow: hidden;
}

.table-header-row {
  display: flex;
  padding: 1rem 1.5rem;
  background: var(--surface-raised);
  border-bottom: 1px solid var(--border-color);
}

.table-header-row span {
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.08em;
  color: var(--text-muted);
  text-transform: uppercase;
}

.table-body {
  flex: 1;
  overflow-y: auto;
}

.table-row {
  display: flex;
  align-items: center;
  padding: 1rem 1.5rem;
  border-bottom: 1px solid var(--border-color);
  gap: 16px;
}
.table-row:hover {
  background: #fafafa;
}
.table-row.clickable {
  cursor: pointer;
}

.col-nom   { flex: 2; min-width: 0; }
.col-phone { flex: 1.5; min-width: 0; }
.col-addr  { flex: 2.5; min-width: 0; }
.col-open  { flex: 1.5; min-width: 0; }
.col-score { flex: 0.8; min-width: 0; }
.col-status { flex: 1.2; min-width: 0; }

.row-name { font-size: 13px; color: var(--text-main); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; font-weight: 500; }
.row-muted { font-size: 13px; color: var(--text-muted); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.row-score { font-size: 13px; color: var(--warning); font-weight: 600; }

.text-green { color: #059669; }
.text-red { color: #dc2626; }
.text-muted { color: var(--text-muted); }
.font-semibold { font-weight: 600; }

.badge {
  display: inline-flex;
  padding: 4px 8px;
  border-radius: 6px;
  font-size: 11px;
  font-weight: 600;
}
.badge.scraping { background: #fef3c7; color: #d97706; }
.badge.terminé { background: #d1fae5; color: #059669; }

/* Skeleton & Empty States */
.skeleton-box {
  background: linear-gradient(90deg, var(--surface-raised) 25%, #ededf0 37%, var(--surface-raised) 63%);
  background-size: 200% 100%;
  animation: skeleton-shimmer 1.4s ease infinite;
  height: 16px;
  border-radius: 4px;
}
.badge-skel {
  height: 24px;
  border-radius: 6px;
}
.w-full { width: 100%; } .w-3\/4 { width: 75%; } .w-1\/2 { width: 50%; } .w-1\/3 { width: 33%; } .w-2\/3 { width: 66%; }

@keyframes skeleton-shimmer {
  0% {
    background-position: -200% 0;
  }
  100% {
    background-position: 200% 0;
  }
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 5rem 2rem;
  text-align: center;
  height: 100%;
}

.empty-icon {
  width: 40px;
  height: 40px;
  color: var(--text-muted);
  opacity: 0.5;
  margin-bottom: 1.25rem;
}

.empty-state h3 {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-main);
  margin-bottom: 0.5rem;
}

.empty-state p {
  font-size: 13px;
  color: var(--text-muted);
  max-width: 380px;
  line-height: 1.6;
}

/* MAP MODAL */
.map-modal-overlay {
  position: fixed; top: 0; left: 0; width: 100vw; height: 100vh;
  background: rgba(0,0,0,0.4); backdrop-filter: blur(4px);
  display: flex; justify-content: center; align-items: center; z-index: 1000;
}

.map-modal {
  width: 600px; background: var(--surface-color); border: 1px solid var(--border-color); border-radius: 12px;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
}

.map-modal-header {
  display: flex; justify-content: space-between; padding: 1.5rem; border-bottom: 1px solid var(--border-color);
}
.map-modal-header h3 { font-size: 16px; color: var(--text-main); font-weight: 600; }
.close-btn { background: none; border: none; color: var(--text-muted); cursor: pointer; }

.map-modal-body { padding: 1.5rem; display: flex; flex-direction: column; gap: 1rem; }
.search-input-wrapper { display: flex; gap: 8px; }
.search-input-wrapper input { flex: 1; background: var(--surface-color); border: 1px solid var(--border-color); color: var(--text-main); padding: 0.5rem 1rem; border-radius: 6px; }
.map-search-btn { background: var(--primary); color: white; border: none; padding: 0 1rem; border-radius: 6px; cursor: pointer; }

#map-container { height: 300px; border-radius: 8px; }

.radius-slider-group input { width: 100%; margin-top: 8px; }
.slider-label { display: flex; justify-content: space-between; color: var(--text-muted); font-size: 12px; }

.map-modal-footer {
  display: flex; justify-content: flex-end; gap: 12px; padding: 1.5rem; border-top: 1px solid var(--border-color); background: var(--surface-raised);
}
.cancel-btn { background: var(--surface-color); color: var(--text-main); border: 1px solid var(--border-color); padding: 0.5rem 1rem; border-radius: 6px; cursor: pointer; }
.apply-btn { background: var(--primary); color: white; border: none; padding: 0.5rem 1rem; border-radius: 6px; cursor: pointer; }

/* RESULT MODAL */
.result-modal-overlay {
  position: fixed; top: 0; left: 0; width: 100vw; height: 100vh;
  background: rgba(0,0,0,0.4); backdrop-filter: blur(4px);
  display: flex; justify-content: center; align-items: center; z-index: 1000;
}

.result-modal {
  width: 500px; background: var(--surface-color); border: 1px solid var(--border-color); border-radius: 12px;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
}

.result-modal-header {
  display: flex; justify-content: space-between; padding: 1.5rem; border-bottom: 1px solid var(--border-color);
}
.result-modal-header h3 { font-size: 16px; color: var(--text-main); font-weight: 600; }

.result-modal-body { padding: 1.5rem; display: flex; flex-direction: column; gap: 1rem; }
.detail-row { display: flex; flex-direction: column; gap: 4px; }
.detail-label { font-size: 10px; font-weight: 700; letter-spacing: 0.08em; color: var(--text-muted); text-transform: uppercase; }
.detail-value { font-size: 14px; color: var(--text-main); font-weight: 500; word-break: break-word; }
.website-link { color: var(--primary); text-decoration: none; }
.website-link:hover { text-decoration: underline; }

.result-modal-footer {
  display: flex; justify-content: flex-end; padding: 1.5rem; border-top: 1px solid var(--border-color); background: var(--surface-raised);
}

/* PAGINATION CONTROLS */
.pagination-controls {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background: var(--surface-color);
  border-top: 1px solid var(--border-color);
  border-radius: 0 0 var(--radius-md) var(--radius-md);
}

.page-btn {
  background: var(--surface-raised);
  color: var(--text-main);
  border: 1px solid var(--border-color);
  padding: 0.5rem 1rem;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.15s;
}

.page-btn:hover:not(:disabled) {
  background: var(--primary);
  color: white;
  border-color: var(--primary);
}

.page-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.page-info {
  font-size: 13px;
  font-weight: 600;
  color: var(--text-muted);
}
</style>
