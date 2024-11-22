import React, {useEffect} from 'react';
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
import Flashcards from './components/Pages/Flashcards';
import EditPageSet from './components/Pages/EditPageSet';
import TestPage from "./components/Pages/TestPage";
import MyTests from "./components/Pages/MyTests";
import {toast, ToastContainer} from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import TestSummaryPage from "./components/Pages/TestSummaryPage";
import TestStartPage from "./components/Pages/TestStartPage";
import AdminDashboard from './components/Admin/AdminDashboard';
import UserList from './components/Admin/UserList';
import SetList from './components/Admin/SetList';

const App = () => {

  useEffect(() => {
    const logoutMessage = localStorage.getItem('logoutMessage');
    if (logoutMessage) {
      // console.log("Toast message: ", logoutMessage);
      toast.success(logoutMessage);
      setTimeout(() => {
        localStorage.removeItem('logoutMessage');
      }, 500);
    }
  }, []);



  return (
      <Router>
        <ToastContainer position="top-center" autoClose={3000} />
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
        <Route path="/flashcards/:setId" element={<Flashcards />} />
        <Route path="/editset/:id" element={<EditPageSet />} /> 
        <Route path="/test/:code" element={<TestPage />} />
        <Route path="/mytests" element={<MyTests />} />
        <Route path="/test-summary/:id" element={<TestSummaryPage />} />
        <Route path="/test-start/:code" element={<TestStartPage />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/userlist" element={<UserList />} />
        <Route path="/setlist" element={<SetList />} />



      </Routes>
    </Router>
  );
};

export default App;
