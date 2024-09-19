import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from './Navbar';
import SetSidebar from './SetSidebar';
import '../styles/PageSet.css';
import AddQuestion from './AddQuestion';
import AddAnswer from './AddAnswer';
import { FaEdit, FaTrash } from 'react-icons/fa'; // Ikony do edycji i usuwania

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
  const [selectedQuestionId, setSelectedQuestionId] = useState(null);

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
          
          // Fetch answers for each question
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
                console.error(`Error fetching answers for question ${question.id}:`, err);
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
    setShowAddAnswer(false);
  };

  const handleAddAnswerClick = (questionId) => {
    setSelectedQuestionId(questionId);
    setActiveSection('addAnswer');
    setShowAddAnswer(true);
  };

  const handleEditQuestionClick = (questionId) => {
    navigate(`/edit-question/${questionId}`);
  };

  const handleEditAnswerClick = (answerId) => {
    navigate(`/edit-answer/${answerId}`);
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
    setActiveSection('addAnswer');
    setSuccessMessage('Pytanie zostało dodane pomyślnie!');
    await refreshQuestions();
  };

  const handleAnswerAdded = async () => {
    setShowAddAnswer(false);
    setSuccessMessage('Odpowiedź została dodana pomyślnie!');
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
              console.error(`Error fetching answers for question ${question.id}:`, err);
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
      setShowAddAnswer(false);
    } else if (section === 'manage' || section === 'addCollaborator' || section === 'deleteSet') {
      setShowAddQuestion(false);
      setShowAddAnswer(false);
    }
  };

  const handleSidebarClose = () => {
    setActiveSection('');
    setShowAddQuestion(false);
    setShowAddAnswer(false);
    setSuccessMessage('');
  };

  return (
    <div className="app-container">
      <Navbar />
      <div className="main-content">
        <SetSidebar 
          onSectionClick={handleSidebarClick} 
          activeSection={activeSection} 
          setName={set?.name || 'Loading...'}
          onClose={handleSidebarClose}
        />
        <div className="content">
          {activeSection === '' ? (
            <div>
              {error && <div className="alert alert-danger">{error}</div>}
              {questions.length > 0 ? (
                <div className="questions-list">
                  {questions.map((question) => (
                    <div key={question.id} className="question-item">
                      <h4>{question.content}</h4>
                      <button onClick={() => handleAddAnswerClick(question.id)}>Dodaj odpowiedź</button>
                      <button onClick={() => handleEditQuestionClick(question.id)}><FaEdit /> Edytuj pytanie</button>
                      <div className="answers-list">
                        {question.answers && question.answers.length > 0 ? (
                          question.answers.map((answer) => (
                            <div key={answer.id} className="answer-item">
                              <p>{answer.content}</p>
                              <button onClick={() => handleEditAnswerClick(answer.id)}><FaEdit /> Edytuj</button>
                              <button onClick={() => handleDeleteAnswerClick(answer.id)}><FaTrash /> Usuń</button>
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
              {showAddAnswer && <AddAnswer questionId={selectedQuestionId} onAnswerAdded={handleAnswerAdded} />}
            </div>
          ) : activeSection === 'addQuestion' ? (
            <div className="popup">
              <button className="popup-close" onClick={handleSidebarClose}>X</button>
              <AddQuestion setId={id} onQuestionAdded={handleQuestionAdded} />
              {successMessage && <div className="alert alert-success">{successMessage}</div>}
            </div>
          ) : activeSection === 'addAnswer' ? (
            <div className="popup">
              <button className="popup-close" onClick={handleSidebarClose}>X</button>
              <AddAnswer questionId={selectedQuestionId} onAnswerAdded={handleAnswerAdded} />
            </div>
          ) : activeSection === 'manage' ? (
            <div className="popup">
              <button className="popup-close" onClick={handleSidebarClose}>X</button>
              <h4>Zarządzaj prywatnością</h4>
              <p><strong>Publiczny:</strong> {set.isPublic ? 'Tak' : 'Nie'}</p>
            </div>
          ) : activeSection === 'addCollaborator' ? (
            <div className="popup">
              <button className="popup-close" onClick={handleSidebarClose}>X</button>
              <h4>Dodaj współtwórcę</h4>
            </div>
          ) : activeSection === 'deleteSet' ? (
            <div className="popup">
              <button className="popup-close" onClick={handleSidebarClose}>X</button>
              <h4>Usuń zestaw</h4>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default PageSet;
