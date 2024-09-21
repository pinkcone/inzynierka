import React from 'react';
import { Link } from 'react-router-dom';
import useAuth from '../hooks/useAuth'; 
import { Dropdown } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import styles from '../styles/Navbar.module.css';

const Navbar = () => {
  const { isAuthenticated, user, logout } = useAuth(); 

  return (
    <nav className={`navbar navbar-expand-lg navbar-light bg-light w-100 ${styles['navbar-custom']}`}>
      <div className="container-fluid">
        <Link className="navbar-brand" to="/">
          <img 
            src="/images/logo.png"
            alt="Logo"
            className={styles['navbar-logo']} // Użyj modułu CSS
          />
        </Link>
        <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav ms-auto">
            {isAuthenticated ? (
              <Dropdown>
                <Dropdown.Toggle variant="success" id="dropdown-basic" className={styles['dropdown-toggle-custom']}>
                  <img
                    src={user?.image || '/images/profile_pictures/picture_1.png'} 
                    alt="User Avatar"
                    className={styles['user-avatar']} // Użyj modułu CSS
                  />
                </Dropdown.Toggle>
                <Dropdown.Menu>
                  <Dropdown.Item as={Link} to="/profile">Profil</Dropdown.Item>
                  <Dropdown.Item as={Link} to="/settings">Ustawienia</Dropdown.Item>
                  <Dropdown.Item onClick={logout}>Wyloguj się</Dropdown.Item>
                </Dropdown.Menu>
              </Dropdown>
            ) : (
              <>
                <li className="nav-item">
                  <Link className="nav-link" to="/register">Rejestracja</Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link" to="/login">Logowanie</Link>
                </li>
              </>
            )}
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
