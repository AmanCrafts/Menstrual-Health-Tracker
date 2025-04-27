import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/useAuth.jsx';
import '../styles/navbar.css';

const Navbar = () => {
    const { currentUser, logout } = useAuth();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const location = useLocation();
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    useEffect(() => {
        setIsMenuOpen(false);
    }, [location]);

    const handleLogout = async () => {
        try {
            await logout();
            setIsMenuOpen(false);
        } catch (error) {
            console.error("Failed to log out:", error);
        }
    };

    return (
        <nav className={`navbar ${scrolled ? 'scrolled' : ''}`}>
            <div className="navbar-container">
                <Link to="/" className="navbar-logo">
                    <span className="logo-icon">🌸</span>
                    <span className="logo-text">FlowSync</span>
                </Link>

                <div className={`menu-icon ${isMenuOpen ? 'active' : ''}`} onClick={() => setIsMenuOpen(!isMenuOpen)}>
                    <span></span>
                    <span></span>
                    <span></span>
                </div>

                <ul className={`nav-menu ${isMenuOpen ? 'active' : ''}`}>
                    {currentUser ? (
                        <>
                            <li className="nav-item">
                                <Link to="/dashboard" className={location.pathname === '/dashboard' ? 'nav-link active' : 'nav-link'}>
                                    <i className="nav-icon fas fa-home"></i>Dashboard
                                </Link>
                            </li>
                            <li className="nav-item">
                                <Link to="/analytics" className={location.pathname === '/analytics' ? 'nav-link active' : 'nav-link'}>
                                    <i className="nav-icon fas fa-chart-line"></i>Analytics
                                </Link>
                            </li>
                            <li className="nav-item">
                                <Link to="/trackers" className={location.pathname === '/trackers' ? 'nav-link active' : 'nav-link'}>
                                    <i className="nav-icon fas fa-calendar-alt"></i>Trackers
                                </Link>
                            </li>
                            <li className="nav-item">
                                <Link to="/education" className={location.pathname === '/education' ? 'nav-link active' : 'nav-link'}>
                                    <i className="nav-icon fas fa-book"></i>Education
                                </Link>
                            </li>
                            <li className="nav-item">
                                <Link to="/profile" className={location.pathname === '/profile' ? 'nav-link active' : 'nav-link'}>
                                    <i className="nav-icon fas fa-user"></i>Profile
                                </Link>
                            </li>
                            <li className="nav-item logout-item">
                                <button onClick={handleLogout} className="nav-link logout-button">
                                    <i className="nav-icon fas fa-sign-out-alt"></i>Logout
                                </button>
                            </li>
                        </>
                    ) : (
                        <>
                            <li className="nav-item">
                                <Link to="/" className={location.pathname === '/' ? 'nav-link active' : 'nav-link'}>
                                    <i className="nav-icon fas fa-home"></i>Home
                                </Link>
                            </li>
                            <li className="nav-item">
                                <Link to="/education" className={location.pathname === '/education' ? 'nav-link active' : 'nav-link'}>
                                    <i className="nav-icon fas fa-book"></i>Education
                                </Link>
                            </li>
                            <li className="nav-item">
                                <Link to="/signup" className="nav-link signup-button">
                                    <i className="nav-icon fas fa-user-plus"></i>Sign Up
                                </Link>
                            </li>
                            <li className="nav-item">
                                <Link to="/signin" className="nav-link signin-button">
                                    <i className="nav-icon fas fa-sign-in-alt"></i>Sign In
                                </Link>
                            </li>
                        </>
                    )}
                </ul>
            </div>
        </nav>
    );
};

export default Navbar;
