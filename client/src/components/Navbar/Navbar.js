import React from 'react';
import { Link } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import { Dropdown } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import styles from '../../styles/Navbar.module.css';

const Navbar = () => {
  const { isAuthenticated, isAdmin, user, logout } = useAuth();
  const handleLogout = () => {
    logout('Zostałeś pomyślnie wylogowany!');
  };

  return (
    <nav className={`navbar navbar-expand-lg navbar-light bg-light w-100 ${styles['navbar-custom']}`}>
      <div className="container-fluid">
        <Link className="navbar-brand" to="/">
          <img
            src="/images/logo.png"
            alt="Logo"
            className={styles['navbar-logo']}
          />
        </Link>
        <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav ms-auto">
            {isAuthenticated ? (
              <>
                <Dropdown className='d-none d-lg-block'>
                  <Dropdown.Toggle variant="success" id="dropdown-basic" className={styles['dropdown-toggle-custom']}>
                    <img
                      src={user?.image || '/images/profile_pictures/picture_1.png'}
                      alt="User Avatar"
                      className={styles['user-avatar']}
                    />
                  </Dropdown.Toggle>
                  <Dropdown.Menu>
                    <Dropdown.Item as={Link} to="/profile">Profil użytkownika</Dropdown.Item>

                    {isAdmin && (
                      <Dropdown.Item as={Link} to="/admin">Panel administratora</Dropdown.Item>
                    )}

                    <Dropdown.Item onClick={handleLogout}>Wyloguj się</Dropdown.Item>
                  </Dropdown.Menu>
                </Dropdown>

                <li className="nav-item d-lg-none">
                  <Link className="nav-link" to="/profile">Profil użytkownika</Link>
                </li>
                {isAdmin && (
                  <li className="nav-item d-lg-none">
                    <Link className="nav-link" to="/admin">Panel administratora</Link>
                  </li>
                )}
                <li className="nav-item d-lg-none">
                  <Link className="nav-link" onClick={handleLogout}>Wyloguj się</Link>
                </li>
              </>
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
