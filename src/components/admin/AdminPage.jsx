import React, { useState, useEffect } from 'react';
import ApiService from '../service/ApiService';
import '../pageCss/AdminPage.css'

const AdminPage = () => {
  const [users, setUsers] = useState([]); // Danh sách người dùng
  const [userInfo, setUserInfo] = useState(null); // Thông tin chi tiết người dùng
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState({ page: 1, limit: 10, search: '' });
  const [totalUsers, setTotalUsers] = useState(0); // Tổng số người dùng

  // Lấy danh sách người dùng
  const fetchUsersList = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await ApiService.getUsersList(filter);
      setUsers(data.data || []); // Lấy dữ liệu từ trường `data` trong phản hồi
      setTotalUsers(data.total); // Giả sử API trả về tổng số người dùng trong trường `total`
    } catch (err) {
      setError('Failed to fetch users.');
    } finally {
      setLoading(false);
    }
  };

  // Lấy thông tin chi tiết người dùng khi click vào tên người dùng
  const fetchUserInfo = async (userId) => {
    try {
      const data = await ApiService.getUserInfo(userId);
      setUserInfo(data); // Cập nhật thông tin chi tiết người dùng
    } catch (err) {
      setError('Failed to fetch user details.');
    }
  };

  // Phương thức xóa người dùng
  const deleteUser = async (userId) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this user?");
    if (confirmDelete) {
      try {
        await ApiService.deleteUser(userId);
        alert('User deleted successfully');
        fetchUsersList(); // Lấy lại danh sách người dùng sau khi xóa
      } catch (err) {
        setError('Failed to delete user.');
      }
    }
  };

  // Gọi API khi trang được load
  useEffect(() => {
    fetchUsersList();
  }, [filter]);

  // Hàm thay đổi bộ lọc (search, page, limit)
  const handleFilterChange = (e) => {
    setFilter({
      ...filter,
      [e.target.name]: e.target.value,
    });
  };

  // Hàm chuyển trang
  const handlePageChange = (newPage) => {
    setFilter({ ...filter, page: newPage });
  };

  const totalPages = Math.ceil(totalUsers / filter.limit);

  return (
    <div>
      <h1>Admin Page - Manage Users</h1>

      <div>
        <input
          type="text"
          name="search"
          value={filter.search}
          onChange={handleFilterChange}
          placeholder="Search users"
        />
      </div>

      {loading && <p>Loading...</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}

      <table border="1">
        <thead>
          <tr>
            <th>ID</th>
            <th>Email</th>
            <th>Username</th>
            <th>Name</th>
            <th>Role</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {Array.isArray(users) && users.length > 0 ? (
            users.map(user => (
              <tr key={user._id}>
                <td>{user._id}</td>
                <td>{user.email}</td>
                <td>{user.username}</td>
                <td>{user.name}</td>
                <td>{user.role}</td>
                <td>
                  <button class="delete-button" onClick={() => deleteUser(user._id)}>Delete</button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="6">No users found</td>
            </tr>
          )}
        </tbody>
      </table>

      <div class="pagination-container">
        <button class="prev-btn"
          onClick={() => handlePageChange(filter.page - 1)}
          disabled={filter.page === 1}
        >
          Prev
        </button>
        <span>{`Page ${filter.page} of ${totalPages}`}</span>
        <button class="next-btn"
          onClick={() => handlePageChange(filter.page + 1)}
          disabled={filter.page === totalPages}
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default AdminPage;
