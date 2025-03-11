import { createRoot } from 'react-dom/client'
import App from './App'
import '@/frontend/i18n';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import '@/frontend/assets/css/main.scss';

const app = createRoot(document.getElementById('root'));
app.render(
    <App />
);
