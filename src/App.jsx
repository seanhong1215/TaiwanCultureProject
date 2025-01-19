import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from '@/pages/Home';
import ActivityList from '@/pages/ActivityList';
import Journal from '@/pages/Journal';
import Header from '@/layouts/Header';
import Footer from '@/layouts/Footer';
import '@/assets/css/main.scss';

const App = () => {
  return (
    <Router>
      <Header />
      <main className="container-fluid gx-0">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/activityList" element={<ActivityList />} />
          <Route path="/journal" element={<Journal />} />
        </Routes>
      </main>
      <Footer />
    </Router>
  );
};

export default App;
