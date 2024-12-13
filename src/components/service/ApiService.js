import axios from 'axios';
import { decodeJwt } from '../utils/jwtDecode';

export default class ApiService {
  static BASE_URL = 'http://localhost:3000/api/v1'; // URL của backend

  //AUTHS

  static getHeader() {
    const token = localStorage.getItem("token");
    return {
      Authorization: `Bearer ${token}`,
      "content-type": "application/json",
    };
  }

  static isAdmin() {
    const token = localStorage.getItem('token');
    if (token) {
      const decodedToken = decodeJwt(token); // Giải mã token
      return decodedToken && decodedToken.role === 'admin';  // Kiểm tra vai trò
    }
    return false;
  }

  // Kiểm tra người dùng có phải user không
  static isUser() {
    const token = localStorage.getItem('token');
    if (token) {
      const decodedToken = decodeJwt(token); // Giải mã token
      return decodedToken && decodedToken.role === 'user';  // Kiểm tra vai trò
    }
    return false;
  }

  // Đăng ký 
  static async registerUser(registerData) {
    try {
      const response = await axios.post(`${this.BASE_URL}/users.register`, registerData);
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : error;
    }
  }

  // Đăng nhập
  static async loginUser(loginData) {
    try {
      const response = await axios.post(`${this.BASE_URL}/users.login`, loginData);
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : error;
    }
  }

  // Làm mới token
  static async refreshToken(refreshToken) {
    try {
      const response = await axios.post(`${this.BASE_URL}/users.regeneratePersonalAccessToken`, {
        refresh_token: refreshToken,
      });
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : error;
    }
  }

  //Đăng xuất
  static logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
  }

  //Xác thực
  static isAuthenticated() {
    const token = localStorage.getItem('token');
    return !!token;
  }

  //USERS
  // List users
  static async getUsersList(filterUserDto) {
    try {
      const response = await axios.get(`${this.BASE_URL}/users.list`, {
        headers: this.getHeader(),
        params: filterUserDto, // Example: { page: '1', limit: '10', search: 'John' }
      });
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : error;
    }
  }

  //Thông tin chi tiết người dùng theo ID
  static async getUserInfo(userId) {
    try {
    const response = await axios.get(`${this.BASE_URL}/users.info/${userId}`, {
      headers: this.getHeader(),
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching user info:", error);
    throw error.response ? error.response.data : new Error("Unable to fetch user info");
  }
  }
  

  // Thay đổi thông tin user
  static async updateUser(userId, userUpdateDto) {
    try {
      const response = await axios.put(`${this.BASE_URL}/users.update/${userId}`, userUpdateDto, {
        headers: this.getHeader(),
      });
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : error;
    }
  }

  // Tạo mới user
  static async createUser(userCreateDto) {
    try {
      const response = await axios.post(`${this.BASE_URL}/users.create`, userCreateDto, {
        headers: this.getHeader(),
      });
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : error;
    }
  }

  // Xóa user
  static async deleteUser(userId) {
    try {
      const response = await axios.delete(`${this.BASE_URL}/users.delete/${userId}`, {
        headers: this.getHeader(),
      });
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : error;
    }
  }

  // Set user avatar
  static async setUserAvatar(userId, useSetAvatarDto) {
    try {
      const formData = new FormData();
      formData.append('avatar', useSetAvatarDto.avatar);

      const response = await axios.post(`${this.BASE_URL}/users.setAvatar/${userId}`, formData, {
        headers: {
          ...this.getHeader(),
          'content-type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : error;
    }
  }

  // ROOMS

  // Tạo phòng mới
  static async createRoom(createRoomDto) {
    try {
      const response = await axios.post(`${this.BASE_URL}/rooms.create`, createRoomDto, {
        headers: this.getHeader(),
      });
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : error;
    }
  }

  // Lấy danh sách phòng của user
  static async getRoomsList() {
    try {
      const response = await axios.get(`${this.BASE_URL}/rooms.list`, {
        headers: this.getHeader(),
      });
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : error;
    }
  }

  // Lấy thông tin chi tiết phòng theo ID
  static async getRoomInfo(roomId) {
    try {
      const response = await axios.get(`${this.BASE_URL}/rooms.info/${roomId}`, {
        headers: this.getHeader(),
      });
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : error;
    }
  }

  // Mời thành viên vào phòng
  static async inviteMemberToRoom(roomId, addMemberDto) {
    try {
      const response = await axios.put(`${this.BASE_URL}/rooms.invite/${roomId}`, addMemberDto, {
        headers: this.getHeader(),
      });
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : error;
    }
  }

  // Cập nhật trạng thái phòng
  static async updateRoomStatus(roomId, status) {
    try {
      const response = await axios.put(`${this.BASE_URL}/rooms.status/${roomId}`, { status }, {
        headers: this.getHeader(),
      });
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : error;
    }
  }

  // Cập nhật avatar cho phòng
  static async setRoomAvatar(roomId, avatarFile) {
    try {
      const formData = new FormData();
      formData.append('avatar', avatarFile);

      const response = await axios.put(`${this.BASE_URL}/rooms.setAvatar/${roomId}`, formData, {
        headers: {
          ...this.getHeader(),
          'content-type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : error;
    }
  }

  // Xóa thành viên khỏi phòng
  static async deleteMemberFromRoom(roomId, removeMemberDto) {
    try {
      const response = await axios.put(`${this.BASE_URL}/rooms.deleteMember/${roomId}`, removeMemberDto, {
        headers: this.getHeader(),
      });
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : error;
    }
  }

  // Tham gia phòng
  static async joinRoom(roomJoinDto) {
    try {
      const response = await axios.post(`${this.BASE_URL}/rooms.join`, roomJoinDto, {
        headers: this.getHeader(),
      });
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : error;
    }
  }

  // Xóa phòng
  static async deleteRoom(roomId) {
    try {
      const response = await axios.delete(`${this.BASE_URL}/rooms.delete/${roomId}`, {
        headers: this.getHeader(),
      });
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : error;
    }
  }

  // MESSAGES

  // Gửi tin nhắn
  static async sendMessage(createMessageDto, fileAttach) {
    try {
      const formData = new FormData();
      formData.append('fileAttach', fileAttach);
      Object.keys(createMessageDto).forEach(key => {
        formData.append(key, createMessageDto[key]);
      });

      const response = await axios.post(`${this.BASE_URL}/messages.send`, formData, {
        headers: {
          ...this.getHeader(),
          'content-type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : error;
    }
  }

  // Lấy danh sách tin nhắn trong phòng
  static async getMessagesList(roomId, queryParams) {
    try {
      const response = await axios.get(`${this.BASE_URL}/rooms.info/${roomId}`, {
        headers: this.getHeader(),
      });
      const { messages } = response.data;
      return messages || [];
    } catch (error) {
      throw error.response ? error.response.data : error;
    }
  }

  // Xóa tin nhắn
  static async deleteMessage(messageId) {
    try {
      const response = await axios.delete(`${this.BASE_URL}/messages.delete/${messageId}`, {
        headers: this.getHeader(),
      });
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : error;
    }
  }
}