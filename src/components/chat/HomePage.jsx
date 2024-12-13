import React, { useState, useEffect } from 'react';
import { Modal, BU } from 'react-bootstrap';
import ApiService from '../service/ApiService';
import { decodeJwt } from '../utils/jwtDecode';
import '../pageCss/homeIndex.css';

const HomePage = () => {
  const [user, setUser] = useState(null);
  const [rooms, setRooms] = useState([]);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState('');
  const [loadingMessages, setLoadingMessages] = useState(false);
  
  // Trạng thái hiển thị form tạo phòng
  const [showCreateRoomForm, setShowCreateRoomForm] = useState(false);
  const [roomName, setRoomName] = useState('');
  const [roomType, setRoomType] = useState('public'); 
  const [password, setPassword] = useState('');
  const [members, setMembers] = useState([]);
  
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          throw new Error('No token found');
        }
    
        const decodedToken = decodeJwt(token);
        if (!decodedToken || !decodedToken._id) {
          throw new Error('Invalid token: User ID not found.');
        }
    
        const userId = decodedToken._id; // Extract user ID from _id
        const userInfo = await ApiService.getUserInfo(userId); // Fetch user info
        setUser(userInfo);
    
        const userRooms = await ApiService.getRoomsList(); // Fetch rooms
        setRooms(userRooms);
      } catch (error) {
        console.error('Error fetching user data or rooms:', error);
      }
    };    

    fetchUserData();
  }, []);

  const handleRoomClick = async (roomId) => {
    try {
      setLoadingMessages(true);
      setSelectedRoom(roomId);

      const roomMessages = await ApiService.getMessagesList(roomId); // Fetch messages for room
      setMessages(roomMessages);
    } catch (error) {
      console.error('Error fetching room messages:', error);
    } finally {
      setLoadingMessages(false);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (message.trim()) {
      try {
        const createMessageDto = {
          content: message,
          roomId: selectedRoom,
        };
        await ApiService.sendMessage(createMessageDto); // Send the message
        const updatedMessages = await ApiService.getMessagesList(selectedRoom); // Reload messages
        setMessages(updatedMessages);
        setMessage(''); // Clear input
      } catch (error) {
        console.error('Error sending message:', error);
      }
    }
  };

  const handleLogout = () => {
    ApiService.logout(); // Clear token and log out
    window.location.href = '/login'; // Redirect to login page
  };

  const handleCreateRoom = async (e) => {
    e.preventDefault();
    try {
      const roomData = {
        roomName,
        roomType,
        password: roomType === 'private' ? password : '',
        members: [{ _id: user._id }, ...members], // owner is user, and add members
        owners: [{ _id: user._id }], // owner is user
      };
      await ApiService.createRoom(roomData);
      setShowCreateRoomForm(false); // Hide the form after creating room
      setRoomName(''); // Clear the input
      setPassword('');
      setMembers([]); // Reset members
    } catch (error) {
      console.error('Error creating room:', error);
    }
  };

  return (
    <div className="chat-container" id="chat-page">
      <div className="rooms-list">
        <div className="rooms-list-container">
          <h2>All Rooms</h2>
          <button onClick={() => setShowCreateRoomForm(true)}>Create Room</button>
          {rooms.length > 0 ? (
            <ul id="connectedRooms">
              {rooms.map((room) => (
                <li
                  key={room._id}
                  onClick={() => handleRoomClick(room._id)}
                  className={selectedRoom === room._id ? 'selected-room' : ''}
                >
                  <div>
                    <strong>{room.roomName}</strong>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p>No rooms available</p>
          )}
        </div>
        <div>
          <p className="connected-user-fullname" id="connected-user-fullname">{user ? user.name : 'Loading...'}</p>
          <a
            className="logout"
            href="javascript:void(0)"
            id="logout"
            onClick={handleLogout}
          >
            Logout
          </a>
        </div>

        {/* Nút tạo phòng */}
      </div>

      {/* Form tạo phòng */}
      {showCreateRoomForm && (
        <div className="create-room-form">
          <h2>Create Room</h2>
          <form onSubmit={handleCreateRoom}>
            <div>
              <label>Room Name:</label>
              <input
                type="text"
                value={roomName}
                onChange={(e) => setRoomName(e.target.value)}
                required
              />
            </div>

            <div>
              <label>Room Type:</label>
              <select
                value={roomType}
                onChange={(e) => setRoomType(e.target.value)}
              >
                <option value="public">Public</option>
                <option value="private">Private</option>
              </select>
            </div>

            {roomType === 'private' && (
              <div>
                <label>Password:</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            )}

            <div>
              <label>Members (IDs):</label>
              <input
                type="text"
                placeholder="Comma separated IDs"
                value={members.join(', ')}
                onChange={(e) => setMembers(e.target.value.split(',').map(id => id.trim()))}
              />
            </div>

            <button type="submit">Create</button>
            <button type="button" onClick={() => setShowCreateRoomForm(false)}>
              Cancel
            </button>
          </form>
        </div>
      )}

      <div className="chat-area">
        {loadingMessages ? (
          <p>Loading messages...</p>
        ) : (
          <div className="chat-area" id="chat-messages">
            {messages.length > 0 ? (
              messages.map((msg, index) => (
                <div
                  key={index}
                  className={msg.sender === user?.name ? 'my-message' : ''}
                >
                  <strong>{msg.sender}:</strong> {msg.content}
                </div>
              ))
            ) : (
              <p>No messages in this room</p>
            )}
          </div>
        )}

        {selectedRoom && (
          <form id="messageForm" name="messageForm" onSubmit={handleSendMessage}>
            <div className="message-input">
              <input
                type="text"
                id="message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Type your message..."
                autoComplete="off"
              />
              <button type="submit">Send</button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default HomePage;
