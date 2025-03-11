import { useState } from 'react';
import PropTypes from "prop-types";
import { useTranslation } from 'react-i18next';


const AuthModal = ({ showModal, handleCloseModal, isLogin, setIsLogin, handleLogin, handleRegister, error, loading, loginData, setLoginData, registerData, setRegisterData }) => {
    const { t } = useTranslation();

    // 表單輸入處理
    const handleInputChange = (e, isLoginForm) => {
        const { id, value } = e.target;
        if (isLoginForm) {
            setLoginData((prev) => {
                const newData = { ...prev, [id]: value };
                return newData;
            });
        } else {
            setRegisterData((prev) => {
                const newData = { ...prev, [id]: value };
                return newData;
            });
        }
    };

    return (
        <>
            {showModal && (
                <div
                    className="modal fade show"
                    style={{ display: 'block', backgroundColor: 'rgba(0, 0, 0, 0.5)' }}>
                    <div className="modal-dialog modal-dialog-centered">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">{isLogin ? t('form.login') : t('form.register')}</h5>
                                <button type="button" className="btn-close" aria-label="Close" onClick={handleCloseModal}></button>
                            </div>
                            <div className="modal-body">
                                {error && <div className="alert alert-danger">{error}</div>}
                                {isLogin ? (
                                    <form onSubmit={handleLogin}>
                                        <div className="mb-3">
                                            <label htmlFor="email" className="form-label">{t('form.email')}</label>
                                            <input 
                                                type="email" 
                                                className="form-control" 
                                                id="email" 
                                                value={loginData.email} 
                                                onChange={(e) => handleInputChange(e, true)} 
                                                placeholder={t('form.pleaseEnterYourEmail')} 
                                                required />
                                        </div>
                                        <div className="mb-3">
                                            <label htmlFor="password" className="form-label">{t('form.password')}</label>
                                            <input
                                                type="password"
                                                className="form-control"
                                                id="password"
                                                value={loginData.password}
                                                onChange={(e) => handleInputChange(e, true)}
                                                placeholder={t('form.pleaseEnterYourPassword')}
                                                required />
                                        </div>
                                        <button type="submit" className="btn btn-primary w-100" disabled={loading}>{loading ? t('form.loggingIn') : t('form.login')}</button>

                                        <div className="text-center mt-3">
                                            <span>{t('form.notMember')}</span>{" "}
                                            <button
                                                type="button"
                                                className="btn btn-link"
                                                onClick={() => setIsLogin(false)} >
                                                {t('form.registerNow')}
                                            </button>
                                        </div>
                                    </form>
                                ) : (
                                    <form onSubmit={handleRegister}>
                                        <div className="mb-3">
                                            <label htmlFor="name" className="form-label">使用者名稱</label>
                                            <input
                                                type="text"
                                                className="form-control"
                                                id="name"
                                                value={registerData.name}
                                                onChange={(e) => handleInputChange(e, false)}
                                                placeholder="請輸入使用者名稱"
                                                required />
                                        </div>
                                        <div className="mb-3">
                                            <label htmlFor="email" className="form-label">{t('form.email')}</label>
                                            <input
                                                type="email"
                                                className="form-control"
                                                id="email"
                                                value={registerData.email}
                                                onChange={(e) => handleInputChange(e, false)}
                                                placeholder={t('form.pleaseEnterYourEmail')}
                                                required />
                                        </div>
                                        <div className="mb-3">
                                            <label htmlFor="password" className="form-label">{t('form.password')}</label>
                                            <input
                                                type="password"
                                                className="form-control"
                                                id="password"
                                                value={registerData.password}
                                                onChange={(e) => handleInputChange(e, false)}
                                                placeholder={t('form.pleaseEnterYourPassword')}
                                                required />
                                        </div>
                                        <div className="mb-3">
                                            <label htmlFor="confirmPassword" className="form-label">{t('form.confirmPassword')}</label>
                                            <input
                                                type="password"
                                                className="form-control"
                                                id="confirmPassword"
                                                value={registerData.confirmPassword}
                                                onChange={(e) => handleInputChange(e, false)}
                                                placeholder={t('form.ReEnterPassword')}
                                                required />
                                        </div>
                                        <button type="submit" className="btn btn-primary w-100" disabled={loading}>{loading ? t('form.Registering') : t('form.register')}</button>
                                        <div className="text-center mt-3">
                                            <span>{t('form.isMember')}</span>{" "}
                                            <button type="button" className="btn btn-link" onClick={() => setIsLogin(true)}>{t('form.signInNow')}</button>
                                        </div>
                                    </form>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

// PropTypes 定義
AuthModal.propTypes = {
    showModal: PropTypes.bool.isRequired,
    handleCloseModal: PropTypes.func.isRequired,
    isLogin: PropTypes.bool.isRequired,
    setIsLogin: PropTypes.func.isRequired,
    handleLogin: PropTypes.func.isRequired,
    handleRegister: PropTypes.func.isRequired,
    // t: PropTypes.func.isRequired,
    error: PropTypes.string,
    loading: PropTypes.bool.isRequired,
    loginData: PropTypes.object.isRequired,
    setLoginData: PropTypes.func.isRequired,
    registerData: PropTypes.object.isRequired,
    setRegisterData: PropTypes.func.isRequired,
  };

export default AuthModal;
