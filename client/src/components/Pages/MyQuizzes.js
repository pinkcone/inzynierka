import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../Navbar/Navbar';
import Sidebar from '../Sidebar/Sidebar';
import styles from '../../styles/MySets.module.css';

const MyQuizzes = () => {
    const [quizzes, setQuizzes] = useState([]);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const navigate = useNavigate();
    const [showConfirmPopup, setShowConfirmPopup] = useState(false);
    const [confirmPopupContent, setConfirmPopupContent] = useState('');
    const [onConfirm, setOnConfirm] = useState(() => () => {});

    useEffect(() => {
        const fetchUserQuizzes = async () => {
            try {
                const response = await fetch('/api/quizzes/get-all', {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    },
                });

                if (response.ok) {
                    const data = await response.json();
                    console.log("Quizy: ", data);
                    setQuizzes(data.quizzes);
                } else {
                    setError('Nie udało się pobrać quizów.');
                }
            } catch (err) {
                setError('Wystąpił błąd podczas pobierania quizów.' + err);
            } finally {
                setIsLoading(false);
            }
        };

        fetchUserQuizzes();
    }, []);

    const handleDeleteQuiz = (id) => {
        setConfirmPopupContent('Czy na pewno chcesz usunąć ten quiz?');
        setOnConfirm(() => confirmDeleteQuiz.bind(null, id));
        setShowConfirmPopup(true);
    };

    const confirmDeleteQuiz = async (id) => {
        try {
            const response = await fetch(`/api/quizzes/delete/${id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                },
            });

            if (response.ok) {
                setMessage('Quiz został pomyślnie usunięty.');
                setTimeout(() => setMessage(''), 3000);
                setQuizzes((prevQuizzes) => prevQuizzes.filter((quiz) => quiz.id !== id));
            } else {
                const data = await response.json();
                setError(data.message || 'Nie udało się usunąć quizu.');
                setTimeout(() => setError(''), 3000);
            }
        } catch (error) {
            console.error('Error deleting quiz:', error);
            setError('Wystąpił błąd podczas usuwania quizu.');
            setTimeout(() => setError(''), 3000);
        } finally {
            setShowConfirmPopup(false);
        }
    };

    const handleOpenQuiz = (id) => {
        navigate(`#`);
    };

    return (
        <div className={styles.appContainer}>
            <Navbar />
            <div className={styles.mainContent}>
                <Sidebar />
                <div className={styles.content}>
                    <h2 className={styles.textCenter}>Moje quizy</h2>
                    {error && <div className={styles.alertDanger}>{error}</div>}
                    {message && <div className={styles.alertSuccess}>{message}</div>}

                    {isLoading ? (
                        <p>Ładowanie quizów...</p>
                    ) : quizzes.length > 0 ? (
                        <table className={styles.table}>
                            <thead>
                            <tr>
                                <th>Nazwa</th>
                                <th>Czas na pytanie</th>
                                <th>Akcje</th>
                            </tr>
                            </thead>
                            <tbody>
                            {quizzes.map((quiz) => (
                                <tr key={quiz.id}>
                                    <td>{quiz.name}</td>
                                    <td>{quiz.questionTime} sekund</td>
                                    <td>
                                        <button
                                            onClick={() => handleOpenQuiz(quiz.id)}
                                            className={styles.button}
                                        >
                                            Otwórz quiz
                                        </button>
                                        <button
                                            onClick={() => handleDeleteQuiz(quiz.id)}
                                            className={`${styles.button} ${styles.deleteButton}`}
                                        >
                                            Usuń
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    ) : (
                        <p>Brak quizów do wyświetlenia.</p>
                    )}
                    {showConfirmPopup && (
                        <div className={styles.popupOverlay}>
                            <div className={styles.popup}>
                                <button className={styles.popupClose} onClick={() => setShowConfirmPopup(false)}>X
                                </button>
                                <p>{confirmPopupContent}</p>
                                <button onClick={() => {
                                    onConfirm();
                                }}>Potwierdź
                                </button>
                                <button onClick={() => setShowConfirmPopup(false)}>Anuluj</button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default MyQuizzes;
