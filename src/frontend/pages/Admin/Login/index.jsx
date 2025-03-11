import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login } from '@/frontend/utils/api';
import Swal from 'sweetalert2';


const LoginPage = () => {
  const userRole = localStorage.getItem("userRole");
  const [credentials, setCredentials] = useState({
    email: '',
    password: '',
    rememberMe: false
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setCredentials(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    // 模擬登入請求
    try {
      const response = await login(credentials);
      localStorage.setItem("userAvator", response.user.avatar);
      localStorage.setItem("userId", response.user.id);
      localStorage.setItem("userName", response.user.name);
      localStorage.setItem("userRole", response.user.role);

      if(response.user.role === "Member"){
        Swal.fire({
          title: "登入失敗，你沒有權限!!",
          icon: "warning"
        })
        return
      }

      Swal.fire({
        title: "登入成功",
        icon: "success"
      })
      
      navigate('/admin/dashboard');
    } catch (error) {
      console.log(error);
      Swal.fire({
        title: "登入失敗，請檢查帳號密碼!",
        icon: "error"
      })
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-light min-vh-100 d-flex align-items-center">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-md-6 col-lg-5">
            <div className="card shadow-lg border-0">
              <div className="card-body p-5">
                {/* Logo 區域 */}
                <div className="text-center mb-4">
                  <i className="bi bi-shield-lock text-primary" style={{ fontSize: '3rem' }}></i>
                  <h2 className="mt-3 mb-4">管理後台</h2>
                </div>

                {/* 登入表單 */}
                <form onSubmit={handleSubmit}>
                  <div className="mb-4">
                    <div className="form-floating">
                      <input
                        type="email"
                        className="form-control"
                        id="email"
                        name="email"
                        placeholder="請輸入電子郵件"
                        value={credentials.email}
                        onChange={handleChange}
                        required
                      />
                      <label htmlFor="email">電子郵件</label>
                    </div>
                  </div>

                  <div className="mb-4">
                    <div className="form-floating">
                      <input
                        type="password"
                        className="form-control"
                        id="password"
                        name="password"
                        placeholder="請輸入密碼"
                        value={credentials.password}
                        onChange={handleChange}
                        required
                      />
                      <label htmlFor="password">密碼</label>
                    </div>
                  </div>

                  <div className="mb-4 form-check">
                    <input
                      type="checkbox"
                      className="form-check-input"
                      id="rememberMe"
                      name="rememberMe"
                      checked={credentials.rememberMe}
                      onChange={handleChange}
                    />
                    <label className="form-check-label" htmlFor="rememberMe">
                      記住我
                    </label>
                  </div>

                  <button
                    type="submit"
                    className="btn btn-primary w-100 py-2 mb-4"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                        登入中...
                      </>
                    ) : '登入'}
                  </button>

                  <div className="text-center">
                    <a href="#" className="text-decoration-none">忘記密碼？</a>
                  </div>
                </form>
              </div>
            </div>

            {/* 額外資訊 */}
            <div className="text-center mt-4 text-muted">
              <small>&copy; 2025 體驗台灣好文化製作團隊. All rights reserved.</small>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;