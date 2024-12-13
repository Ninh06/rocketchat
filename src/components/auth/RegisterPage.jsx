import React, { useState } from 'react';
import ApiService from '../service/ApiService';
import '../pageCss/registerIndex.css'

const RegisterPage = () => {
    const [formData, setFormData] = useState({
      email: '',
      username: '',
      name: '',
      password: '',
    });
  
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
  
    const handleChange = (e) => {
      const { name, value } = e.target;
      setFormData({
        ...formData,
        [name]: value,
      });
    };
  
    // Gửi form đăng ký
    const handleSubmit = async (e) => {
      e.preventDefault();
      setMessage('');
      setError('');
      try {
        const response = await ApiService.registerUser(formData);
        setMessage('Đăng ký thành công!'); 
        setFormData({
          email: '',
          username: '',
          name: '',
          password: '',
        });
      } catch (err) {
        setError(err.message || 'Đã có lỗi xảy ra.'); // Hiển thị lỗi
      }
    };
  
    return (
      <div className="register-container">
        <h2>Đăng ký</h2>
        <form onSubmit={handleSubmit}>
          <div>
            <label>Email:</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>
          <div>
            <label>Tên tài khoản:</label>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              required
            />
          </div>
          <div>
            <label>Họ và tên:</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>
          <div>
            <label>Mật khẩu:</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>
          <div className="redirect-register">
          <a href="/login">Bạn đã có tài khoản? Hãy đăng nhập</a>
          </div>
          <button type="submit">Đăng ký</button>
        </form>
        {message && <p className="success-message">{message}</p>}
        {error && <p className="error-message">{error}</p>}
      </div>
      
    );
  };
  
  export default RegisterPage;