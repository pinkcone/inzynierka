import React, { useEffect, useState } from 'react';
import Navbar from '../Navbar/Navbar';
import { useParams, useNavigate } from 'react-router-dom';
import styles from '../../styles/TestHistoryPage.module.css';
import Sidebar from "../Sidebar/Sidebar";

const TestHistoryPage = () => {
    const [testHistory, setTestHistory] = useState([]);
    const [error, setError] = useState('');
    const { testId } = useParams();
    const navigate = useNavigate();

    useEffect(() => {
        const fetchTestHistory = async () => {
            try {
                const response = await fetch(`/api/completed-tests/history/${testId}`, {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('token')}`,
                    },
                });

                if (response.ok) {
                    const data = await response.json();
                    setTestHistory(data);
                } else {
                    setError('Nie udało się pobrać historii podejść.');
                }
            } catch (err) {
                setError(`Wystąpił błąd: ${err.message}`);
            }
        };

        fetchTestHistory();
    }, [testId]);

    const handleViewSummary = (completedTestId) => {
        navigate(`/test-summary/${completedTestId}`);
    };

    return (
        <div className={styles.appContainer}>
            <Navbar />
            <Sidebar />
            <div className={styles.historyContainer}>
                <h1>Historia podejść do testu</h1>
                {error && <p className={styles.error}>{error}</p>}
                {testHistory.length > 0 ? (
                    <table className={styles.historyTable}>
                        <thead>
                        <tr>
                            <th>Data podejścia</th>
                            <th>Wynik</th>
                            <th>Akcja</th>
                        </tr>
                        </thead>
                        <tbody>
                        {testHistory.map((attempt) => (
                            <tr key={attempt.id}>
                                <td>{new Date(attempt.createdAt).toLocaleString()}</td>
                                <td>{Math.round(attempt.score * 100) / 100}</td>
                                <td>
                                    <button
                                        className={styles.viewButton}
                                        onClick={() => handleViewSummary(attempt.id)}
                                    >
                                        Zobacz szczegóły
                                    </button>
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                ) : (
                    <p>Brak podejść do tego testu.</p>
                )}
                <button
                    className={styles.backButton}
                    onClick={() => navigate('/mytests')}
                >
                    Powrót do testów
                </button>
            </div>
        </div>
    );
};

export default TestHistoryPage;
