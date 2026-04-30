<script setup lang="ts">
import { ref } from 'vue';
import * as XLSX from 'xlsx';

const query = ref('');
const location = ref('');
const limit = ref(5);
const isExtracting = ref(false);
const progress = ref(0);
const results = ref<any[]>([]);
let eventSource: EventSource | null = null;

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
  if (results.value.length === 0) return;

  const dataForExcel = results.value.map(item => ({
    'Nom du Commerce': item.name,
    'Téléphone': item.phone,
    'Email': item.email,
    'Site Web': item.website,
    'Statut': item.status
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
  <main class="dashboard">
    <div class="background-orbs">
      <div class="orb orb-1"></div>
      <div class="orb orb-2"></div>
      <div class="orb orb-3"></div>
    </div>

    <div class="glass-container">
      <header class="header">
        <div class="header-content">
          <div>
            <h1><span class="gradient-text">GeoScraper</span> Pro</h1>
            <p>Google Maps to CRM Automation Tool</p>
          </div>
          <button class="logout-btn" @click="logout">Se déconnecter</button>
        </div>
      </header>

      <div class="search-panel">
        <div class="input-group">
          <label for="query">Business Type</label>
          <input type="text" id="query" v-model="query" placeholder="e.g., Restaurants, Plumbers..." />
        </div>
        <div class="input-group">
          <label for="location">Location</label>
          <input type="text" id="location" v-model="location" placeholder="e.g., Lyon, France" />
        </div>
        <div class="input-group" style="flex: 0.5;">
          <label for="limit">Max Results</label>
          <input type="number" id="limit" v-model="limit" min="1" max="50" />
        </div>
        <button class="primary-btn" @click="startExtraction" :disabled="isExtracting">
          <span v-if="!isExtracting">Start Extraction</span>
          <span v-else>Extracting... ({{ progress }}%)</span>
        </button>
      </div>

      <div class="progress-bar-container" v-if="isExtracting || progress === 100">
        <div class="progress-bar" :style="{ width: progress + '%' }"></div>
      </div>

      <div class="results-panel">
        <div class="panel-header">
          <h2>Live Results</h2>
          <button class="export-btn" @click="exportToExcel" :disabled="isExtracting || progress !== 100">
            Export to CRM / Excel
          </button>
        </div>
        
        <div class="table-container">
          <table>
            <thead>
              <tr>
                <th>Business Name</th>
                <th>Phone</th>
                <th>Email</th>
                <th>Website</th>
                <th>Adresse</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="result in results" :key="result.id" :class="{'processing': result.status === 'Scraping...'}">
                <td>{{ result.name }}</td>
                <td>{{ result.phone }}</td>
                <td>{{ result.email }}</td>
                <td>{{ result.website }}</td>
                <td>{{ result.adresse }}</td> 
                <td>
                  <span class="status-badge" :class="result.status.toLowerCase()">
                    {{ result.status }}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </main>
</template>

<style scoped></style>
