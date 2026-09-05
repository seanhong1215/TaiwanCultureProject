import { createRoot } from 'react-dom/client'

// 過濾已知第三方套件（React Bootstrap / ReactQuill）的 findDOMNode 棄用警告
if (import.meta.env.DEV) {
  const originalError = console.error;
  console.error = (...args) => {
    if (typeof args[0] === 'string' && args[0].includes('findDOMNode')) return;
    originalError(...args);
  };
}
import App from './App'
import '@/frontend/i18n';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import '@/frontend/assets/css/main.scss';

const app = createRoot(document.getElementById('root'));
app.render(
    <App />
);
