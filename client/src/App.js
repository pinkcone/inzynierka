import React, { useState } from 'react';
import { FaUser } from 'react-icons/fa';
import Register from './components/Register';
import Login from './components/Login';

function App() {
    const [isLogin, setIsLogin] = useState(true);

    return (
        <div className="container mt-4">
            <div className="text-center mb-4">
                <FaUser size={50} />
                <h1>Witamy w naszej aplikacji!</h1>
            </div>

            <div className="text-center mb-4">
                <button
                    className={`btn ${isLogin ? 'btn-primary' : 'btn-secondary'} me-2`}
                    onClick={() => setIsLogin(true)}
                >
                    Logowanie
                </button>
                <button
                    className={`btn ${!isLogin ? 'btn-primary' : 'btn-secondary'}`}
                    onClick={() => setIsLogin(false)}
                >
                    Rejestracja
                </button>
            </div>

            {isLogin ? <Login /> : <Register />}
        </div>
    );
}

export default App;
