<template>
  <div class="mockup-chrome">
    <!-- Title bar -->
    <div class="title-bar">
      <div class="traffic-lights">
        <span class="tl" style="background:#ff5f57"></span>
        <span class="tl" style="background:#febc2e"></span>
        <span class="tl" style="background:#28c840"></span>
      </div>
      <div class="title-bar-icons left-icons">
        <!-- Panel icon -->
        <svg viewBox="0 0 24 24" class="tb-icon" fill="none" stroke="currentColor" stroke-width="1.5">
          <rect x="3" y="3" width="18" height="18" rx="2"/><line x1="9" y1="3" x2="9" y2="21"/>
        </svg>
        <svg viewBox="0 0 24 24" class="tb-icon" fill="none" stroke="currentColor" stroke-width="1.5">
          <polyline points="15 18 9 12 15 6"/>
        </svg>
        <svg viewBox="0 0 24 24" class="tb-icon faint" fill="none" stroke="currentColor" stroke-width="1.5">
          <polyline points="9 18 15 12 9 6"/>
        </svg>
      </div>
      <!-- URL bar -->
      <div class="url-bar">
        <svg viewBox="0 0 24 24" class="url-icon" fill="none" stroke="currentColor" stroke-width="1.5">
          <rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/>
        </svg>
        <span>geoscraper.app</span>
      </div>
      <div class="title-bar-icons right-icons">
        <!-- Refresh -->
        <svg viewBox="0 0 24 24" class="tb-icon" fill="none" stroke="currentColor" stroke-width="1.5">
          <polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/>
        </svg>
        <!-- Share -->
        <svg viewBox="0 0 24 24" class="tb-icon" fill="none" stroke="currentColor" stroke-width="1.5">
          <circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/>
          <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
        </svg>
        <!-- Plus -->
        <svg viewBox="0 0 24 24" class="tb-icon" fill="none" stroke="currentColor" stroke-width="1.5">
          <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
        </svg>
      </div>
    </div>

    <!-- App body -->
    <div class="app-body">
      <!-- Sidebar -->
      <aside class="sidebar">
        <div class="sidebar-header">
          <svg viewBox="0 0 256 256" class="sidebar-logo" fill="currentColor">
            <path d="M 144 256 L 27.598 256 L 144 139.598 Z M 256 207.5 L 200 256 L 200 56 L 0 56 L 48 0 L 256 0 Z M 0 204.402 L 0 112 L 92.402 112 Z" />
          </svg>
          <svg viewBox="0 0 24 24" class="sidebar-grid" fill="none" stroke="currentColor" stroke-width="1.5">
            <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
            <rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
          </svg>
        </div>

        <!-- Workspace badge -->
        <div class="workspace-row">
          <span class="workspace-badge">G</span>
          <span class="workspace-label">GeoScraper</span>
        </div>

        <!-- Nav items -->
        <nav class="sidebar-nav">
          <a href="#" class="sidebar-item active">
            <svg viewBox="0 0 24 24" class="s-icon" fill="none" stroke="currentColor" stroke-width="1.5">
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            <span>Recherche</span>
          </a>
          <a href="#" class="sidebar-item">
            <svg viewBox="0 0 24 24" class="s-icon" fill="none" stroke="currentColor" stroke-width="1.5">
              <polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/>
            </svg>
            <span>Projets</span>
          </a>
          <a href="#" class="sidebar-item">
            <svg viewBox="0 0 24 24" class="s-icon" fill="none" stroke="currentColor" stroke-width="1.5">
              <line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/>
              <line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/>
            </svg>
            <span>Extractions</span>
          </a>
        </nav>

        <!-- Recent runs -->
        <div class="recent-section">
          <span class="recent-label">RÉCENT</span>
          <div class="recent-item">
            <span class="status-dot done"></span>
            <span class="recent-text">Restaurants Paris</span>
          </div>
          <div class="recent-item">
            <span class="status-dot running"></span>
            <span class="recent-text">Pharmacies Lyon</span>
          </div>
          <div class="recent-item">
            <span class="status-dot done"></span>
            <span class="recent-text">Hôtels Bordeaux</span>
          </div>
        </div>
      </aside>

      <!-- Main panel -->
      <main class="main-panel">
        <!-- Workspace header -->
        <div class="panel-header">
          <div class="panel-header-left">
            <div class="panel-badge">G</div>
            <div>
              <div class="panel-title">GeoScraper</div>
              <div class="panel-subtitle">Extraction géolocalisée · Paris, France</div>
            </div>
          </div>
          <button class="scrape-btn">
            <svg viewBox="0 0 24 24" width="11" height="11" fill="none" stroke="currentColor" stroke-width="2">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
            </svg>
            Nouvelle extraction
          </button>
        </div>

        <!-- Stats grid -->
        <div class="stats-grid">
          <div class="stat-cell">
            <div class="stat-value">3 842</div>
            <div class="stat-key">RÉSULTATS</div>
            <div class="stat-sub">Lieux extraits</div>
          </div>
          <div class="stat-cell">
            <div class="stat-value">7</div>
            <div class="stat-key">PROJETS</div>
            <div class="stat-sub">Actifs ce mois</div>
          </div>
          <div class="stat-cell">
            <div class="stat-value">98.4%</div>
            <div class="stat-key">PRÉCISION</div>
            <div class="stat-sub">Taux de succès</div>
          </div>
          <div class="stat-cell">
            <div class="stat-value">1.2s</div>
            <div class="stat-key">VITESSE</div>
            <div class="stat-sub">Moy. par résultat</div>
          </div>
        </div>

        <!-- Data table -->
        <div class="data-table">
          <div class="table-header-row">
            <span class="col-nom">Nom</span>
            <span class="col-addr">Adresse</span>
            <span class="col-cat">Catégorie</span>
            <span class="col-score">Note</span>
            <span class="col-status">Statut</span>
          </div>
          <div class="table-row" v-for="row in tableRows" :key="row.nom">
            <span class="col-nom row-name">{{ row.nom }}</span>
            <span class="col-addr row-muted">{{ row.addr }}</span>
            <span class="col-cat row-muted">{{ row.cat }}</span>
            <span class="col-score row-score">{{ row.score }}</span>
            <span class="col-status">
              <span class="badge" :class="row.status">{{ row.label }}</span>
            </span>
          </div>
        </div>
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
const tableRows = [
  { nom: 'Café de Flore', addr: '172 Bd Saint-Germain', cat: 'Café', score: '4.4 ★', status: 'done', label: 'Terminé' },
  { nom: 'Le Comptoir du Relais', addr: '9 Carrefour de l\'Odéon', cat: 'Restaurant', score: '4.2 ★', status: 'running', label: 'En cours' },
  { nom: 'Boulangerie Poilâne', addr: '8 Rue du Cherche-Midi', cat: 'Boulangerie', score: '4.6 ★', status: 'done', label: 'Terminé' },
  { nom: 'Marché d\'Aligre', addr: 'Pl. d\'Aligre', cat: 'Marché', score: '4.5 ★', status: 'done', label: 'Terminé' },
  { nom: 'Hôtel du Temps', addr: '11 Rue de Montholon', cat: 'Hôtel', score: '4.3 ★', status: 'running', label: 'En cours' },
];
</script>

<style scoped>
/* ========================
   CHROME SHELL
   ======================== */
.mockup-chrome {
  border-radius: 12px 12px 0 0;
  overflow: hidden;
  background: #1a1a1c;
  box-shadow: 0 -20px 80px rgba(0, 0, 0, 0.32), 0 4px 24px rgba(0,0,0,0.2);
  border: 1px solid rgba(255,255,255,0.08);
  text-align: left;
  font-family: 'Inter', 'Helvetica Neue', sans-serif;
  font-size: 10px;
}

/* ========================
   TITLE BAR
   ======================== */
.title-bar {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: #242427;
  border-bottom: 1px solid rgba(255,255,255,0.05);
  padding: 0.5rem 0.75rem;
}

.traffic-lights {
  display: flex;
  gap: 4px;
  flex-shrink: 0;
}

.tl {
  width: 10px;
  height: 10px;
  border-radius: 50%;
}

.title-bar-icons {
  display: flex;
  align-items: center;
  gap: 6px;
}

.tb-icon {
  width: 12px;
  height: 12px;
  color: rgba(255,255,255,0.38);
  flex-shrink: 0;
}

.faint {
  color: rgba(255,255,255,0.2);
}

.url-bar {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  background: #1a1a1c;
  border-radius: 5px;
  padding: 3px 12px;
  color: rgba(255,255,255,0.55);
  font-size: 9px;
  max-width: 200px;
  margin: 0 auto;
}

.url-icon {
  width: 10px;
  height: 10px;
  color: rgba(255,255,255,0.35);
  flex-shrink: 0;
}

.right-icons {
  margin-left: auto;
}

/* ========================
   APP BODY
   ======================== */
.app-body {
  display: flex;
  height: 320px;
}

@media (min-width: 640px) {
  .app-body {
    height: 380px;
  }
}

/* ========================
   SIDEBAR
   ======================== */
.sidebar {
  width: 22%;
  min-width: 120px;
  max-width: 160px;
  border-right: 1px solid rgba(255,255,255,0.05);
  background: #1e1e21;
  padding: 0.625rem 0.625rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  overflow: hidden;
}

.sidebar-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 0.25rem;
}

.sidebar-logo {
  width: 14px;
  height: 14px;
  color: rgba(255,255,255,0.65);
}

.sidebar-grid {
  width: 12px;
  height: 12px;
  color: rgba(255,255,255,0.25);
}

.workspace-row {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 0.25rem;
}

.workspace-badge {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 16px;
  height: 16px;
  border-radius: 4px;
  background: #6d28d9;
  color: white;
  font-size: 8px;
  font-weight: 700;
  flex-shrink: 0;
}

.workspace-label {
  color: rgba(255,255,255,0.75);
  font-size: 9px;
  font-weight: 600;
  truncate: true;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.sidebar-nav {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.sidebar-item {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 4px 6px;
  border-radius: 5px;
  text-decoration: none;
  color: rgba(255,255,255,0.5);
  font-size: 9px;
  transition: background 0.12s ease, color 0.12s ease;
  white-space: nowrap;
}

.sidebar-item.active {
  background: rgba(255,255,255,0.07);
  color: rgba(255,255,255,0.85);
}

.s-icon {
  width: 11px;
  height: 11px;
  flex-shrink: 0;
}

.recent-section {
  margin-top: auto;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.recent-label {
  font-size: 7px;
  font-weight: 700;
  letter-spacing: 0.08em;
  color: rgba(255,255,255,0.25);
  text-transform: uppercase;
  padding: 0 6px;
  margin-bottom: 2px;
}

.recent-item {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 3px 6px;
}

.status-dot {
  width: 5px;
  height: 5px;
  border-radius: 50%;
  flex-shrink: 0;
}

.status-dot.done { background: rgba(40, 200, 64, 0.65); }
.status-dot.running {
  background: #febc2e;
  animation: pulse 1.5s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.45; transform: scale(1.15); }
}

.recent-text {
  font-size: 8.5px;
  color: rgba(255,255,255,0.5);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* ========================
   MAIN PANEL
   ======================== */
.main-panel {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  padding: 0.75rem 0.875rem;
  gap: 0.625rem;
}

.panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-shrink: 0;
}

.panel-header-left {
  display: flex;
  align-items: center;
  gap: 8px;
}

.panel-badge {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border-radius: 7px;
  background: #6d28d9;
  color: white;
  font-size: 11px;
  font-weight: 700;
  flex-shrink: 0;
}

.panel-title {
  font-size: 11px;
  font-weight: 600;
  color: rgba(255,255,255,0.9);
}

.panel-subtitle {
  font-size: 8px;
  color: rgba(255,255,255,0.38);
  margin-top: 1px;
}

.scrape-btn {
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 4px 10px;
  border-radius: 6px;
  background: rgba(109, 40, 217, 0.25);
  border: 1px solid rgba(109, 40, 217, 0.4);
  color: rgba(167, 139, 250, 0.9);
  font-size: 8px;
  font-weight: 600;
  cursor: pointer;
  font-family: inherit;
  transition: background 0.12s ease;
}

.scrape-btn:hover {
  background: rgba(109, 40, 217, 0.38);
}

/* ========================
   STATS GRID
   ======================== */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  border: 1px solid rgba(255,255,255,0.05);
  border-radius: 8px;
  background: rgba(255,255,255,0.025);
  overflow: hidden;
  flex-shrink: 0;
}

.stat-cell {
  padding: 8px 10px;
  border-right: 1px solid rgba(255,255,255,0.05);
}

.stat-cell:last-child { border-right: none; }

.stat-value {
  font-size: 14px;
  font-weight: 600;
  color: rgba(255,255,255,0.92);
  line-height: 1.2;
}

.stat-key {
  font-size: 6.5px;
  font-weight: 700;
  letter-spacing: 0.1em;
  color: rgba(255,255,255,0.28);
  text-transform: uppercase;
  margin-top: 2px;
}

.stat-sub {
  font-size: 7.5px;
  color: rgba(255,255,255,0.35);
  margin-top: 1px;
}

/* ========================
   DATA TABLE
   ======================== */
.data-table {
  flex: 1;
  overflow: hidden;
  border: 1px solid rgba(255,255,255,0.05);
  border-radius: 8px;
  background: rgba(255,255,255,0.025);
  display: flex;
  flex-direction: column;
}

.table-header-row,
.table-row {
  display: flex;
  align-items: center;
  padding: 5px 10px;
  gap: 6px;
  border-bottom: 1px solid rgba(255,255,255,0.04);
}

.table-row:last-child { border-bottom: none; }

.table-header-row {
  background: rgba(255,255,255,0.03);
}

.table-header-row span {
  font-size: 6.5px;
  font-weight: 700;
  letter-spacing: 0.08em;
  color: rgba(255,255,255,0.28);
  text-transform: uppercase;
}

.col-nom   { flex: 2; min-width: 0; }
.col-addr  { flex: 3; min-width: 0; display: none; }
.col-cat   { flex: 1.5; min-width: 0; }
.col-score { flex: 1; min-width: 0; }
.col-status { flex: 1.2; min-width: 0; }

@media (min-width: 640px) {
  .col-addr { display: flex; }
}

.row-name {
  font-size: 8.5px;
  color: rgba(255,255,255,0.78);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.row-muted {
  font-size: 8px;
  color: rgba(255,255,255,0.38);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.row-score {
  font-size: 8px;
  color: rgba(254, 188, 46, 0.8);
}

.badge {
  display: inline-flex;
  align-items: center;
  font-size: 7.5px;
  font-weight: 600;
  padding: 2px 6px;
  border-radius: 4px;
}

.badge.done {
  background: rgba(40, 200, 64, 0.12);
  color: rgba(40, 200, 64, 0.8);
}

.badge.running {
  background: rgba(254, 188, 46, 0.12);
  color: rgba(254, 188, 46, 0.85);
}
</style>
