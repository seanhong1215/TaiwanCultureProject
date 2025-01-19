import { useState } from 'react'
import { Link } from 'react-router-dom';
import './Header.scss';

const Header = () => {
  const [language, setLanguage] = useState('zh'); // 預設語言為中文

  const handleLanguageChange = (e) => {
    setLanguage(e.target.value);
  };

    return (
      <header className="header bg-primary text-white py-3">
      <nav className="navbar navbar-expand-lg navbar-light">
        <div className="container d-flex justify-content-between align-items-center">
          <Link className="navbar-brand nav-link text-white" to="/">{language === 'zh' ? '體驗台灣好文化' : language === 'en' ? 'Experience Taiwan’s great culture' : '台湾の素晴らしい文化を体験'}</Link>
          <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
            <span className="navbar-toggler-icon"></span>
          </button>
          <div className="collapse navbar-collapse" id="navbarNav">
            <ul className="navbar-nav ms-auto">
              <li className="nav-item">
                <Link className="nav-link text-white" to="/">首頁</Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link text-white" to="/activityList">所有活動</Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link text-white" to="/journal">慢活日誌</Link>
              </li>
              {/* 多國語系切換 */}
              <li className="nav-item dropdown ms-3">
                <a className="nav-link dropdown-toggle text-white" href="#" id="navbarDropdown" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                  多國語言
                </a>
                <ul className="dropdown-menu" aria-labelledby="navbarDropdown">
                  <li>
                    <button className="dropdown-item" value="zh" onClick={handleLanguageChange}>中文</button>
                  </li>
                  <li>
                    <button className="dropdown-item" value="en" onClick={handleLanguageChange}>English</button>
                  </li>
                  <li>
                    <button className="dropdown-item" value="jp" onClick={handleLanguageChange}>日本語</button>
                  </li>
                </ul>
              </li>
              {/* 登入註冊按鈕 */}
              {/* <li className="nav-item">
                <a className="btn btn-primary" href="/login">登入</a>
              </li>
              <li className="nav-item ms-2">
                <a className="btn btn-secondary" href="/register">註冊</a>
              </li> */}
            </ul>
          </div>
        </div>
      </nav>
    </header>
    );
  };

  export default Header;