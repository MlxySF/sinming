import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import ErrorBoundary from './components/ErrorBoundary';
import { LanguageProvider } from './i18n';
import { ACADEMY } from './config';
import './styles.css';

// When a logo is configured, use it as the browser tab icon too.
if (ACADEMY.logoUrl) {
  const icon = document.querySelector('link[rel="icon"]');
  if (icon) icon.setAttribute('href', ACADEMY.logoUrl);
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ErrorBoundary>
      <LanguageProvider>
        <App />
      </LanguageProvider>
    </ErrorBoundary>
  </StrictMode>
);
