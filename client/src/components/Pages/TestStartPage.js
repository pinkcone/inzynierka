import React from 'react';
import { useNavigate } from 'react-router-dom';
import styles from '../../styles/TestStartPage.module.css';

const TestStartPage = ({ setName, questionCount, timeLimit }) => {
    const navigate = useNavigate();

    const startTest = () => {
        navigate('/test');
    };

    return (
        <div className={styles.startPageContainer}>
            <h1>Rozpocznij Test</h1>
            <p>Zestaw: {setName}</p>
            <p>Liczba pytań: {questionCount}</p>
            <p>Czas na rozwiązanie: {Math.floor(timeLimit / 60)} minut</p>
            <button className={styles.startButton} onClick={startTest}>
                Rozpocznij test
            </button>
        </div>
    );
};

export default TestStartPage;
