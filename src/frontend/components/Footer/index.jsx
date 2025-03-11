import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import './footer.scss';
import logo from '@/frontend/assets/images/logo.svg';

const Footer = () => {
    const { t } = useTranslation();

    return (
        <footer className="copyright">
        <div className="container text-center">
            <div className="footer-menu d-flex justify-content-between align-items-center">
                <Link className="navbar-brand nav-link d-flex align-items-center" to="/">
                    <h1 className="header-logo-side m-0 d-flex align-items-center">
                    <img
                        src={logo}
                        alt="logo" 
                        className="logo-img"
                    />
                    </h1>
                </Link>
                
                <ul className="navbar-nav">
                    <li className="nav-item">
                        <Link className="nav-link" to="/activity-list">{t('menu.activityList')}</Link>
                    </li>
                    <li className="nav-item">
                        <Link className="nav-link" to="/journal-list">{t('menu.journal')}</Link>
                    </li>
                </ul>
                
            </div>
            <p className="">{t('copyright')}</p>
        </div>
        </footer>
    );
};

export default Footer;