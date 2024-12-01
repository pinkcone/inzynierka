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

    const handleTestNameChange = (e) => {
        const value = e.target.value;

        if (value.length < 3 || value.length > 20) {
            setTestNameError('Nazwa testu musi mieć od 3 do 20 znaków.');
        } else {
            setTestNameError('');
        }

        setTestName(value);
    };

    const handleGenerateTest = async () => {
        const numQuestions = parseInt(numberOfQuestions, 10);
        const time = parseInt(totalTime, 10);

        if (!testName || testName.length < 3 || testName.length > 20) {
            setTestNameError('Nazwa testu musi mieć od 3 do 20 znaków.');
            return;
        }

        if (!numQuestions || numQuestions <= 0) {
            setQuestionsError('Liczba pytań musi być większa niż zero.');
            return;
        }

        if (!time || time <= 0) {
            setTimeError('Czas musi być większy niż zero.');
            return;
        }

        setTestNameError('');
        setQuestionsError('');
        setTimeError('');

        try {
            const response = await fetch(`/api/tests/create-random/${setId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                },
                body: JSON.stringify({
                    duration: time,
                    questionCount: numQuestions,
                    setId: setId,
                    name: testName,
                }),
            });

            if (response.ok) {
                const data = await response.json();
                console.log('Utworzono test:', data);
                navigate('/mytests');
            } else {
                const errorData = await response.json();
                setQuestionsError(errorData.error || 'Błąd podczas tworzenia testu.');
            }
        } catch (error) {
            setQuestionsError('Wystąpił błąd podczas tworzenia testu.');
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
                maxLength={50}
                placeholder="Wprowadź nazwę testu"
            />
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
