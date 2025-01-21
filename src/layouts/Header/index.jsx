import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import './Header.scss';

const Header = () => {
  const { t } = useTranslation();
  const { i18n } = useTranslation();
  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
  };

  //登入註冊邏輯
  const [showModal, setShowModal] = useState(false);
  const [isLogin, setIsLogin] = useState(true); // 控制登入/註冊切換
  const handleOpenModal = () => setShowModal(true);
  const handleCloseModal = () => setShowModal(false);

  const handleLogin = (e) => {
    e.preventDefault();
    // 處理登入邏輯
    alert("登入成功！");
    setShowModal(false);
  };

  const handleRegister = (e) => {
    e.preventDefault();
    // 處理註冊邏輯
    alert("註冊成功！");
    setShowModal(false);
  };

  const handleGoogleSignIn = () => {
    // 在這裡處理 Google 登入邏輯
    console.log("Google Sign-In triggered");
  };

  useEffect(() => {
    if (showModal) {
      // 禁用背景滾動
      document.body.style.overflow = "hidden";
    } else {
      // 恢復背景滾動
      document.body.style.overflow = "auto";
    }
    // 清理函數，確保組件卸載時恢復滾動
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [showModal]);
    
    return (
      <header className="header bg-primary">
      <nav className="navbar navbar-expand-lg navbar-light text-white">
        <div className="container d-flex justify-content-between align-items-center">
          <Link className="navbar-brand nav-link text-white d-flex align-items-center" to="/">
            <div className="header-logo">LOGO</div>
            <h1 className="header-logo-side">
              {t('websiteName')}
              <p>{t('websiteNameEn')}</p>
            </h1>
          </Link>
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
                    <button className="dropdown-item" onClick={() => changeLanguage('en')}>{t('lang.en')}</button>
                  </li>
                  <li>
                    <button className="dropdown-item" onClick={() => changeLanguage('jp')}>{t('lang.jp')}</button>
                  </li>
                </ul>
              </li>
              {/* 登入註冊按鈕 */}
              <li className="nav-item">
                <button className="btn btn-primary" onClick={handleOpenModal}>登入</button >
              </li>
            </ul>
          </div>
        </div>
      </nav>

       {/* 登入/註冊彈窗 */}
       {showModal && (
        <div
          className="modal fade show"
          style={{ display: "block", backgroundColor: "rgba(0, 0, 0, 0.5)" }}
        >
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">{isLogin ? "登入" : "註冊"}</h5>
                <button
                  type="button"
                  className="btn-close"
                  aria-label="Close"
                  onClick={handleCloseModal}
                ></button>
              </div>
              <div className="modal-body">
                {isLogin ? (
                  <form onSubmit={handleLogin}>
                    <div className="mb-3">
                      <label htmlFor="login-email" className="form-label">
                        電子郵件
                      </label>
                      <input
                        type="email"
                        className="form-control"
                        id="login-email"
                        placeholder="請輸入電子郵件"
                        required
                      />
                    </div>
                    <div className="mb-3">
                      <label htmlFor="login-password" className="form-label">
                        密碼
                      </label>
                      <input
                        type="password"
                        className="form-control"
                        id="login-password"
                        placeholder="請輸入密碼"
                        required
                      />
                    </div>
                    <button type="submit" className="btn btn-primary w-100">
                      登入
                    </button>
                    
                    <button
                      type="button"
                      className="btn btn-outline-secondary w-100 mt-2"
                      onClick={handleGoogleSignIn}
                    >
                      <i className="fab fa-google"></i> 使用 Google 登入
                    </button>
                    <div className="text-center mt-3">
                      <span>還不是會員？</span>{" "}
                      <button
                        type="button"
                        className="btn btn-link"
                        onClick={() => setIsLogin(false)}
                      >
                        立即註冊
                      </button>
                    </div>
                  </form>
                ) : (
                  <form onSubmit={handleRegister}>
                    <div className="mb-3">
                      <label htmlFor="register-email" className="form-label">
                        電子郵件
                      </label>
                      <input
                        type="email"
                        className="form-control"
                        id="register-email"
                        placeholder="請輸入電子郵件"
                        required
                      />
                    </div>
                    <div className="mb-3">
                      <label htmlFor="register-password" className="form-label">
                        密碼
                      </label>
                      <input
                        type="password"
                        className="form-control"
                        id="register-password"
                        placeholder="請輸入密碼"
                        required
                      />
                    </div>
                    <div className="mb-3">
                      <label
                        htmlFor="register-confirm-password"
                        className="form-label"
                      >
                        確認密碼
                      </label>
                      <input
                        type="password"
                        className="form-control"
                        id="register-confirm-password"
                        placeholder="請再次輸入密碼"
                        required
                      />
                    </div>
                    <button type="submit" className="btn btn-primary w-100">
                      註冊
                    </button>
                    <div className="text-center mt-3">
                      <span>已經是會員了？</span>{" "}
                      <button
                        type="button"
                        className="btn btn-link"
                        onClick={() => setIsLogin(true)}
                      >
                        立即登入
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
    );
  };

  export default Header;