import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import HomePage from './components/HomePage';
import Register from './components/Register';
import Login from './components/Login';
import UserProfile from './components/UserProfile';
import CreateSet from './components/CreateSet';
import AddQuestion from './components/AddQuestion';
import AddAnswer from './components/AddAnswer';
import MySets from './components/MySets'; 


const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/profile" element={<UserProfile />} />
        <Route path="/create-set" element={<CreateSet />} />
        <Route path="/add-question/:setId" element={<AddQuestion />} />
        <Route path="/add-answer/:questionId" element={<AddAnswer />} />
        <Route path="/my-sets" element={<MySets />} />
      </Routes>
    </Router>
  );
};

export default App;
