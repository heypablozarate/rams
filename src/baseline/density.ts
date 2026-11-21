export type Density = 'default' | 'compact' | 'wide';
let sessionDensity: Density = 'default';
let sessionOnly = false;

export function readDensity(): Density {
  if (sessionOnly) return sessionDensity;
  try {
    const stored = localStorage.getItem('rams-density');
    sessionDensity = stored === 'compact' || stored === 'wide' ? stored : 'default';
    if (stored === 'comfortable') {
      try { localStorage.setItem('rams-density', 'default'); }
      catch { sessionOnly = true; }
    }
  } catch { sessionOnly = true; }
  return sessionDensity;
}

export function initializeDensity() {
  document.documentElement.dataset.density = readDensity();
  window.addEventListener('storage', event => {
    if (event.key === 'rams-density' || event.key === null) {
      document.documentElement.dataset.density = readDensity();
      window.dispatchEvent(new Event('rams-density-change'));
    }
  });
}

export function setDensity(value: Density) {
  sessionDensity = value;
  document.documentElement.dataset.density = value;
  try { localStorage.setItem('rams-density', value); }
  catch { sessionOnly = true; }
  window.dispatchEvent(new Event('rams-density-change'));
}
