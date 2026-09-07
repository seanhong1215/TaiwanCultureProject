import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import './Header.scss';
import { register, login, loginGoogle, loginFacebook } from '@/frontend/utils/api/auth';
import { createMember } from '@/frontend/utils/api/member';
import Swal from 'sweetalert2';
import AuthModal from '@/frontend/components/Modal/AuthModal';
import { socialSignIn, firebaseSignOut } from "@/frontend/assets/js/firebaseConfig.js";
const Header = () => {
    const userRole = localStorage.getItem("userRole"); // 取得 userRole

    // 設定語言
    const { t, i18n } = useTranslation();
    const changeLanguage = (lng) => { i18n.changeLanguage(lng); };
    const navigate = useNavigate();

    // 用戶
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const [userData, setUserData] = useState({
        name: localStorage.getItem("userName") || "",
        image: localStorage.getItem("userAvatar") || "",
    });
    const token = localStorage.getItem("token");

  //登入註冊邏輯
    const [showModal, setShowModal] = useState(false);
    const [isLogin, setIsLogin] = useState(true); // 控制登入/註冊切換
    const [isLoggedIn, setIsLoggedIn] = useState(true); // 控制登入/登出切換
    const handleOpenModal = () => setShowModal(true);
    const handleCloseModal = () => setShowModal(false);

    // 登入註冊資料
    const [loginData, setLoginData] = useState(
        { 
            email: "", 
            password: "",
            name: "",
            role: "",
            avatar: "",
        }
    );

    const [registerData, setRegisterData] = useState({
        name: "",
        email: "",
        password: "",
        confirmPassword: "",
    });

    // 登入邏輯
    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        try {
            const response = await login(loginData); 
            setIsLoggedIn(true);
            
            localStorage.setItem("userId", response.user.id);
            localStorage.setItem("userEmail", response.user.email);
            localStorage.setItem("userName", response.user.name);
            localStorage.setItem("userRole", response.user.role);
            const avatarUrl = response.user.avatar || "https://mockmind-api.uifaces.co/content/human/212.jpg";
            localStorage.setItem("userAvatar", avatarUrl);
            updateUserData({
                name: response.user.name,
                image: avatarUrl,
            });
            Swal.fire({
                title: "登入成功!",
                icon: "success"
            })
            handleCloseModal(); 
        } catch (error) {
            setError("登入失敗，請檢查帳號或密碼");
            console.error('登入失敗:', error);
        } finally {
            setLoading(false);
        }
    };

    // 註冊邏輯
    const handleRegister = async (e) => {
        e.preventDefault();
        if (registerData.password !== registerData.confirmPassword) {
            setError("密碼與確認密碼不一致");
            return;
        }
        setLoading(true);
        setError(null);
        try {
            await register(registerData); 
            Swal.fire({
                title: "註冊成功!",
                icon: "success"
            })
            setIsLogin(true); // 切換回登入模式
        } catch (error) {
            setError("註冊失敗，請稍後再試");
            console.error('註冊失敗:', error);
        } finally {
            setLoading(false);
        }
    };

    // 登出函式
    const handleLogout = async() => {

        try {
            // 只有曾經走過社群登入才需要呼叫 Firebase signOut
            await firebaseSignOut();

             // 清除 localStorage
            localStorage.removeItem("token");
            localStorage.removeItem("userId");
            localStorage.removeItem("userName");
            localStorage.removeItem("userRole");
            localStorage.removeItem("userAvatar");
            localStorage.removeItem("userEmail");

            // 清除 state
            setUserData({});
            setIsLoggedIn(false);
            updateUserData({});

            // 顯示登出成功訊息
            Swal.fire({
                title: "登出成功！",
                icon: "success"
            });
            navigate("/");

            // 關閉 modal
            handleCloseModal();
        } catch (error) {
            console.error("Google 登出失敗:", error);
            Swal.fire({
                title: "登出失敗",
                text: "請重試或檢查網路連線",
                icon: "error"
            });
        }
    };

    const generateRandomPassword = () => {
        // 這裡簡單生成一個隨機的密碼
        return Math.random().toString(36).slice(-8);
      };

    // 社群登入共用邏輯
    const handleSocialLogin = async (loginFn, providerKey, providerName) => {
        setLoading(true);
        setError(null);
        try {
            // 1. Firebase 社群登入取得 idToken（此時才動態載入 Firebase SDK）
            const idToken = await socialSignIn(providerKey);

            // 2. 後端驗證 Firebase Token
            const response = await loginFn(idToken);
            const firebaseUser = response.user; // { uid, email, name, picture }

            // Facebook 有時不回傳 email（用戶隱私設定）
            let userEmail = firebaseUser.email;
            if (!userEmail) {
                const { value: inputEmail } = await Swal.fire({
                    title: '請輸入您的 Email',
                    text: '您的 Facebook 帳號未提供 Email，請手動輸入以完成註冊',
                    input: 'email',
                    inputPlaceholder: '請輸入 Email',
                    showCancelButton: true,
                    cancelButtonText: '取消',
                    confirmButtonText: '確認',
                    inputValidator: (value) => {
                        if (!value) return '請輸入 Email';
                    }
                });
                if (!inputEmail) return; // 用戶取消
                userEmail = inputEmail;
            }

            // 3. 在 json-server DB 建立或取得用戶（以 uuid 識別）
            const dbUser = await createMember({
                uuid: firebaseUser.uid,
                email: userEmail,
                name: firebaseUser.name || firebaseUser.email,
                avatar: firebaseUser.picture || "https://mockmind-api.uifaces.co/content/human/212.jpg",
                password: generateRandomPassword(),
                role: "Member",
            });

            if (!dbUser) throw new Error("建立用戶資料失敗");

            // 4. 儲存用戶資訊（使用 DB 回傳的真實 ID 和 role）
            const avatar = dbUser.avatar || firebaseUser.picture || "https://mockmind-api.uifaces.co/content/human/212.jpg";
            localStorage.setItem("userId", dbUser.id);
            localStorage.setItem("userName", dbUser.name || firebaseUser.name);
            localStorage.setItem("userEmail", dbUser.email || userEmail);
            localStorage.setItem("userRole", dbUser.role || "Member");
            localStorage.setItem("userAvatar", avatar);

            setIsLoggedIn(true);
            setUserData({ name: dbUser.name || firebaseUser.name, image: avatar });
            updateUserData({ name: dbUser.name || firebaseUser.name, image: avatar });

            Swal.fire({ title: `${providerName} 登入成功!`, icon: "success" });
            handleCloseModal();

        } catch (error) {
            // 顯示具體錯誤原因
            const errorMessages = {
                "auth/popup-closed-by-user": "登入視窗已關閉，請重試",
                "auth/popup-blocked": "彈出視窗被封鎖，請允許此網站開啟彈出視窗",
                "auth/cancelled-popup-request": "登入已取消",
                "auth/account-exists-with-different-credential": "此 Email 已使用其他方式註冊，請改用原本的登入方式",
                "auth/operation-not-allowed": `${providerName} 登入尚未在 Firebase Console 啟用`,
                "auth/unauthorized-domain": "此網域未授權，請至 Firebase Console 新增授權網域",
                "NO_EMAIL": `無法取得 ${providerName} Email，請確認帳號已開放 Email 存取權限`,
            };
            const msg = errorMessages[error.code] || errorMessages[error.message] || `${providerName} 登入失敗，請稍後再試`;
            setError(msg);
            console.error(`${providerName} 登入失敗 [${error.code}]:`, error.message);
        } finally {
            setLoading(false);
        }
    };

    // Google 登入
    const handleGoogleLogin = () => handleSocialLogin(loginGoogle, "google", "Google");

    // Facebook 登入
    const handleFacebookLogin = () => handleSocialLogin(loginFacebook, "facebook", "Facebook");

    // 更新用戶資料
    const updateUserData = (data) => {
        setUserData(data);
    };

    // 處理手機選單
    const [menuOpen, setMenuOpen] = useState(false);
    const [isMobile, setIsMobile] = useState(window.innerWidth < 992); // 是否為手機裝置

    const toggleNavbar = () => {
        setMenuOpen(!menuOpen);
    };

    const closeMenu = () => {
        setMenuOpen(false);
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

    }, [showModal]); // 僅在 `showModal` 狀態改變時執行

    // 初始化時根據 token 設定登入狀態與 userData
    useEffect(() => {
        if (token) {
            setIsLoggedIn(true);
            setUserData({
                name: localStorage.getItem("userName") || "",
                image: localStorage.getItem("userAvatar") || "",
            });
        } else {
            setIsLoggedIn(false);
            setUserData({
                name: "",
                image: "",
            });
        }
    }, [token]);

    useEffect(() => {
        const handleResize = () => {
            if(setIsMobile(window.innerWidth < 992)){
                setMenuOpen(true);
            } else {
                setMenuOpen(false);
            }
        };
    
        window.addEventListener("resize", handleResize);
        return () => {
          window.removeEventListener("resize", handleResize);
        };
    }, []);

    useEffect(() => {
        const handleStorageChange = () => {
            setUserData((prev) => ({
            ...prev,
            image: localStorage.getItem("userAvatar") || "",
            name: localStorage.getItem("userName") || "",
            }));
        };

        // ✅ 監聽 custom event
        window.addEventListener("storageChange", handleStorageChange);

        return () => {
            window.removeEventListener("storageChange", handleStorageChange);
        };
        }, []);

    return (
        <header className={`header fixed-top ${menuOpen ? "menu-open" : ""}`}>
            <nav className="navbar navbar-expand-lg navbar-light">
                <div className="container d-flex justify-content-between align-items-center">
                <Link className="navbar-brand nav-link d-flex align-items-center" to="/" aria-label={t('websiteName')}>
                    <h1 className="header-logo-side m-0 d-flex align-items-center"></h1>
                </Link>
                <button 
                    className={`navbar-toggler ${menuOpen ? "" : "collapsed"}`}
                    type="button" 
                    data-bs-target="#navbarNav" 
                    aria-controls="navbarNav" 
                    aria-expanded={menuOpen} 
                    aria-label="Toggle navigation"
                    onClick={toggleNavbar}>
                    <span className="navbar-toggler-icon"></span>
                </button>
                <div className={`collapse navbar-collapse ${menuOpen ? "show" : ""} ${isLoggedIn ? "user-circle" : ""}`} id="navbarNav">
                    <button className="btn btn-secondary user-circle-button" type="button">
                        <img
                            src={userData.image || "https://mockmind-api.uifaces.co/content/human/212.jpg"}
                                onError={(e) => { e.target.src = "https://mockmind-api.uifaces.co/content/human/212.jpg"; }}
                            alt="User"
                            className="rounded-circle"
                            width="60"
                            height="60"
                        />
                        <span className="ms-2">{userData.name}</span>
                    </button>
                    <ul className={`navbar-nav ms-auto ${isLoggedIn ? "user-member-menu" : ""}`}>
                    {userRole === "ACTIVITY_MANAGER" ? (
                        <>
                        {/* <li className="nav-item member-item">
                        <Link className="nav-link" to="/member-center/center" onClick={closeMenu}>{t('member.center')}</Link>
                        </li> */}
                        <li className="nav-item member-item">
                            <Link className="nav-link" to="/member-center/activity-manager" onClick={closeMenu}>活動管理</Link>
                        </li>
                       
                        </>
                    ) :(
                        <>
                        <li className="nav-item member-item">
                            <Link className="nav-link" to="/member-center/center" onClick={closeMenu}>{t('member.center')}</Link>
                        </li>
                        <li className="nav-item member-item">
                            <Link className="nav-link" to="/member-center/order-management/list" onClick={closeMenu}>{t('member.orderList')}</Link>
                        </li>
                        <li className="nav-item member-item">
                            <Link className="nav-link" to="/member-center/collection-list" onClick={closeMenu}>{t('member.favoritesList')}</Link>
                        </li>
                        </>
                    )}
                        
                        <li className="nav-item">
                            <Link className="nav-link" to="/activity-list" onClick={closeMenu}>{t('menu.activityList')}</Link>
                        </li>
                        <li className="nav-item">
                            <Link className="nav-link" to="/journal-list" onClick={closeMenu}>{t('menu.journal')}</Link>
                        </li>
                        {/* 多國語系切換：按鈕本身顯示目前使用中的語言名稱，而不是固定文字 */}
                        <li className="nav-item dropdown">
                            <a className="nav-link dropdown-toggle" href="#" id="navbarDropdown" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                            {t(`lang.${i18n.language}`)}
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
                    </ul>
                    {/* 登入/登出按鈕 */}
                    { isMobile ? (
                        <button className="btn btn-primary" onClick={isLoggedIn ? handleLogout : handleOpenModal}>
                            {isLoggedIn ? t("member.signOut") : t("member.signIn")}
                        </button>
                        ) : (
                            isLoggedIn ? (
                                (
                                    // 電腦版顯示下拉選單
                                    <div className="dropdown dropdown-user-header">
                                    <button
                                        className="btn btn-secondary dropdown-toggle"
                                        type="button"
                                        id="user-dropdown-circle"
                                        data-bs-toggle="dropdown"
                                        aria-expanded="false"
                                    >
                                        <img
                                            src={userData.image || "https://mockmind-api.uifaces.co/content/human/212.jpg"}
                                onError={(e) => { e.target.src = "https://mockmind-api.uifaces.co/content/human/212.jpg"; }}
                                            alt="User"
                                            className="rounded-circle"
                                            width="40"
                                            height="40"
                                        />
                                        <span className="ms-2">{userData.name}</span>
                                    </button>
                                    <ul className="dropdown-menu user-member-menu" aria-labelledby="user-dropdown-circle">
                                    {userRole === "ACTIVITY_MANAGER" ? (
                                        <>
                                        <li>
                                            <Link className="dropdown-item" to="/member-center/activity-manager">活動管理</Link>
                                        </li>
                                    
                                        </>
                                    ) :(
                                        <>
                                        <li>
                                            <Link className="dropdown-item" to="/member-center/center">{t('member.center')}</Link>
                                        </li>
                                        <li>
                                            <Link className="dropdown-item" to="/member-center/order-management/list">{t('member.orderList')}</Link>
                                        </li>
                                        <li>
                                            <Link className="dropdown-item" to="/member-center/collection-list">{t('member.favoritesList')}</Link>
                                        </li>
                                        </>
                                    )}


                                        
                                        <li>
                                            <Link className="dropdown-item" href="#" onClick={handleLogout}>
                                                {t('member.signOut')}
                                            </Link>
                                        </li>
                                    </ul>
                                </div>
                            )
                            ) : (
                                <button className="btn btn-primary" onClick={handleOpenModal}>
                                    {t("member.signIn")}
                                </button>
                            )
                        )
                    }
                </div>
                </div>
            </nav>
            <AuthModal 
                showModal={showModal}
                handleCloseModal={handleCloseModal}
                isLogin={isLogin}
                setIsLogin={setIsLogin}
                handleLogin={handleLogin}
                handleGoogleLogin={handleGoogleLogin}
                handleFacebookLogin={handleFacebookLogin}
                handleRegister={handleRegister}
                loginData={loginData}
                setLoginData={setLoginData}
                registerData={registerData}
                setRegisterData={setRegisterData}
                t={(key) => key} // Replace this with your translation function
                error={error}
                loading={loading}
            />
        </header>
        );
    };

    export default Header;