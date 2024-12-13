import React, { useState } from 'react';
import ApiService from '../service/ApiService';
import '../pageCss/loginIndex.css'

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(''); // Xóa lỗi trước đó

    try {
      const loginData = { email, password };
      const response = await ApiService.loginUser(loginData);

      // Lưu token vào localStorage
      localStorage.setItem('token', response.access_token);
      localStorage.setItem('refreshToken', response.refresh_token);

      // Điều hướng sau khi đăng nhập thành công
      window.location.href = '/home';
    } catch (err) {
      setError(err.message || 'Đăng nhập thất bại. Vui lòng thử lại!');
    }
  };

  return (
    <div className="login-container">
      <h2>Đăng nhập</h2>
      <form onSubmit={handleLogin}>
        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="password">Mật khẩu</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <div className="redirect-register">
          <a href="/register">Bạn chưa có tài khoản? Hãy đăng ký</a>
        </div>
        {error && <div className="error-message">{error}</div>}
        <button type="submit">Đăng nhập</button>
      </form>
    </div>
  );
};

export default LoginPage;
