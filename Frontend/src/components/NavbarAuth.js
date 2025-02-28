import React from 'react';
import { Link } from 'react-router-dom';
import { FaSignInAlt, FaUserPlus } from 'react-icons/fa';
import './navbar.css';

const NavbarAuth = () => {
    return (
        <nav className="navbar navbar-expand-lg navbar-light bg-body-tertiary animate">
            <div className="container-fluid justify-content-between">
                {/* Logo y nombre */}
                <Link className="navbar-brand me-2 mb-1 d-flex align-items-center" to="/">
                    <img src="https://gitbf.onrender.com/uploads/logo1.png" height="30" alt="NailsSoft Logo" loading="lazy" />
                    <h2 className="ms-2">NailsSoft</h2>
                </Link>

                {/* Menú de autenticación */}
                <ul className="navbar-nav flex-row">
                    <li className="nav-item me-3 me-lg-1">
                        <Link className="nav-link" to="/login">
                            <FaSignInAlt /> <span className="d-none d-md-inline">Login</span>
                        </Link>
                    </li>
                    <li className="nav-item">
                        <Link className="nav-link" to="/register">
                            <FaUserPlus /> <span className="d-none d-md-inline">Register</span>
                        </Link>
                    </li>
                </ul>
            </div>
        </nav>
    );
};

export default NavbarAuth;