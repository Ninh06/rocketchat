import React, { useState, useEffect } from 'react';
import ApiService from '../service/ApiService';
import { decodeJwt } from '../utils/jwtDecode';
import '../pageCss/ProfilePage.css';

const ProfilePage = () => {
  const [userInfo, setUserInfo] = useState(null);
  const [loading, setLoading] = useState(true); 
  const [error, setError] = useState(null); 
  const [isEditing, setIsEditing] = useState(false); 
  const [updatedUserInfo, setUpdatedUserInfo] = useState({}); 
  const [newPassword, setNewPassword] = useState('');
  const token = localStorage.getItem('token'); 
  const decodedToken = decodeJwt(token);
  const userId = decodedToken ? decodedToken._id : null; 

  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        if (userId) {
          const data = await ApiService.getUserInfo(userId); 
          setUserInfo(data);
          setUpdatedUserInfo({ username: data.username, name: data.name }); 
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
      fetchUserInfo(); 
    }
  }, [userId]);

  const handleEditClick = () => {
    setIsEditing(true); 
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUpdatedUserInfo((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handlePasswordChange = (e) => {
    setNewPassword(e.target.value); 
  };

  const handleSaveChanges = async () => {
    try {
      const updatedData = {
        ...updatedUserInfo,
        ...(newPassword && { password: newPassword }), 
      };

      const response = await ApiService.updateUser(userId, updatedData); 
      setUserInfo((prevInfo) => ({
        ...prevInfo,
        ...updatedUserInfo,
      })); 
      setNewPassword(''); 
      setIsEditing(false); 
      alert('Cập nhật thông tin thành công!');
    } catch (err) {
      setError('Không thể lưu thông tin.');
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  if (!userInfo) {
    return <div>Không có thông tin người dùng.</div>;
  }

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
      <span>{userInfo.username}</span>
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
      <span>{userInfo.name}</span>
    )}
  </div>
  <div>
    <strong>Email:</strong>
    <span>{userInfo.email}</span>
  </div>
  <div>
    <strong>Password:</strong>
    {isEditing ? (
      <input
        type="password"
        name="password"
        value={updatedUserInfo.password || ''}
        onChange={handleInputChange}
      />
    ) : (
      <span>**********</span>
    )}
  </div>
  <div>
    <strong>Account Status:</strong>
    <span>{userInfo.active ? 'Active' : 'Inactive'}</span>
  </div>
</div>


      {isEditing ? (
        <div className="edit-actions">
          <button onClick={handleSaveChanges}>Save</button>
          <button onClick={() => setIsEditing(false)}>Cancel</button>
        </div>
      ) : (
        <div className="edit-button-container">
          <button onClick={handleEditClick}>Edit</button>
        </div>
      )}
    </div>
  );
};

export default ProfilePage;
