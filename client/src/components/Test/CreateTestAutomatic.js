import React, {useState} from 'react';
import styles from '../../styles/PageSet.module.css';
import {useNavigate} from "react-router-dom";

const CreateTestAutomatic = ({setId, onClose}) => {
    const [testName, setTestName] = useState('');
    const [numberOfQuestions, setNumberOfQuestions] = useState('');
    const [totalTime, setTotalTime] = useState('');
    const [testNameError, setTestNameError] = useState('');
    const [questionsError, setQuestionsError] = useState('');
    const [timeError, setTimeError] = useState('');
    const navigate = useNavigate();

    const handleTestNameChange = (e) => {
        setTestName(e.target.value);
    };

    const handleQuestionsChange = (e) => {
        const value = e.target.value;

        if (!/^[0-9]*$/.test(value)) {
            setQuestionsError('Liczba pytań musi być dodatnią liczbą całkowitą.');
            setNumberOfQuestions('');
        } else {
            setQuestionsError('');
            setNumberOfQuestions(value);
        }
    };

    const handleTimeChange = (e) => {
        const value = e.target.value;

        if (!/^[0-9]*$/.test(value)) {
            setTimeError('Czas musi być dodatnią liczbą całkowitą.');
            setTotalTime('');
        } else {
            setTimeError('');
            setTotalTime(value);
        }
    };

    const handleGenerateTest = () => {
        const numQuestions = parseInt(numberOfQuestions, 10);
        const time = parseInt(totalTime, 10);

        if(!testName) {
            setTestNameError('Nazwa testu jest wymagana');
        }

        if (!numQuestions || numQuestions <= 0) {
            setQuestionsError('Liczba pytań musi być większa niż zero.');
        }

        if (!time || time <= 0) {
            setTimeError('Czas musi być większy niż zero.');
        }

        if (testName && numQuestions > 0 && time > 0) {
            setTestNameError('')
            setQuestionsError('');
            setTimeError('');

            console.log('Generowanie testu automatycznego:');
            console.log('Nazwa testu:'. testName)
            console.log('ID zestawu:', setId);
            console.log('Liczba pytań:', numQuestions, 'Czas:', time);

            navigate('/test-start');
        }
    };

    return (
        <div className={styles.automaticPopup}>
            <button className={styles.popupClose} onClick={onClose}>X</button>
            <h3>Generowanie testu automatycznie </h3>

            <label>
                Nazwa testu:
                <input
                    type="text"
                    value={testName}
                    onChange={handleTestNameChange}
                    placeholder="Podaj nazwę testu"/>
            </label>
            {testNameError && <p className={styles.error}>{testNameError}</p>}
            <label>
                Liczba pytań:
                <input
                    type="text"
                    value={numberOfQuestions}
                    onChange={handleQuestionsChange}
                    placeholder="Wprowadź liczbę pytań"
                />
            </label>
            {questionsError && <p className={styles.error}>{questionsError}</p>}

            <label>
                Czas na cały test (minuty):
                <input
                    type="text"
                    value={totalTime}
                    onChange={handleTimeChange}
                    placeholder="Wprowadź czas"
                />
            </label>
            {timeError && <p className={styles.error}>{timeError}</p>}

            <button onClick={handleGenerateTest}>Generuj test</button>
        </div>
    );
};

export default CreateTestAutomatic;
