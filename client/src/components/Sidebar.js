import React from 'react';
import { Link } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../styles/Sidebar.css'; 

const Sidebar = () => {
  return (
    <div className="sidebar">
      <Link
        to="/my-sets"
        className="sidebar-link"
      >
        Moje Zestawy
      </Link>
      <Link
        to="/tests"
        className="sidebar-link"
      >
        Testy
      </Link>
      <Link
        to="/materials"
        className="sidebar-link"
      >
        Materiały
      </Link>
    </div>
  );
};

export default Sidebar;
