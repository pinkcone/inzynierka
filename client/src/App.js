import React from 'react';
import { FaUser } from 'react-icons/fa';
import Register from './components/Register';
import Login from './components/Login'; 

function App() {
  return (
    <div className="container mt-4">
      <div className="text-center mb-4">
        <FaUser size={50} /> {/* Ikonka */}
        <h1>Witamy w naszej aplikacji!</h1>
      </div>
      <Register />
      <br/> <br/> <br/>
      <Login />
    </div>
  );
}

export default App;
