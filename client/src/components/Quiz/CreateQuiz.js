import React, { useState, useEffect } from 'react';
import styles from '../../styles/PageSet.module.css';
import { useNavigate } from 'react-router-dom';

const CreateQuiz = ({ setId, onClose }) => {
    const [quizName, setQuizName] = useState('');
    const [selectedQuestions, setSelectedQuestions] = useState([]);
    const [questionTime, setQuestionTime] = useState('');
    const [isPublic, setIsPublic] = useState(false);
    const [questions, setQuestions] = useState([]);
    const [error, setError] = useState('');
    const [timeError, setTimeError] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        const fetchQuestions = async () => {
            try {
                const response = await fetch(`/api/questions/set/${setId}`, {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('token')}`,
                    },
                });

                if (response.ok) {
                    const data = await response.json();
                    setQuestions(data);
                } else {
                    setError('Nie udało się pobrać pytań.');
                }
            } catch (err) {
                setError('Wystąpił błąd podczas pobierania pytań.');
            }
        };

        fetchQuestions();
    }, [setId]);


    const handleQuestionTimeChange = (e) => {
        const value = e.target.value;

        if (!/^[0-9]*$/.test(value) || parseInt(value, 10) <= 0) {
            setTimeError('Czas na pytanie musi być dodatnią liczbą całkowitą.');
            setQuestionTime('');
        } else {
            setTimeError('');
            setQuestionTime(value);
        }
    };

    const handleQuestionSelect = (questionId) => {
        setSelectedQuestions((prev) =>
            prev.includes(questionId) ? prev.filter((q) => q !== questionId) : [...prev, questionId]
        );
    };

    const handleSelectAll = (e) => {
        const isChecked = e.target.checked;
        if (isChecked) {
            setSelectedQuestions(questions.map((q) => q.id));
        } else {
            setSelectedQuestions([]);
        }
    };

    const handleCreateQuiz = async () => {
        const singleQuestionTime = parseInt(questionTime, 10);

        if (!quizName) {
            setError('Nazwa quizu nie może być pusta.');
            return;
        }

        if (selectedQuestions.length === 0) {
            setError('Musisz wybrać co najmniej jedno pytanie.');
            return;
        }

        if (!singleQuestionTime || singleQuestionTime <= 0) {
            setTimeError('Czasy muszą być większe niż zero.');
            return;
        }

        try {
            const response = await fetch(`/api/quizzes/add`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                },
                body: JSON.stringify({
                    name: quizName,
                    questionTime: singleQuestionTime,
                    isPublic,
                    setId,
                    questionsIds: selectedQuestions,
                }),
            });

            if (response.ok) {
                const data = await response.json();
                console.log('Utworzono quiz:', data);
                navigate('/myquizzes');
            } else {
                const errorData = await response.json();
                setError(errorData.error || 'Błąd podczas tworzenia quizu.');
            }
        } catch (error) {
            setError('Wystąpił błąd podczas tworzenia quizu. ');
            console.log(error);
        }
    };

    return (
        <div className={styles.manualPopup}>
            <button className={styles.popupClose} onClick={onClose}>
                X
            </button>
            <h3>Tworzenie quizu</h3>

            <label className={styles.black}>
                Nazwa quizu:
                <input
                    type="text"
                    value={quizName}
                    onChange={(e) => setQuizName(e.target.value)}
                    placeholder="Wprowadź nazwę quizu"
                    maxLength={50}
                />
            </label>

            <label className={styles.black}>
                Czas na jedno pytanie (sekundy):
                <input
                    type="text"
                    value={questionTime}
                    onChange={handleQuestionTimeChange}
                    placeholder="Wprowadź czas"
                />
            </label>

            <label className={styles.black}>
                Czy quiz jest publiczny:
                <input
                    type="checkbox"
                    checked={isPublic}
                    onChange={(e) => setIsPublic(e.target.checked)}
                />
            </label>

            {timeError && <p className={styles.error}>{timeError}</p>}
            {error && <p className={styles.error}>{error}</p>}

            <h4>Wybierz pytania:</h4>
            <div>
                <label className={styles.checkbox}>
                    <input
                        type="checkbox"
                        onChange={handleSelectAll}
                        checked={selectedQuestions.length === questions.length && questions.length > 0}
                    />
                    Zaznacz wszystkie
                </label>
            </div>

            {questions.length > 0 ? (
                questions.map((question) => (
                    <label key={question.id} className={styles.checkbox}>
                        <input
                            type="checkbox"
                            checked={selectedQuestions.includes(question.id)}
                            onChange={() => handleQuestionSelect(question.id)}
                        />
                        {question.content}
                    </label>
                ))
            ) : (
                <p>Brak pytań w zestawie.</p>
            )}

            <button onClick={handleCreateQuiz}>Utwórz quiz</button>
        </div>
    );
};

export default CreateQuiz;
