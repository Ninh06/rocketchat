import React, { useState, useEffect } from 'react';
import ApiService from '../service/ApiService';
import { decodeJwt } from '../utils/jwtDecode';
import '../pageCss/ProfilePage.css';

const ProfilePage = () => {
  const [userInfo, setUserInfo] = useState(null); // Trạng thái lưu thông tin người dùng
  const [loading, setLoading] = useState(true); // Trạng thái đang tải
  const [error, setError] = useState(null); // Trạng thái lỗi
  const [isEditing, setIsEditing] = useState(false); // Trạng thái chỉnh sửa
  const [updatedUserInfo, setUpdatedUserInfo] = useState({}); // Trạng thái lưu thông tin cập nhật
  const [showPassword, setShowPassword] = useState(false); // Trạng thái hiển thị mật khẩu

  // Lấy token từ localStorage và giải mã để lấy _id của người dùng
  const token = localStorage.getItem('token'); 
  const decodedToken = decodeJwt(token);
  const userId = decodedToken ? decodedToken._id : null; // Lấy userId từ token đã giải mã

  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        if (userId) {
          const data = await ApiService.getUserInfo(userId); // Gọi API lấy thông tin người dùng
          setUserInfo(data);
          setUpdatedUserInfo(data); // Lưu thông tin vào updatedUserInfo khi lấy thành công
        } else {
          setError('Không tìm thấy thông tin người dùng.');
        }
      } catch (err) {
        setError("Không thể lấy thông tin người dùng");
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      fetchUserInfo(); // Gọi hàm lấy thông tin người dùng khi có userId
    }
  }, [userId]);

  const handleEditClick = () => {
    setIsEditing(true); // Khi nhấn nút "Chỉnh sửa", bật chế độ chỉnh sửa
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUpdatedUserInfo((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleSaveChanges = async () => {
    try {
      const response = await ApiService.updateUser(userId, updatedUserInfo); // Gọi API để lưu thông tin
      setUserInfo(updatedUserInfo); // Cập nhật lại thông tin người dùng sau khi lưu
      setIsEditing(false); // Tắt chế độ chỉnh sửa
      alert('Cập nhật thông tin thành công!');
    } catch (err) {
      setError('Không thể lưu thông tin.');
    }
  };

  // Nếu đang tải dữ liệu
  if (loading) {
    return <div>Loading...</div>;
  }

  // Nếu có lỗi khi lấy dữ liệu
  if (error) {
    return <div>{error}</div>;
  }

  // Nếu không có thông tin người dùng
  if (!userInfo) {
    return <div>Không có thông tin người dùng.</div>;
  }

  // Hàm để chuyển đổi trạng thái hiển thị mật khẩu
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword); // Đảo ngược trạng thái hiển thị mật khẩu
  };

  return (
    <div className="profile-page">
      <h1>User Profile</h1>
      <div className="profile-info">
        <div>
          <strong>Username:</strong>
          {isEditing ? (
            <input
              type="text"
              name="username"
              value={updatedUserInfo.username}
              onChange={handleInputChange}
            />
          ) : (
            userInfo.username
          )}
        </div>
        <div>
          <strong>Name:</strong>
          {isEditing ? (
            <input
              type="text"
              name="name"
              value={updatedUserInfo.name}
              onChange={handleInputChange}
            />
          ) : (
            userInfo.name
          )}
        </div>
        <div>
          <strong>Email:</strong>
          {isEditing ? (
            <input
              type="email"
              name="email"
              value={updatedUserInfo.email}
              onChange={handleInputChange}
            />
          ) : (
            userInfo.email
          )}
        </div>
        <div>
          <strong>Password:</strong>
          {isEditing ? (
            <div className="password-field">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={updatedUserInfo.password || ''}
                onChange={handleInputChange}
              />
              <button type="button" onClick={togglePasswordVisibility}>
                {showPassword ? 'Hide' : 'Show'} Password
              </button>
            </div>
          ) : (
            '**********' // Mật khẩu ẩn khi không chỉnh sửa
          )}
        </div>
        <div>
          <strong>Account Status:</strong> {userInfo.active ? 'Active' : 'Inactive'}
        </div>
        <div>
          <strong>Avatar:</strong>
          <img
            src={userInfo.avatar ? `${ApiService.BASE_URL}${userInfo.avatar}` : '/path/to/default-avatar.jpg'}
            alt="User Avatar"
            style={{ width: '100px', height: '100px', borderRadius: '50%' }}
          />
        </div>
      </div>

      {isEditing ? (
        <div className="edit-actions">
          <button onClick={handleSaveChanges}>Save Changes</button>
          <button onClick={() => setIsEditing(false)}>Cancel</button>
        </div>
      ) : (
        <button onClick={handleEditClick}>Edit Profile</button>
      )}
    </div>
  );
};

export default ProfilePage;
