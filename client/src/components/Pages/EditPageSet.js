import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import Navbar from '../Navbar/Navbar';
import SetSidebar from '../Sidebar/SetSidebar';
import styles from '../../styles/PageSet.module.css';
import AddQuestion from '../Question/AddQuestion';
import AddAnswer from '../Answer/AddAnswer';
import EditQuestion from '../Question/EditQuestion';
import EditAnswer from '../Answer/EditAnswer';
import ManageSet from '../Set/ManageSet';
import AddCollaborator from '../Set/AddCollaborator';
import DeleteSet from '../Set/DeleteSet';
import CollaboratorsList from '../Set/CollaboratorsList';
import { FaEdit, FaTrash } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';

const EditPageSet = () => {
  const { id } = useParams();
  const [set, setSet] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [error, setError] = useState('');
  const [activeSection, setActiveSection] = useState('');
  const [showAddAnswer, setShowAddAnswer] = useState(false);
  const [selectedQuestionId, setSelectedQuestionId] = useState(null);
  const [editQuestionId, setEditQuestionId] = useState(null);
  const [editAnswerId, setEditAnswerId] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [showAddCollaborator, setShowAddCollaborator] = useState(false);
  const navigate = useNavigate();
  const [isOwner, setIsOwner] = useState(false);
  const [showConfirmPopup, setShowConfirmPopup] = useState(false);
  const [confirmPopupContent, setConfirmPopupContent] = useState('');
  const [onConfirm, setOnConfirm] = useState(() => () => { });
  const [isCollabolator, setIsCollabolator] = useState(false);
  const closeAllPopups = () => {
    setActiveSection('');
    setShowAddAnswer(false);
    setShowAddCollaborator(false);
    setEditQuestionId(null);
    setEditAnswerId(null);
    setShowConfirmPopup(false);
    setSelectedQuestionId(null);
  };

  const fetchSet = async () => {
    try {
      const response = await fetch(`/api/sets/${id}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setSet(data);

        const token = localStorage.getItem('token');
        const decodedToken = jwtDecode(token);
        const userId = decodedToken.userId || decodedToken.id || decodedToken.sub;

        if (userId.toString() === data.ownerId.toString()) {
          setIsOwner(true);
        } else if( data.collaboratorsList?.[userId]){
          setIsOwner(true);
          setIsCollabolator(true);
        }else{
          setIsOwner(false);
        }
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Nie udało się pobrać zestawu.');
      }
    } catch (err) {
      setError('Wystąpił błąd podczas pobierania zestawu.');
    }
  };

  const fetchQuestions = async () => {
    try {
      const response = await fetch(`/api/questions/set/${id}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        const questionsWithAnswers = await Promise.all(
          data.map(async (question) => {
            try {
              const answersResponse = await fetch(`/api/answers/question/${question.id}`, {
                headers: {
                  'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
              });
              const answersData = answersResponse.ok ? await answersResponse.json() : [];
              return { ...question, answers: answersData };
            } catch (err) {
              return { ...question, answers: [] };
            }
          })
        );
        setQuestions(questionsWithAnswers);
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Nie udało się pobrać pytań.');
      }
    } catch (err) {
      setError('Wystąpił błąd podczas pobierania pytań.');
    }
  };

  useEffect(() => {
    fetchSet();
    fetchQuestions();
  }, [id]);

  const handleSetUpdated = async () => {
    await fetchSet();
  };

  const handleAddAnswerClick = (questionId) => {
    closeAllPopups();
    setSelectedQuestionId(questionId);
    setShowAddAnswer(true);
  };

  const handleEditQuestionClick = (questionId) => {
    closeAllPopups();
    setEditQuestionId(questionId);
  };

  const handleEditAnswerClick = (answer) => {
    closeAllPopups();
    setEditAnswerId(answer.id);
  };

  const showMessage = (message) => {
    setSuccessMessage(message);
    const timeoutId = setTimeout(() => {
      setSuccessMessage('');
    }, 2000);
    return timeoutId;
  };

  const handleQuestionAdded = async (newQuestionId) => {
    try {
      closeAllPopups();
      showMessage('Pytanie zostało dodane pomyślnie!');
      await refreshSet();

      setSelectedQuestionId(newQuestionId);
      setShowAddAnswer(true);
    } catch (err) {
      setError('Wystąpił błąd podczas dodawania pytania.');
    }
  };


  const handleAnswerAdded = async () => {
    showMessage('Odpowiedź została dodana pomyślnie!');
    await refreshQuestions();
  };

  const handleAnswerEdited = async () => {
    showMessage('Odpowiedź została edytowana!');
    await refreshQuestions();
  };

  const handleEditComplete = async () => {
    showMessage('Pytanie zostało zaktualizowane.');
    await refreshQuestions();
  };

  const refreshQuestions = async () => {
    try {
      const response = await fetch(`/api/questions/set/${id}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        const questionsWithAnswers = await Promise.all(
          data.map(async (question) => {
            try {
              const answersResponse = await fetch(`/api/answers/question/${question.id}`, {
                headers: {
                  'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
              });
              const answersData = answersResponse.ok ? await answersResponse.json() : [];
              return { ...question, answers: answersData };
            } catch (err) {
              return { ...question, answers: [] };
            }
          })
        );
        setQuestions(questionsWithAnswers);
      } else {
        if (response.status === 404)
          setQuestions([]);

        const errorData = await response.json();
        setError(errorData.message || 'Nie udało się pobrać pytań.');
      }
    } catch (err) {
      setError('Wystąpił błąd podczas pobierania pytań.');
    }
  };

  const refreshSet = async () => {
    try {
      const response = await fetch(`/api/questions/set/${id}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        const questionsWithAnswers = await Promise.all(
          data.map(async (question) => {
            try {
              const answersResponse = await fetch(`/api/answers/question/${question.id}`, {
                headers: {
                  'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
              });
              const answersData = answersResponse.ok ? await answersResponse.json() : [];
              return { ...question, answers: answersData };
            } catch (err) {
              return { ...question, answers: [] };
            }
          })
        );
        setQuestions(questionsWithAnswers);
        setError("");
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Nie udało się pobrać pytań.');
      }
    } catch (err) {
      setError('Wystąpił błąd podczas pobierania pytań.');
    }
  };

  const handleSidebarClick = (section) => {
    closeAllPopups();
    setActiveSection(section);
  };

  const handleSidebarClose = () => {
    closeAllPopups();
    setSuccessMessage('');
  };

  const handleCollaboratorAdded = async () => {
    await fetchSet();
    showMessage('Współtwórca został dodany!');
  };

  const handleSetDeleted = () => {
    setSuccessMessage('Zestaw został pomyślnie usunięty!');
    setTimeout(() => {
      setSuccessMessage('');
      navigate('/mysets');
    }, 2000);
  };

  const handleDeleteQuestionClick = (questionId) => {
    closeAllPopups();
    setConfirmPopupContent(
      <>Czy na pewno chcesz usunąć to pytanie?<br />Usunięcie pytania wiąże się z usunięciem go z powiązanych testów i quizów.</>
    );
    setOnConfirm(() => () => handleConfirmDelete('question', questionId));
    setShowConfirmPopup(true);
  };

  const handleDeleteAnswerClick = (answerId) => {
    closeAllPopups();
    setConfirmPopupContent('Czy na pewno chcesz usunąć tę odpowiedź?');
    setOnConfirm(() => () => handleConfirmDelete('answer', answerId));
    setShowConfirmPopup(true);
  };

  const handleConfirmDelete = async (type, id) => {
    try {
      const endpoint = type === 'question' ? `/api/questions/delete/${id}` : `/api/answers/delete/${id}`;
      const response = await fetch(endpoint, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        showMessage(`${type === 'question' ? 'Pytanie' : 'Odpowiedź'} zostało usunięte.`);
        await refreshQuestions();
        await refreshSet();
      } else {
        const errorData = await response.json();
        setError(errorData.message || `Nie udało się usunąć ${type === 'question' ? 'pytania' : 'odpowiedzi'}.`);
      }
    } catch (err) {
      setError(`Wystąpił błąd podczas usuwania ${type === 'question' ? 'pytania' : 'odpowiedzi'}.`);
    } finally {
      setShowConfirmPopup(false);
    }
  };

  const handleStartFlashcards = async (setId) => {
    try {
      const response = await fetch(`/api/flashcards/create-from-set/${setId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Utworzono fiszki:', data);
        navigate(`/flashcards/${setId}`);
      } else {
        console.error('Błąd podczas tworzenia fiszek:', response.statusText);
      }
    } catch (error) {
      console.error('Błąd podczas tworzenia fiszek:', error);
    }
  };

  return (
    <div className={styles.appContainer}>
      <Navbar />
      <div className={styles.mainContent}>
        <SetSidebar
          onSectionClick={handleSidebarClick}
          activeSection={activeSection}
          setName={set?.name || 'Loading...'}
          setId={id}
          onClose={handleSidebarClose}
          onSetUpdated={handleSetUpdated}
          isOwner={isOwner}
          isEditing={true}
          handleStartFlashcards={handleStartFlashcards}
          isCollabolator={isCollabolator}
        />
        <div className={styles.content}>
          {successMessage && <div className={`${styles.alert} ${styles.alertSuccess}`}>{successMessage}</div>}
          {error && <div className={`${styles.alert} ${styles.alertDanger}`}>{error}</div>}

          {isOwner && (
            <button
              className={styles.crudbutton}
              onClick={() => {
                closeAllPopups();
                setActiveSection('addQuestion');
              }}
            >
              Dodaj pytanie
            </button>
          )}

          {questions.length > 0 ? (
            <div className={styles.questionsList}>
              {questions.map((question) => {
                let { content } = question;
                let imageUrl = '';

                const imageTagIndex = content.indexOf('[Image]:');
                if (imageTagIndex !== -1) {
                  imageUrl = content.slice(imageTagIndex + '[Image]:'.length).trim();
                  content = content.slice(0, imageTagIndex).trim();
                }

                return (
                  <div key={question.id} className={styles.questionItem}>
                    <h4>{content}</h4>
                    {imageUrl && <img src={imageUrl} alt="Question image" style={{ maxWidth: '200px', height: 'auto' }} />}

                    {isOwner && (
                      <div className={styles.questionActions}>
                        <button className={styles.buttonAdd} onClick={() => handleAddAnswerClick(question.id)}>Dodaj odpowiedź</button>
                        <button className={styles.buttonEdit} onClick={() => handleEditQuestionClick(question.id)}><FaEdit /> Edytuj pytanie</button>
                        <button className={styles.buttonDelete} onClick={() => handleDeleteQuestionClick(question.id)}><FaTrash /> Usuń pytanie</button>
                      </div>
                    )}

                    <div className={styles.answersList}>
                      {question.answers && question.answers.length > 0 ? (
                        question.answers.map((answer) => (
                          <div
                            key={answer.id}
                            className={`${styles.answerItem} ${answer.isTrue ? styles.answerCorrect : styles.answerIncorrect}`}
                          >
                            <p>{answer.content}</p>
                            {isOwner && (
                              <div className={styles.answerActions}>
                                <button className={styles.buttonEdit} onClick={() => handleEditAnswerClick(answer)}><FaEdit /> Edytuj</button>
                                <button className={styles.buttonDelete} onClick={() => handleDeleteAnswerClick(answer.id)}><FaTrash /> Usuń</button>
                              </div>
                            )}
                          </div>
                        ))
                      ) : (
                        <p>Brak odpowiedzi</p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p>Brak pytań</p>
          )}
          {showConfirmPopup && (
            <div className={styles.popup}>
              <button className={styles.popupClose} onClick={() => setShowConfirmPopup(false)}>X</button>
              <p>{confirmPopupContent}</p>
              <button onClick={() => { onConfirm(); }}>Potwierdź</button>
              <button onClick={() => setShowConfirmPopup(false)}>Anuluj</button>
            </div>
          )}

          {showAddAnswer && (
            <div className={styles.popup}>
              <button className={styles.popupClose} onClick={() => {
                setShowAddAnswer(false);
                setSelectedQuestionId(null);
              }}>X</button>
              <AddAnswer
                questionId={selectedQuestionId}
                questionContent={questions.find(q => q.id === selectedQuestionId)?.content || ''}
                onAnswerAdded={handleAnswerAdded} />
            </div>
          )}

          {activeSection === 'addQuestion' && (
            <div className={styles.popup}>
              <button className={styles.popupClose} onClick={handleSidebarClose}>X</button>
              <AddQuestion setId={id} onQuestionAdded={handleQuestionAdded} />
            </div>
          )}

          {editQuestionId && (
            <div className={styles.popup}>
              <button className={styles.popupClose} onClick={() => {
                setEditQuestionId(null);
                closeAllPopups();
              }}>X</button>
              <EditQuestion
                questionId={editQuestionId}
                onClose={() => {
                  setEditQuestionId(null);
                  closeAllPopups();
                }}
                onEditComplete={handleEditComplete}
              />
            </div>
          )}

          {editAnswerId && (
            <div className={styles.popup}>
              <button className={styles.popupClose} onClick={() => {
                setEditAnswerId(null);
                closeAllPopups();
              }}>X</button>
              <EditAnswer
                answerId={editAnswerId}
                onClose={() => {
                  setEditAnswerId(null);
                  closeAllPopups();
                }}
                onAnswerEdited={handleAnswerEdited}
              />
            </div>
          )}

          {activeSection === 'manageSet' && (
            <div className={styles.popup}>
              <button className={styles.popupClose} onClick={handleSidebarClose}>X</button>
              <ManageSet
                setId={id}
                initialName={set?.name || ''}
                initialPrivacy={set?.isPublic || true}
                onClose={handleSidebarClose}
                onUpdate={(updatedSet) => setSet(updatedSet)}
                onSetUpdated={handleSetUpdated}
              />
            </div>
          )}

          {activeSection === 'addCollaborator' && (
            <div className={styles.popup}>
              <button className={styles.popupClose} onClick={() => {
                closeAllPopups();
                setActiveSection('');
              }}>X</button>
              <AddCollaborator
                setId={id}
                onClose={() => {
                  closeAllPopups();
                  setActiveSection('');
                }}
                onCollaboratorAdded={handleCollaboratorAdded}
              />
            </div>
          )}

          {activeSection === 'deleteSet' && (
            <div className={styles.popup}>
              <button className={styles.popupClose} onClick={handleSidebarClose}>X</button>
              <DeleteSet
                setId={id}
                onClose={handleSidebarClose}
                onSetDeleted={handleSetDeleted}
              />
            </div>
          )}

          {activeSection === 'manageCollaborators' && (
            <div className={styles.popup}>
              <button className={styles.popupClose} onClick={() => {
                closeAllPopups();
                setActiveSection('');
              }}>X</button>
              <CollaboratorsList
                setId={id}
                onClose={() => {
                  closeAllPopups();
                  setActiveSection('');
                }}
              />
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default EditPageSet;
