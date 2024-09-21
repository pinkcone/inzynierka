import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import HomePage from './components/Pages/HomePage';
import Register from './components/Pages/Register';
import Login from './components/Pages/Login';
import UserProfile from './components/Pages/UserProfile';
import AddQuestion from './components/Question/AddQuestion';
import AddAnswer from './components/Answer/AddAnswer';
import MySets from './components/Pages/MySets'; 
import AddSet from './components/Set/AddSet';
import PageSet from './components/Pages/PageSet';
import EditQuestion from './components/Question/EditQuestion';
import EditAnswer from './components/Answer/EditAnswer';


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
