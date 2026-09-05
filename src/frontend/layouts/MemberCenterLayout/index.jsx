import { Outlet } from 'react-router-dom';
import MemberMenu from '@/frontend/layouts/MemberMenu';
import Header from '@/frontend/components/Header';
import Footer from '@/frontend/components/Footer';

const MemberLayout = () => {
  return (
    <>
      <Header />
        <div className="page-section">
          <div className="container">
            <div className="row">
              <div className="col-lg-3">
                <MemberMenu />
              </div>
              <div className="col-lg-9">
                  <Outlet />
              </div>
            </div>
          </div>
        </div>
      <Footer />
    </>
  );
}
export default MemberLayout;