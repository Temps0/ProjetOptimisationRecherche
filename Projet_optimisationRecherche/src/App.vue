<template>
  <router-view></router-view>
</template>

<style>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Outfit:wght@300;400;500;600;700;800&display=swap');

:root {
  /* Warm off-white background with extremely subtle purple undertone */
  --bg-color: #faf9fc;
  --surface-color: #ffffff;
  --border-color: #ede9fe; /* Soft violet-tinted border */
  --text-main: #1c1230; /* Deep charcoal violet */
  --text-muted: #7c728a; /* Muted text with soft purple/gray hue */
  
  /* Signature Brand color: Royal Violet */
  --primary: #6d28d9;
  --primary-hover: #5b21b6;
  --primary-contrast: #ffffff;
  
  /* Status colors */
  --accent: #0d9488; /* Emerald teal for success dot */
  --warning: #ca8a04; /* Amber yellow for scraping dot */
  
  --radius-sm: 6px;
  --radius-md: 10px;
  --radius-lg: 20px;
}

* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  font-family: 'Inter', sans-serif;
  background-color: var(--bg-color);
  color: var(--text-main);
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  overflow-x: hidden;
  -webkit-font-smoothing: antialiased;
}

/* Base dashboard wrap */
.dashboard {
  position: relative;
  width: 100vw;
  min-height: 100vh;
  padding: 3.5rem 2.5rem;
  display: flex;
  justify-content: center;
  align-items: center;
}

/* Premium monochrome glass-container styling (Sober & Human) */
.glass-container {
  background: var(--surface-color);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-lg);
  padding: 4rem;
  width: 100%;
  max-width: 1320px; /* Wider for asymmetrical side-by-side view */
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.05), 0 1px 2px -1px rgba(0, 0, 0, 0.05);
  display: flex;
  flex-direction: column;
  gap: 2.5rem;
}

@media (max-width: 768px) {
  .glass-container {
    padding: 2rem;
  }
}

/* Inputs & Form styling */
.input-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.input-group label {
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--text-muted);
}

.input-group input {
  background: var(--surface-color);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-sm);
  padding: 0.75rem 1rem;
  color: var(--text-main);
  font-size: 0.9rem;
  transition: all 0.15s ease-in-out;
  font-family: 'Inter', sans-serif;
}

.input-group input::placeholder {
  color: #a1a1aa;
}

.input-group input:focus {
  outline: none;
  border-color: var(--primary);
  background: var(--surface-color);
}

/* Primary Button Styling */
.primary-btn {
  background: var(--primary);
  color: var(--primary-contrast);
  border: none;
  border-radius: var(--radius-sm);
  padding: 0.75rem 2rem;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s ease;
  height: 44px;
  font-family: 'Inter', sans-serif;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.primary-btn:hover:not(:disabled) {
  background: var(--primary-hover);
  transform: translateY(-1px);
}

.primary-btn:active:not(:disabled) {
  transform: translateY(0);
}

.primary-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

/* Progress indicator */
.progress-bar-container {
  width: 100%;
  height: 4px;
  background: #f4f4f5;
  border-radius: 2px;
  overflow: hidden;
}

.progress-bar {
  height: 100%;
  background: var(--primary);
  transition: width 0.3s ease;
}

/* Table container details */
.table-container {
  overflow-x: auto;
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  background: var(--surface-color);
}

table {
  width: 100%;
  border-collapse: collapse;
  text-align: left;
}

th, td {
  padding: 1.125rem 1.5rem;
  border-bottom: 1px solid var(--border-color);
  font-size: 0.85rem;
}

th {
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--text-muted);
  font-weight: 700;
  background: #fbfbfb;
}

tr:last-child td {
  border-bottom: none;
}

tr {
  transition: background-color 0.1s ease;
}

tr:hover {
  background: #fcfcfc;
}

/* Status dots instead of large colored pills */
.status-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: capitalize;
}

.status-badge::before {
  content: '';
  display: inline-block;
  width: 6px;
  height: 6px;
  border-radius: 50%;
}

.status-badge.extracted {
  color: var(--accent);
}

.status-badge.extracted::before {
  background-color: var(--accent);
}

.status-badge.scraping {
  color: var(--warning);
}

.status-badge.scraping::before {
  background-color: var(--warning);
  animation: pulse 1.5s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.4; transform: scale(1.15); }
}
</style>
