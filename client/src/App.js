import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import HomePage from './components/HomePage';
import Register from './components/Register';
import Login from './components/Login';
import UserProfile from './components/UserProfile';
import AddQuestion from './components/AddQuestion';
import AddAnswer from './components/AddAnswer';
import MySets from './components/MySets'; 
import AddSet from './components/AddSet';
import PageSet from './components/PageSet';
import EditQuestion from './components/EditQuestion';
import EditAnswer from './components/EditAnswer';


const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/profile" element={<UserProfile />} />
        <Route path="/addset" element={<AddSet />} />
        <Route path="/add-question/:setId" element={<AddQuestion />} />
        <Route path="/add-answer/:questionId" element={<AddAnswer />} />
        <Route path="/mysets" element={<MySets />} />
        <Route path="/page-set/:id" element={<PageSet />} />
        <Route path="/edit-question/:id" element={<EditQuestion />} />
        <Route path="/edit-answer/:id" element={<EditAnswer />} />
        <Route path="/edit-question/:questionId" element={<EditQuestion />} />
        <Route path="/edit-answer/:answerId" element={<EditAnswer />} />
        <Route path="/edit-answer/:answerId" element={<EditAnswer />} />
      </Routes>
    </Router>
  );
};

export default App;
