import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from './Navbar';
import SetSidebar from './SetSidebar';
import styles from '../styles/PageSet.module.css';
import AddQuestion from './AddQuestion';
import AddAnswer from './AddAnswer';
import EditQuestion from './EditQuestion';
import EditAnswer from './EditAnswer';
import { FaEdit, FaTrash } from 'react-icons/fa';

const PageSet = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [set, setSet] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [activeSection, setActiveSection] = useState('');
  const [showAddQuestion, setShowAddQuestion] = useState(false);
  const [showAddAnswer, setShowAddAnswer] = useState(false);
  const [showEditQuestion, setShowEditQuestion] = useState(false);
  const [showEditAnswer, setShowEditAnswer] = useState(false);
  const [selectedQuestionId, setSelectedQuestionId] = useState(null);
  const [editQuestionId, setEditQuestionId] = useState(null);
  const [editAnswerId, setEditAnswerId] = useState(null);

  useEffect(() => {
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

    fetchSet();
    fetchQuestions();
  }, [id]);

  const handleAddQuestionClick = () => {
    setActiveSection('addQuestion');
    setShowAddQuestion(true);
  };

  const handleAddAnswerClick = (questionId) => {
    setSelectedQuestionId(questionId);
    setShowAddAnswer(true);
  };

  const handleEditQuestionClick = (questionId) => {
    setEditQuestionId(questionId);
    setShowEditQuestion(true);
  };

  const handleEditAnswerClick = (answer) => {
    setEditAnswerId(answer.id);
    setShowEditAnswer(true);
  };

  const handleDeleteAnswerClick = async (answerId) => {
    try {
      const response = await fetch(`/api/answers/delete/${answerId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (response.ok) {
        alert('Odpowiedź została usunięta.');
        await refreshQuestions();
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Nie udało się usunąć odpowiedzi.');
      }
    } catch (err) {
      setError('Wystąpił błąd podczas usuwania odpowiedzi.');
    }
  };

  const handleQuestionAdded = async (questionId) => {
    setShowAddQuestion(false);
    setSelectedQuestionId(questionId);
    setShowAddAnswer(true);
    setSuccessMessage('Pytanie zostało dodane pomyślnie!');
    await refreshQuestions();
  };

  const handleAnswerAdded = async () => {
    setShowAddAnswer(false);
    setSuccessMessage('Odpowiedź została dodana pomyślnie!');
    await refreshQuestions();
  };

  const handleAnswerEdited = async () => {
    setShowEditAnswer(false);
    setSuccessMessage('Odpowiedź została edytowana pomyślnie!');
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
        const errorData = await response.json();
        setError(errorData.message || 'Nie udało się pobrać pytań.');
      }
    } catch (err) {
      setError('Wystąpił błąd podczas pobierania pytań.');
    }
  };

  const handleSidebarClick = (section) => {
    setActiveSection(section);
    if (section === 'addQuestion') {
      setShowAddQuestion(true);
    } else {
      setShowAddQuestion(false);
    }
  };

  const handleSidebarClose = () => {
    setActiveSection('');
    setShowAddQuestion(false);
    setShowAddAnswer(false);
    setShowEditQuestion(false);
    setShowEditAnswer(false);
    setSuccessMessage('');
  };

  return (
    <div className={styles.appContainer}>
      <Navbar />
      <div className={styles.mainContent}>
        <SetSidebar  
          onSectionClick={handleSidebarClick} 
          activeSection={activeSection} 
          setName={set?.name || 'Loading...'}
          onClose={handleSidebarClose}
        />
        <div className={styles.content}>
          {activeSection === '' ? (
            <div>
              {error && <div className={`${styles.alert} ${styles.alertDanger}`}>{error}</div>}
              {questions.length > 0 ? (
                <div className={styles.questionsList}>
                  {questions.map((question) => (
                    <div key={question.id} className={styles.questionItem}>
                      <h4>{question.content}</h4>
                      <button className={styles.buttonAdd} onClick={() => handleAddAnswerClick(question.id)}>Dodaj odpowiedź</button>
                      <button className={styles.buttonEdit} onClick={() => handleEditQuestionClick(question.id)}><FaEdit /> Edytuj pytanie</button>
                      <div className={styles.answersList}>
                        {question.answers && question.answers.length > 0 ? (
                          question.answers.map((answer) => (
                            <div key={answer.id} className={styles.answerItem}>
                              <p>{answer.content}</p>
                              <button className={styles.buttonEdit} onClick={() => handleEditAnswerClick(answer)}><FaEdit /> Edytuj</button>
                              <button className={styles.buttonDelete} onClick={() => handleDeleteAnswerClick(answer.id)}><FaTrash /> Usuń</button>
                            </div>
                          ))
                        ) : (
                          <p>Brak odpowiedzi</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p>Brak pytań</p>
              )}
              {showAddAnswer && (
                <div className={styles.popup}>
                  <button className={styles.popupClose} onClick={() => setShowAddAnswer(false)}>X</button>
                  <AddAnswer questionId={selectedQuestionId} onAnswerAdded={handleAnswerAdded} />
                </div>
              )}
            </div>
          ) : activeSection === 'addQuestion' ? (
            <div className={styles.popup}>
              <button className={styles.popupClose} onClick={handleSidebarClose}>X</button>
              <AddQuestion setId={id} onQuestionAdded={handleQuestionAdded} />
            </div>
          ) : null}
          {showEditQuestion && (
            <div className={styles.popup}>
              <button className={styles.popupClose} onClick={() => setShowEditQuestion(false)}>X</button>
              <EditQuestion 
                questionId={editQuestionId} 
                onClose={() => setShowEditQuestion(false)} 
              />
            </div>
          )}
          {showEditAnswer && (
            <div className={styles.popup}>
              <button className={styles.popupClose} onClick={() => setShowEditAnswer(false)}>X</button>
              <EditAnswer 
                answerId={editAnswerId} 
                onClose={() => setShowEditAnswer(false)} 
                onAnswerEdited={handleAnswerEdited} 
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PageSet;
