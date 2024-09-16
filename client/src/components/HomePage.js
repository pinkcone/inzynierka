import React from 'react';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import { FaSearch } from 'react-icons/fa';

const HomePage = () => {
  const containerStyle = {
    display: 'flex',
    flexDirection: 'column', 
  };

  const navbarStyle = {
    width: '100%',
    position: 'fixed', 
    top: 0,
    left: 0,
    zIndex: 1000, 
  };

  const mainContainerStyle = {
    display: 'flex',
    marginTop: '100px', 
  };

  const sidebarStyle = {
    width: '250px', 
    position: 'fixed', 
    top: '100px', 
    left: 0,
    bottom: 0,
    zIndex: 999, 
  };

  const mainContentStyle = {
    flex: 1,
    padding: '20px',
    marginLeft: '250px', 
  };

  const searchContainerStyle = {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: '20px',
  };

  const searchInputStyle = {
    padding: '10px',
    width: '300px',
    border: '1px solid #ccc',
    borderRadius: '4px',
  };

  const searchButtonStyle = {
    backgroundColor: '#007bff',
    border: 'none',
    color: 'white',
    padding: '10px 15px',
    marginLeft: '-4px',
    borderRadius: '4px',
    cursor: 'pointer',
  };

  const searchButtonHoverStyle = {
    backgroundColor: '#0056b3',
  };

  const welcomeTextStyle = {
    textAlign: 'center',
    marginTop: '40px',
  };

  return (
    <div>
      <Navbar style={navbarStyle} />
      <div style={mainContainerStyle}>
        <Sidebar style={sidebarStyle} />
        <div style={mainContentStyle}>
          <div style={welcomeTextStyle}>
            <h1>Witamy na stronie głównej!</h1>
            <p>Poniżej wyszukasz materiały na podstawie słów kluczowych.</p>
          </div>
          <div style={searchContainerStyle}>
            <input
              type="text"
              placeholder="Szukaj..."
              style={searchInputStyle}
            />
            <button
              style={searchButtonStyle}
              onMouseOver={e => e.currentTarget.style.backgroundColor = searchButtonHoverStyle.backgroundColor}
              onMouseOut={e => e.currentTarget.style.backgroundColor = searchButtonStyle.backgroundColor}
            >
              <FaSearch />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
