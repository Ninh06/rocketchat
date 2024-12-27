import React, {useState, useEffect, useRef} from 'react';
import ApiService from '../service/ApiService';
import {decodeJwt} from '../utils/jwtDecode';
import '../pageCss/homeIndex.css';
import {Modal, Box, Typography, Button, IconButton, TextField} from '@mui/material';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import RemoveCircleOutlineIcon from '@mui/icons-material/RemoveCircleOutline';
import {io} from 'socket.io-client';
import {Form} from "react-bootstrap";

const HomePage = () => {
    const [user, setUser] = useState();
    const [rooms, setRooms] = useState([]);
    const [selectedRoom, setSelectedRoom] = useState(null);
    const [messages, setMessages] = useState([]);
    const [message, setMessage] = useState('');
    const [loadingMessages, setLoadingMessages] = useState(false);
    const socketRef = useRef(null);
    // tạo phòng
    const [showCreateRoomForm, setShowCreateRoomForm] = useState(false);
    const [roomName, setRoomName] = useState('');
    const [roomType, setRoomType] = useState('group');
    const [password, setPassword] = useState('');
    const [members, setMembers] = useState([]);

    //vào phòng
    const [showJoinRoomModal, setShowJoinRoomModal] = useState(false);
    const [joinRoomId, setJoinRoomId] = useState('');
    const [joinRoomPassword, setJoinRoomPassword] = useState('');

    // detail room
    const [showRoomDetailsModal, setShowRoomDetailsModal] = useState(false);
    const [selectedRoomDetails, setSelectedRoomDetails] = useState(null);

    //add user
    const [showInviteModal, setShowInviteModal] = useState(false);
    const [memberIds, setMemberIds] = useState('');

    const [showRemoveModal, setShowRemoveModal] = useState(false);
    const [removeMemberIds, setRemoveMemberIds] = useState([]);

    const [users, setUsers] = useState([]); // Stores the users fetched from the API
    const [selectedUsers, setSelectedUsers] = useState([]); // Stores the selected users for invitation

    const searchUsersByName = async (searchTerm) => {
        try {
            if (!searchTerm.trim()) {
                setUsers([]);
                return;
            }

            const result = await ApiService.searchUsers(searchTerm);
            setUsers(result);
        } catch (error) {
            console.error("Error fetching users:", error);
        }
    };

    const handleUserSelect = (e, user) => {
        if (e.target.checked) {
            setSelectedUsers((prev) => [...prev, user]);
        } else {
            setSelectedUsers((prev) => prev.filter((u) => u?._id !== user._id)); // Remove user from selected users
        }
    };

    const handleInviteSubmit = async () => {
        try {
            const addMemberDto = {members: selectedUsers};
            await ApiService.inviteMemberToRoom(selectedRoom, addMemberDto);
            setShowInviteModal(false);
            setSelectedUsers([]); // Clear selected users after submitting
        } catch (error) {
            console.error('Error inviting members:', error);
        }
    };

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

                const userId = decodedToken._id;
                const userInfo = await ApiService.getUserInfo(userId);
                setUser(userInfo);

                const userRooms = await ApiService.getRoomsList();
                setRooms(userRooms);
            } catch (error) {
                console.error('Error fetching user data or rooms:', error);
            }
        };

        fetchUserData();
    }, []);
    useEffect(() => {
        socketRef.current = io('http://localhost:3001');

        socketRef.current.on('newMessage', (newMessage) => {
            console.log(newMessage);
            setMessages((prevMessages) => [...prevMessages, newMessage]);
        });

        // Cleanup khi component unmount
        return () => {
            if (socketRef.current) {
                socketRef.current.disconnect();
            }
        };
    }, []);
    const handleJoinRoom = async (e) => {
        e.preventDefault();
        try {
            const roomJoinDto = {
                roomId: joinRoomId,
                password: roomType === 'private' ? joinRoomPassword : '',
            };
            const roomData = await ApiService.joinRoom(roomJoinDto);
            setRooms((prevRooms) => [...prevRooms, roomData]);
            setShowJoinRoomModal(false);
            setJoinRoomId('');
            setJoinRoomPassword('');
        } catch (error) {
            console.error('Error joining room:', error);
        }
    };

    const handleRemoveSubmit = async () => {
        try {
            const response = await ApiService.deleteMemberFromRoom(selectedRoom, {members: removeMemberIds});
            console.log("Member removed successfully:", response);
            setShowRemoveModal(false);
            setRemoveMemberIds([]);
        } catch (error) {
            console.error("Error removing member:", error);
        }
    };


    const handleRoomDetailsClick = async (roomId) => {
        try {
            const roomDetails = await ApiService.getRoomInfo(roomId);
            setSelectedRoomDetails(roomDetails);
            setShowRoomDetailsModal(true);
        } catch (error) {
            console.error('Error fetching room details:', error);
        }
    };


    const handleRoomClick = async (roomId) => {
        try {
            setLoadingMessages(true);
            setSelectedRoom(roomId);
            if (socketRef.current) {
                socketRef.current.emit('join', {roomId: roomId, userId: user?._id}); // Emitting join room event
            }
            const roomMessages = await ApiService.getMessagesList(roomId);
            setMessages(roomMessages);
        } catch (error) {
            console.error('Error fetching room messages:', error);
        } finally {
            setLoadingMessages(false);
        }
    };
    const handleSendMessage = async (e) => {
        e.preventDefault();
        console.log(selectedRoom)
        if (message.trim()) {
            try {
                const createMessageDto = {
                    content: message,
                    roomId: selectedRoom,

                    sender: user?._id
                };
                await ApiService.sendMessage(createMessageDto);
                setMessage('');
            } catch (error) {
                console.error('Error sending message:', error);
            }
        }
    };

    const handleLogout = () => {
        ApiService.logout();
        window.location.href = '/login';
    };

    const handleCreateRoom = async (e) => {
        e.preventDefault();
        try {
            const roomData = {
                roomName,
                roomType,
                password: roomType === 'private' ? password : '',
                members: [user?._id, ...selectedUsers],
                owners: [user?._id],
            };
            await ApiService.createRoom(roomData);
            setShowCreateRoomForm(false);
            setRoomName('');
            setPassword('');
            setMembers([]);
        } catch (error) {
            console.error('Error creating room:', error);
        }
    };
    const handleRoomsRemoveMemberClick = async (roomId) => {
        try {
            const roomDetails = await ApiService.getRoomInfo(roomId);
            setSelectedRoomDetails(roomDetails);
            setShowRemoveModal(true);
        } catch (error) {
            console.error('Error fetching room details:', error);
        }
    }

    const handleMemberSelection = (memberId) => {
        setRemoveMemberIds((prev) => {
            if (prev.includes(memberId)) {
                return prev.filter((id) => id !== memberId);
            } else {
                return [...prev, memberId];
            }
        });
    };
    // Modal style
    const modalStyle = {
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: 400,
        backgroundColor: 'white',
        padding: '20px',
        boxShadow: 24,
        borderRadius: '8px',
    };
    console.log(selectedUsers)
    return (
        <div className="chat-container" id="chat-page">
            <div className="rooms-list">
                <div className="rooms-list-container">
                    <h2>All Rooms</h2>
                    <button onClick={() => setShowCreateRoomForm(true)}>Create Room</button>
                    <button onClick={() => setShowJoinRoomModal(true)}>Join Room</button>
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
                    <p className="connected-user-fullname"
                       id="connected-user-fullname">{user ? user.name : 'Loading...'}</p>
                    <a
                        className="logout"
                        href="javascript:void(0)"
                        id="logout"
                        onClick={handleLogout}
                    >
                        Logout
                    </a>
                </div>
            </div>

            {/* Room Details Modal */}
            <Modal className='detail-room'
                   open={showRoomDetailsModal}
                   onClose={() => setShowRoomDetailsModal(false)} // Close the modal
            >
                <Box>
                    <Typography variant="h6" component="h2">Room Details</Typography>
                    {selectedRoomDetails ? (
                        <div>
                            <p><strong>Room ID:</strong> {selectedRoomDetails._id}</p>
                            <p><strong>Room Name:</strong> {selectedRoomDetails.roomName}</p>
                            <p><strong>Room Type:</strong> {selectedRoomDetails.roomType}</p>
                            <p><strong>Members:</strong></p>
                            <ul style={{display: 'inline', paddingLeft: 0}}>
                                {selectedRoomDetails.members.map((member, index) => (
                                    <li key={index} style={{display: 'inline', marginRight: '10px'}}>
                                        {member.name}
                                        {index < selectedRoomDetails.members.length - 1 && ", "}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ) : (
                        <p>Loading...</p>
                    )}
                    <Button onClick={() => setShowRoomDetailsModal(false)}>Close</Button>
                </Box>
            </Modal>

            <Modal className="invite-room" open={showInviteModal} onClose={() => setShowInviteModal(false)}>
                <Box sx={modalStyle}>
                    <Typography variant="h6" component="h2">Invite Members</Typography>

                    <TextField
                        label="Search User by Name"
                        variant="outlined"
                        fullWidth
                        value={memberIds}
                        onChange={async (e) => {
                            setMemberIds(e.target.value);
                            await searchUsersByName(e.target.value);
                        }}
                        helperText="Enter user name to search"
                    />
                    <div>
                        {users?.data?.length > 0 ? (
                            <ul>
                                {users?.data?.map((user) => (
                                    <li key={user._id}>
                                        <label>
                                            <input
                                                type="checkbox"
                                                value={user._id}
                                                onChange={(e) => handleUserSelect(e, user)}
                                            />
                                            {user.name}
                                        </label>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p>No users found</p>
                        )}
                    </div>

                    <div className="modal-buttons">
                        <button className="modal-button invite-button" onClick={handleInviteSubmit}>
                            Invite
                        </button>
                        <button className="modal-button cancel-button" onClick={() => setShowInviteModal(false)}>
                            Cancel
                        </button>
                    </div>
                </Box>
            </Modal>
            {"modal xóa"}
            <Modal
                className="remove-member"
                open={showRemoveModal}
                onClose={() => setShowRemoveModal(false)}
            >
                <Box sx={modalStyle}>
                    <Typography variant="h6" component="h2">Remove Members</Typography>

                    {/* Select Members from Current Room */}
                    {selectedRoomDetails?.members?.length > 0 ? (
                        <div>
                            <Typography>Select members to remove:</Typography>
                            <ul>
                                {selectedRoomDetails.members.map((member) => (
                                    <li key={member._id}>
                                        <label>
                                            <input
                                                type="checkbox"
                                                name="memberToRemove"
                                                value={member._id}
                                                checked={removeMemberIds.includes(member._id)}
                                                onChange={(e) => handleMemberSelection(e.target.value)}
                                            />
                                            {member.name}
                                        </label>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ) : (
                        <p>No members available in this room.</p>
                    )}

                    <div className="modal-buttons">
                        <button
                            className="modal-button invite-button"
                            onClick={handleRemoveSubmit} // Handle the remove members action
                            disabled={removeMemberIds.length === 0} // Disable button if no members are selected
                        >
                            Remove
                        </button>
                        <button
                            className="modal-button cancel-button"
                            onClick={() => setShowRemoveModal(false)} // Close the modal
                        >
                            Cancel
                        </button>
                    </div>
                </Box>
            </Modal>

            <Modal
                open={showCreateRoomForm}
                onClose={() => setShowCreateRoomForm(false)}
            >
                <Box sx={modalStyle}>
                    <Typography variant="h6" component="h2">Create Room</Typography>
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
                                <option value="group">Public</option>
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
                                value={memberIds}
                                onChange={async (e) => {
                                    setMemberIds(e.target.value);
                                    await searchUsersByName(e.target.value);
                                }}
                            />
                        </div>
                        <div>
                            {users?.data?.length > 0 ? (
                                <div>
                                    {users?.data?.map((user) => (
                                        <div key={user._id} style={{width: '20px'}}>
                                            <Form.Check
                                                type="checkbox"
                                                id={`custom-switch-${user._id}`}
                                                label={user.name}
                                                onChange={(e) => handleUserSelect(e, user)}
                                            />
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p>No users found</p>
                            )}
                        </div>


                        <Button type="submit">Create</Button>
                        <Button type="button" onClick={() => setShowCreateRoomForm(false)}>
                            Cancel
                        </Button>
                    </form>
                </Box>
            </Modal>

            {/* MUI Modal for Join Room */}
            <Modal
                open={showJoinRoomModal}
                onClose={() => setShowJoinRoomModal(false)}
            >
                <Box sx={modalStyle}>
                    <Typography variant="h6" component="h2">Join Room</Typography>
                    <form onSubmit={handleJoinRoom}>
                        <div>
                            <label>Room ID:</label>
                            <input
                                type="text"
                                value={joinRoomId}
                                onChange={(e) => setJoinRoomId(e.target.value)}
                                required
                            />
                        </div>

                        {rooms.some(room => room.roomType === 'private') && (
                            <div>
                                <label>Password:</label>
                                <input
                                    type="password"
                                    value={joinRoomPassword}
                                    onChange={(e) => setJoinRoomPassword(e.target.value)}
                                    required
                                />
                            </div>
                        )}

                        <Button type="submit">Join</Button>
                        <Button type="button" onClick={() => setShowJoinRoomModal(false)}>
                            Cancel
                        </Button>
                    </form>
                </Box>
            </Modal>

            <div className="chat-area">
                {selectedRoom && (
                    <div className="room-name">
                        <h3>
                            Room: {rooms.find((room) => room._id === selectedRoom)?.roomName}
                            <HelpOutlineIcon
                                onClick={() => handleRoomDetailsClick(selectedRoom)}
                                style={{cursor: 'pointer', marginLeft: '10px'}}
                            />
                            <AddCircleOutlineIcon
                                onClick={() => setShowInviteModal(true)}
                                style={{cursor: 'pointer', marginLeft: '10px'}}
                            />
                            <RemoveCircleOutlineIcon
                                onClick={() => handleRoomsRemoveMemberClick(selectedRoom)}
                                style={{cursor: 'pointer', marginLeft: '10px'}}
                            />
                        </h3>
                    </div>
                )}

                {loadingMessages ? (
                    <p>Loading messages</p>
                ) : (
                    <div className="chat-area " id="chat-messages">
                        {messages.length > 0 ? (
                            messages.map((msg, index) => (
                                <div
                                    key={index}
                                    className={msg.sender?._id === user?._id ? 'text-end' : ''}
                                >
                                    <strong>{msg.sender?.name}:</strong> {msg.content} {user?._id === msg.sender?._id}

                                </div>
                            ))
                        ) : (
                            <p></p>
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
