import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../Navbar/Navbar';
import Sidebar from '../Sidebar/Sidebar';
import styles from '../../styles/MySets.module.css';

const MyFlashcards = () => {
    const [flashcardSets, setFlashcardSets] = useState([]);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [showConfirmPopup, setShowConfirmPopup] = useState(false);
    const [confirmPopupContent, setConfirmPopupContent] = useState('');
    const [onConfirm, setOnConfirm] = useState(() => () => { });
    const navigate = useNavigate();

    useEffect(() => {
        const fetchUserFlashcardSets = async () => {
            try {
                const response = await fetch('/api/flashcards/sets', {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    },
                });

                if (response.ok) {
                    const data = await response.json();
                    setFlashcardSets(data);
                    console.log(data);
                } else {
                    console.log(response);
                    setError('Nie udało się pobrać zestawów fiszek.');
                    setTimeout(() => setError(''), 3000);
                }
            } catch (err) {
                setError('Wystąpił błąd podczas pobierania zestawów fiszek.');
                setTimeout(() => setError(''), 3000);
            }
        };

        fetchUserFlashcardSets();
    }, []);

    const handleStartFlashcards = (setId) => {
        navigate(`/flashcards/${setId}`);
    };

    const handleDeleteFlashcards = (setId) => {
        setConfirmPopupContent('Czy na pewno chcesz usunąć wszystkie fiszki z tego zestawu?');
        setOnConfirm(() => () => confirmDeleteFlashcards(setId));
        setShowConfirmPopup(true);
    };

    const confirmDeleteFlashcards = async (setId) => {
        try {
            const response = await fetch(`/api/flashcards/set/${setId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                },
            });

            if (response.ok) {
                const data = await response.json();
                setMessage(data.message || 'Fiszki zostały pomyślnie usunięte.');
                setFlashcardSets((prevSets) => prevSets.filter((set) => set.setId !== setId));
                setTimeout(() => setMessage(''), 3000);
            } else {
                const data = await response.json();
                setError(data.message || 'Nie udało się usunąć fiszek.');
                setTimeout(() => setError(''), 3000);
            }
        } catch (error) {
            console.error('Błąd podczas usuwania fiszek:', error);
            setError('Wystąpił błąd podczas usuwania fiszek.');
            setTimeout(() => setError(''), 3000);
        } finally {
            setShowConfirmPopup(false);
        }
    };
    const handleResetFlashcards = (setId) => {
        setConfirmPopupContent('Czy na pewno chcesz zresetować postęp w tym zestawie fiszek?');
        setOnConfirm(() => () => confirmResetFlashcards(setId));
        setShowConfirmPopup(true);
    };

    const confirmResetFlashcards = async (setId) => {
        try {
            const response = await fetch(`/api/flashcards/set/${setId}/reset`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                },
            });

            if (response.ok) {
                const data = await response.json();
                setMessage(data.message || 'Postęp fiszek został pomyślnie zresetowany.');
                setTimeout(() => setMessage(''), 3000);
            } else {
                const data = await response.json();
                setError(data.message || 'Nie udało się zresetować postępu fiszek.');
                setTimeout(() => setError(''), 3000);
            }
        } catch (error) {
            console.error('Błąd podczas resetowania fiszek:', error);
            setError('Wystąpił błąd podczas resetowania fiszek.');
            setTimeout(() => setError(''), 3000);
        } finally {
            setShowConfirmPopup(false);
        }
    };
    return (
        <div className={styles.appContainer}>
            <Navbar />
            <div className={styles.mainContent}>
                <Sidebar />
                <div className={styles.content}>
                    <h2 className={styles.textCenter}>Moje Fiszki</h2>
                    {error && <div className={styles.alertDanger}>{error}</div>}
                    {message && <div className={styles.alertSuccess}>{message}</div>}

                    {flashcardSets.length > 0 ? (
                        <div className={styles.flashcardList}>
                            {flashcardSets.map((set) => (
                                <div key={set.setId} className={styles.flashcardCard}>
                                    <h3 className={styles.flashcardName}>{set.setName}</h3>
                                    <p><strong>Liczba fiszek:</strong> {set.flashcardsNumber}</p>
                                    <div className={styles.actions}>
                                        <button
                                            onClick={() => handleStartFlashcards(set.setId)}
                                            className={styles.button}
                                        >
                                            WZNÓW NAUKĘ
                                        </button>
                                        <button
                                            onClick={() => handleResetFlashcards(set.setId)}
                                            className={styles.button}
                                        >
                                            RESETUJ POSTĘP
                                        </button>
                                        <button
                                            onClick={() => handleDeleteFlashcards(set.setId)}
                                            className={`${styles.button} ${styles.deleteButton}`}
                                        >
                                            USUŃ
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p>Brak fiszek do wyświetlenia. Odwiedź swoje zestawy i utwórz pierwsze fiszki!</p>
                    )}

                    {showConfirmPopup && (
                        <div className={styles.popupOverlay}>
                            <div className={styles.popup}>
                                <button className={styles.popupClose} onClick={() => setShowConfirmPopup(false)}>
                                    X
                                </button>
                                <p>{confirmPopupContent}</p>
                                <button
                                    onClick={() => {
                                        onConfirm();
                                    }}
                                    className={styles.button}
                                >
                                    Potwierdź
                                </button>
                                <button
                                    onClick={() => setShowConfirmPopup(false)}
                                    className={styles.button}
                                >
                                    Anuluj
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default MyFlashcards;
