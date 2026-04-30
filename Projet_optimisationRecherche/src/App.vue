<template>
  <router-view></router-view>
</template>

<style>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Outfit:wght@500;700;800&display=swap');

:root {
  --bg-color: #f8fafc;
  --glass-bg: rgba(255, 255, 255, 0.85);
  --glass-border: rgba(255, 255, 255, 1);
  --primary: #3b82f6;
  --primary-hover: #2563eb;
  --secondary: #8b5cf6;
  --text-main: #0f172a;
  --text-muted: #64748b;
  --accent: #10b981;
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
}

.dashboard {
  position: relative;
  width: 100vw;
  min-height: 100vh;
  padding: 2rem;
  display: flex;
  justify-content: center;
  align-items: center;
}

.background-orbs {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
  z-index: -1;
  pointer-events: none;
}

.orb {
  position: absolute;
  border-radius: 50%;
  filter: blur(100px);
  opacity: 0.4;
  animation: float 20s infinite ease-in-out alternate;
}

.orb-1 {
  width: 500px;
  height: 500px;
  background: var(--primary);
  top: -150px;
  left: -150px;
}

.orb-2 {
  width: 600px;
  height: 600px;
  background: #a78bfa;
  bottom: -200px;
  right: -150px;
  animation-delay: -5s;
}

.orb-3 {
  width: 400px;
  height: 400px;
  background: #fbcfe8;
  top: 40%;
  left: 50%;
  transform: translate(-50%, -50%);
  animation-delay: -10s;
}

@keyframes float {
  0% { transform: translate(0, 0) scale(1); }
  100% { transform: translate(30px, 50px) scale(1.1); }
}

.glass-container {
  background: var(--glass-bg);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid var(--glass-border);
  border-radius: 24px;
  padding: 3rem;
  width: 100%;
  max-width: 1100px;
  box-shadow: 0 20px 40px -15px rgba(0, 0, 0, 0.05), 0 0 20px rgba(255,255,255,0.5) inset;
  display: flex;
  flex-direction: column;
  gap: 2.5rem;
}

.header {
  text-align: center;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}

.logout-btn {
  background: white;
  border: 1px solid #ef4444;
  color: #ef4444;
  border-radius: 8px;
  padding: 0.5rem 1rem;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.logout-btn:hover {
  background: #ef4444;
  color: white;
}

.header h1 {
  font-family: 'Outfit', sans-serif;
  font-size: 3.5rem;
  font-weight: 800;
  letter-spacing: -1px;
  margin-bottom: 0.5rem;
  color: var(--text-main);
}

.gradient-text {
  background: linear-gradient(135deg, #3b82f6, #8b5cf6);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.header p {
  font-size: 1.1rem;
  color: var(--text-muted);
}

.search-panel {
  display: flex;
  gap: 1.5rem;
  align-items: flex-end;
  background: rgba(255, 255, 255, 0.6);
  padding: 1.5rem;
  border-radius: 16px;
  border: 1px solid rgba(226, 232, 240, 0.8);
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.02);
}

.input-group {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.input-group label {
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--text-main);
}

.input-group input {
  background: rgba(255, 255, 255, 0.8);
  border: 1px solid #cbd5e1;
  border-radius: 12px;
  padding: 0.8rem 1rem;
  color: var(--text-main);
  font-size: 1rem;
  transition: all 0.3s ease;
  font-family: 'Inter', sans-serif;
}

.input-group input::placeholder {
  color: #94a3b8;
}

.input-group input:focus {
  outline: none;
  border-color: var(--primary);
  background: #ffffff;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.15);
}

.primary-btn {
  background: linear-gradient(135deg, var(--primary), var(--secondary));
  color: white;
  border: none;
  border-radius: 12px;
  padding: 0.8rem 2rem;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  height: 48px;
  font-family: 'Inter', sans-serif;
  box-shadow: 0 4px 15px rgba(59, 130, 246, 0.25);
}

.primary-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(59, 130, 246, 0.35);
}

.primary-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
  transform: none;
}

.progress-bar-container {
  width: 100%;
  height: 8px;
  background: #e2e8f0;
  border-radius: 4px;
  overflow: hidden;
}

.progress-bar {
  height: 100%;
  background: linear-gradient(90deg, var(--primary), var(--accent));
  transition: width 0.3s ease;
}

.results-panel {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.panel-header h2 {
  font-family: 'Outfit', sans-serif;
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--text-main);
}

.export-btn {
  background: white;
  border: 1px solid var(--accent);
  color: var(--accent);
  border-radius: 8px;
  padding: 0.6rem 1.2rem;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 2px 4px rgba(16, 185, 129, 0.1);
}

.export-btn:hover:not(:disabled) {
  background: var(--accent);
  color: white;
}

.export-btn:disabled {
  border-color: #cbd5e1;
  color: #94a3b8;
  background: transparent;
  cursor: not-allowed;
  box-shadow: none;
}

.table-container {
  overflow-x: auto;
  background: rgba(255, 255, 255, 0.6);
  border-radius: 16px;
  border: 1px solid #e2e8f0;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.02);
}

table {
  width: 100%;
  border-collapse: collapse;
  text-align: left;
}

th, td {
  padding: 1rem 1.5rem;
  border-bottom: 1px solid #f1f5f9;
}

th {
  font-size: 0.85rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--text-muted);
  font-weight: 700;
  background: rgba(248, 250, 252, 0.8);
}

tr:last-child td {
  border-bottom: none;
}

tr {
  transition: background-color 0.2s ease;
}

tr:hover {
  background: rgba(241, 245, 249, 0.8);
}

.status-badge {
  display: inline-block;
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.status-badge.extracted {
  background: #d1fae5;
  color: #059669;
  border: 1px solid #a7f3d0;
}

.status-badge.scraping... {
  background: #fef3c7;
  color: #d97706;
  border: 1px solid #fde68a;
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: .6; }
}
</style>
