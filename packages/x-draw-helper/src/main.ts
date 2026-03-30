import { createApp } from 'vue';
import App from './App.vue';
import './style.css';
import { initTxIdCapture } from './api/transaction';
import { migrateStorageKeys } from './utils/storage';

migrateStorageKeys();
initTxIdCapture();

function initApp() {
  createApp(App).mount(
    (() => {
      const app = document.createElement('div');
      app.id = 'x-draw-helper';
      document.body.append(app);
      return app;
    })(),
  );
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initApp);
} else {
  initApp();
}
