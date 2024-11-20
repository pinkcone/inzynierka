import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import Navbar from '../Navbar/Navbar';
import SetSidebar from '../Sidebar/SetSidebar';
import styles from '../../styles/PageSet.module.css';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode'; 
import CreateTest from '../Test/CreateTest';
import ReportForm from '../Report/ReportForm';
import CreateQuiz from "../Quiz/CreateQuiz";

const PageSet = () => {
  const { id } = useParams();
  const [set, setSet] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const [isOwner, setIsOwner] = useState(false); 
  const [activeSection, setActiveSection] = useState(''); 

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

          const token = localStorage.getItem('token');
          const decodedToken = jwtDecode(token);
          const userId = decodedToken.userId || decodedToken.id || decodedToken.sub;

          if (userId.toString() === data.ownerId.toString()) {
            setIsOwner(true); 
          } else {
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

    fetchSet();
    fetchQuestions();
  }, [id]); 

  const handleEditSetClick = () => {
    navigate(`/editset/${id}`); 
  };

  const handleSectionClick = (section) => {
    setActiveSection(section); 
  };

  const handleClosePopup = () => {
    setActiveSection(''); 
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
          setName={set?.name || 'Loading...'}
          setId={id}
          onSectionClick={handleSectionClick}
          isOwner={isOwner} 
          isEditing={false} 
          handleStartFlashcards={handleStartFlashcards} 
        />

        <div className={styles.content}>
          {error && <div className={`${styles.alert} ${styles.alertDanger}`}>{error}</div>}
          
          {isOwner && (
            <div className={styles.editSetButtonContainer}>
              <button className={styles.crudbutton} onClick={handleEditSetClick}>
                EDYTUJ ZESTAW
              </button>
            </div>
          )}

          {activeSection === 'createTest' && (
            <div className={styles.popup}>
              <CreateTest setId={id} onClose={handleClosePopup} /> 
            </div>
          )}

          {activeSection === 'createQuiz' && (
              <div className={styles.popup}>
                <CreateQuiz setId={id} onClose={handleClosePopup} />
              </div>
          )}

          {activeSection === 'reportSet' && (
            <div className={styles.popup}>
              <ReportForm setId={id} onClose={handleClosePopup} />
            </div>
          )}

          {questions.length > 0 ? (
            <div className={styles.questionsList}>
              {questions.map((question) => (
                <div key={question.id} className={styles.questionItem}>
                  <h4>{question.content}</h4>
                  <div className={styles.answersList}>
                    {question.answers && question.answers.length > 0 ? (
                      question.answers.map((answer) => (
                        <div key={answer.id} className={styles.answerItem}>
                          <p>{answer.content}</p>
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
        </div>
      </div>
    </div>
  );
};

export default PageSet;