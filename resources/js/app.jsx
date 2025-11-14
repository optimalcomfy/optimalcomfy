import './bootstrap';
import '../css/app.css';

import "primereact/resources/themes/lara-light-indigo/theme.css";
import "primereact/resources/primereact.min.css";
import "primeicons/primeicons.css";
import 'primeflex/primeflex.css';

import '../css/layout.css'

import { createRoot } from 'react-dom/client';
import { createInertiaApp } from '@inertiajs/react';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import { LayoutProvider } from "@/Layouts/layout/context/layoutcontext.jsx";
import { PrimeReactProvider } from "primereact/api";

const appName = import.meta.env.VITE_APP_NAME || 'Ristay';

// Enhanced NProgress Configuration
const ProgressBar = {
  delay: 250,
  color: '#3B82F6',
  includeCSS: false,
  showSpinner: true,

  template: `
    <div class="bar" role="bar">
      <div class="peg"></div>
    </div>
    <div class="spinner" role="spinner">
      <div class="spinner-content">
        <div class="spinner-icon"></div>
        <div class="spinner-text">Ristay</div>
      </div>
    </div>
  `
};

createInertiaApp({
  title: (title) => `${title} - ${appName}`,
  resolve: (name) => resolvePageComponent(`./Pages/${name}.jsx`, import.meta.glob('./Pages/**/*.jsx')),
  setup({ el, App, props }) {
    const root = createRoot(el);
    root.render(
      <PrimeReactProvider>
        <LayoutProvider>
          <App {...props} />
        </LayoutProvider>
      </PrimeReactProvider>
    );
  },
  progress: ProgressBar
});
