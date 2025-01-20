import { HashRouter as Router } from 'react-router-dom';
import { createRoot } from 'react-dom/client'
import '@/i18n';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import App from './App'

const app = createRoot(document.getElementById('root'));
app.render(
    <Router>
      <App />
    </Router>
);
