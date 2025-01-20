// import { useState } from 'react'
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import './Header.scss';

const Header = () => {
  const { t } = useTranslation();
  const { i18n } = useTranslation();
  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
  };
    
    return (
      <header className="header bg-primary text-white py-3">
      <nav className="navbar navbar-expand-lg navbar-light">
        <div className="container d-flex justify-content-between align-items-center">
          <Link className="navbar-brand nav-link text-white" to="/">{t('websiteName')}</Link>
          <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
            <span className="navbar-toggler-icon"></span>
          </button>
          <div className="collapse navbar-collapse" id="navbarNav">
            <ul className="navbar-nav ms-auto">
              <li className="nav-item">
                <Link className="nav-link text-white" to="/activityList">{t('menu.activityList')}</Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link text-white" to="/journal">{t('menu.journal')}</Link>
              </li>
              {/* 多國語系切換 */}
              <li className="nav-item dropdown ms-3">
                <a className="nav-link dropdown-toggle text-white" href="#" id="navbarDropdown" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                {t('menu.lang')}
                </a>
                <ul className="dropdown-menu" aria-labelledby="navbarDropdown">
                  <li>
                    <button className="dropdown-item" onClick={() => changeLanguage('zhCn')}>{t('lang.zhCn')}</button>
                  </li>
                  <li>
                    <button className="dropdown-item" onClick={() => changeLanguage('en')}>{t('lang.en')}</button>
                  </li>
                  <li>
                    <button className="dropdown-item" onClick={() => changeLanguage('jp')}>{t('lang.jp')}</button>
                  </li>
                </ul>
              </li>
              {/* 登入註冊按鈕 */}
              <li className="nav-item">
                <a className="btn btn-primary" href="/login">登入</a>
              </li>
              <li className="nav-item ms-2">
                <a className="btn btn-secondary" href="/register">註冊</a>
              </li>
            </ul>
          </div>
        </div>
      </nav>
    </header>
    );
  };

  export default Header;