import { Outlet } from 'react-router-dom';
import Header from '@/frontend/components/Header';
import Footer from '@/frontend/components/Footer';

const FrontendLayout = () => {
  return (
    <>
      <Header />
      <main className="container-fluid gx-0">
        <Outlet />
      </main>
      <Footer />
    </>
  )
};

export default FrontendLayout;
