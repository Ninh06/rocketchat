import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import ApiService from "../service/ApiService";
import '../pageCss/Navbar.css';

function Navbar() {
    const isAuthenticated = ApiService.isAuthenticated();
    const isAdmin = ApiService.isAdmin();
    const isUser = ApiService.isUser();
    const navigate = useNavigate();

    const handleLogout = () => {
        const isLogout = window.confirm("Bạn muốn đăng xuất ?");
        if (isLogout) {
            ApiService.logout();
            navigate('/login');
        }
    };

    return (
        <nav className="navbar navbar-expand-lg navbar-light bg-light fixed-top">
            <div className="container-fluid">
                <NavLink className="navbar-brand" to="/home">Chat App</NavLink>
                <button 
                    className="navbar-toggler" 
                    type="button" 
                    data-bs-toggle="collapse" 
                    data-bs-target="#navbarNav" 
                    aria-controls="navbarNav" 
                    aria-expanded="false" 
                    aria-label="Toggle navigation"
                >
                    <span className="navbar-toggler-icon"></span>
                </button>
                <div className="collapse navbar-collapse" id="navbarNav">
                    <ul className="navbar-nav ms-auto">
                        <li className="nav-item">
                            <NavLink className="nav-link" to="/home" activeClassName="active">Home</NavLink>
                        </li>

                        {isUser && (
                            <li className="nav-item">
                                <NavLink className="nav-link" to="/profile" activeClassName="active">Profile</NavLink>
                            </li>
                        )}
                        {isAdmin && (
                            <li className="nav-item">
                                <NavLink className="nav-link" to="/admin" activeClassName="active">Admin</NavLink>
                            </li>
                        )}

                        {!isAuthenticated && (
                            <>
                                <li className="nav-item">
                                    <NavLink className="nav-link" to="/login" activeClassName="active">Login</NavLink>
                                </li>
                                <li className="nav-item">
                                    <NavLink className="nav-link" to="/register" activeClassName="active">Register</NavLink>
                                </li>
                            </>
                        )}

                        {isAuthenticated && (
                            <li className="nav-item">
                                <button className="btn btn-link nav-link" onClick={handleLogout}>Logout</button>
                            </li>
                        )}
                    </ul>
                </div>
            </div>
        </nav>
    );
}

export default Navbar;
