import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Register PWA Service Worker
if ('serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then((reg) => console.log('[PWA] Service Worker inscrit avec succès:', reg.scope))
      .catch((err) => console.debug('[PWA] Erreur inscription Service Worker:', err));
  });
} else if ('serviceWorker' in navigator) {
  // Register in dev mode if supported for local testing
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then((reg) => console.log('[PWA Dev] Service Worker actif:', reg.scope))
      .catch((err) => console.debug('[PWA Dev] SW registration note:', err));
  });
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

