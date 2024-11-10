import React, {useEffect, useState} from 'react';
import {useNavigate, useParams} from 'react-router-dom';
import styles from '../../styles/TestStartPage.module.css';

const TestStartPage = () => {
    const {code} = useParams();
    const navigate = useNavigate();
    const [test, setTest] = useState(null);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchTestDetails = async () => {
            try {
                const response = await fetch(`/api/tests/${code}`, {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    },
                });
                if (response.ok) {
                    const data = await response.json();
                    setTest(data);
                } else {
                    setError("Nie udało się pobrać szczegółów testu.")
                }
            } catch (err) {
                setError(`Wystąpił błąd: ${err.message}`);
            }
        };
        fetchTestDetails();
    }, [code]);

    const startTest = () => {
        navigate(`/test/${code}`);
    };

    return (
        <div className={styles.startPageContainer}>
            <h1>Rozpocznij Test</h1>
            {error && <p className={styles.error}>{error}</p>}
            {test ? (
                <>
                    <p>Nazwa testu: {test.name}</p>
                    <p>Liczba pytań: {test.questionCount}</p>
                    <p>Czas na rozwiązanie: {Math.floor(test.duration / 60)} minut</p>
                    <button className={styles.startButton} onClick={startTest}>
                        Rozpocznij test
                    </button>
                </>
            ) : (
                !error && <p>Ładowanie szczegółów testu...</p>
            )}
        </div>
    );
};

export default TestStartPage;
