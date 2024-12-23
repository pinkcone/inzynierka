import React, {useEffect} from 'react';
import {BrowserRouter as Router, Route, Routes} from 'react-router-dom';
import {toast, ToastContainer} from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import PrivateRoute from './components/PrivateRoute';

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
import TestSummaryPage from "./components/Pages/TestSummaryPage";
import TestStartPage from "./components/Pages/TestStartPage";
import AdminDashboard from './components/Admin/AdminDashboard';
import UserList from './components/Admin/UserList';
import SetList from './components/Admin/SetList';
import MyQuizzes from "./components/Pages/MyQuizzes";
import WaitingPage from './components/Quiz/WaitingPage';
import QuizSummaryPage from './components/Quiz/QuizSummaryPage';
import MyFlashcards from './components/Flashcards/MyFlashcards';
import QuizLobby from './components/Quiz/QuizLobby';
import JoinQuiz from './components/Quiz/JoinQuiz';
import QuizPlay from './components/Quiz/QuizPlay';
import SocketProviderLayout from './contexts/SocketProviderLayout';
import TestHistoryPage from "./components/Pages/TestHistoryPage";

const App = () => {

    useEffect(() => {
        const logoutMessage = localStorage.getItem('logoutMessage');
        if (logoutMessage) {
            toast.success(logoutMessage);
            setTimeout(() => {
                localStorage.removeItem('logoutMessage');
            }, 500);
        }
    }, []);


    return (
        <Router>
            <ToastContainer position="top-center" autoClose={3000}/>
            <Routes>
                <Route path="/" element={<HomePage/>}/>
                <Route path="/register" element={<Register/>}/>
                <Route path="/login" element={<Login/>}/>

                <Route
                    path="/profile"
                    element={
                        <PrivateRoute>
                            <UserProfile/>
                        </PrivateRoute>
                    }
                />
                <Route
                    path="/addset"
                    element={
                        <PrivateRoute>
                            <AddSet/>
                        </PrivateRoute>
                    }
                />
                <Route
                    path="/add-question/:setId"
                    element={
                        <PrivateRoute>
                            <AddQuestion/>
                        </PrivateRoute>
                    }
                />
                <Route
                    path="/add-answer/:questionId"
                    element={
                        <PrivateRoute>
                            <AddAnswer/>
                        </PrivateRoute>
                    }
                />
                <Route
                    path="/mysets"
                    element={
                        <PrivateRoute>
                            <MySets/>
                        </PrivateRoute>
                    }
                />
                <Route
                    path="/page-set/:id"
                    element={
                        <PrivateRoute>
                            <PageSet/>
                        </PrivateRoute>
                    }
                />
                <Route
                    path="/edit-question/:id"
                    element={
                        <PrivateRoute>
                            <EditQuestion/>
                        </PrivateRoute>
                    }
                />
                <Route
                    path="/edit-answer/:id"
                    element={
                        <PrivateRoute>
                            <EditAnswer/>
                        </PrivateRoute>
                    }
                />
                <Route
                    path="/flashcards/:setId"
                    element={
                        <PrivateRoute>
                            <Flashcards/>
                        </PrivateRoute>
                    }
                />
                <Route
                    path="/editset/:id"
                    element={
                        <PrivateRoute>
                            <EditPageSet/>
                        </PrivateRoute>
                    }
                />
                <Route
                    path="/test/:code"
                    element={
                        <PrivateRoute>
                            <TestPage/>
                        </PrivateRoute>
                    }
                />
                <Route
                    path="/mytests"
                    element={
                        <PrivateRoute>
                            <MyTests/>
                        </PrivateRoute>
                    }
                />
                <Route
                    path="/test-summary/:id"
                    element={
                        <PrivateRoute>
                            <TestSummaryPage/>
                        </PrivateRoute>
                    }
                />
                <Route
                    path="/test-start/:code"
                    element={
                        <PrivateRoute>
                            <TestStartPage/>
                        </PrivateRoute>
                    }
                />
                <Route
                    path="/admin"
                    element={
                        <PrivateRoute>
                            <AdminDashboard/>
                        </PrivateRoute>
                    }
                />
                <Route
                    path="/userlist"
                    element={
                        <PrivateRoute>
                            <UserList/>
                        </PrivateRoute>
                    }
                />
                <Route
                    path="/setlist"
                    element={
                        <PrivateRoute>
                            <SetList/>
                        </PrivateRoute>
                    }
                />
                <Route
                    path="/myquizzes"
                    element={
                        <PrivateRoute>
                            <MyQuizzes/>
                        </PrivateRoute>
                    }
                />
                <Route
                    path="/waiting"
                    element={
                        <PrivateRoute>
                            <WaitingPage/>
                        </PrivateRoute>
                    }
                />
                <Route
                    path="/quiz-summary"
                    element={
                        <PrivateRoute>
                            <QuizSummaryPage/>
                        </PrivateRoute>
                    }
                />
                <Route
                    path="/myflashcards"
                    element={
                        <PrivateRoute>
                            <MyFlashcards/>
                        </PrivateRoute>
                    }
                />
                <Route
                    path="/test-history/:testId"
                    element={
                        <PrivateRoute>
                            <TestHistoryPage/>
                        </PrivateRoute>
                    }/>


                <Route element={<SocketProviderLayout/>}>
                    <Route path="/quiz/lobby/:quizId" element={<QuizLobby/>}/>
                    <Route path="/join-quiz" element={<JoinQuiz/>}/>
                    <Route path="/quiz/play/:code" element={<QuizPlay/>}/>
                </Route>

            </Routes>
        </Router>
    );
};

export default App;
