const Quiz = require('../models/Quiz'); // Import modeli
const Set = require('../models/Set');
const User = require('../models/User'); 
const Question = require('../models/Question');

// Dodanie nowego quizu wraz z pytaniami
const addQuiz = async (req, res) => {
  try {
    const { name, time, questionTime, isPublic, userId, setId, questionsIds } = req.body;

    // Walidacja wymaganych danych
    if (!name || !time || !questionTime || !userId || !setId || !Array.isArray(questionsIds)) {
      return res.status(400).json({ message: 'Brak wymaganych danych lub nieprawidłowa struktura questionsIds!' });
    }

    // Sprawdzenie, czy użytkownik i zestaw istnieją
    const user = await User.findByPk(userId);
    const set = await Set.findByPk(setId);
    if (!user || !set) {
      return res.status(404).json({ message: 'Nie znaleziono użytkownika lub zestawu!' });
    }

    // Sprawdzenie, czy pytania istnieją i należą do zestawu
    const questions = await Question.findAll({
      where: { id: questionsIds, setId },
    });

    if (questions.length !== questionsIds.length) {
      return res.status(400).json({ message: 'Niektóre pytania nie istnieją lub nie należą do wybranego zestawu!' });
    }

    // Tworzenie quizu
    const quiz = await Quiz.create({
      name,
      time,
      questionTime,
      isPublic,
      userId,
      setId,
    });

    // Przypisanie pytań do quizu (poprzez tabelę pośrednią QuizQuestions)
    await quiz.addQuestions(questions);

    return res.status(201).json({
      message: 'Quiz dodany pomyślnie wraz z pytaniami!',
      quiz,
      assignedQuestions: questions.map((q) => q.id),
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Błąd serwera!', error: error.message });
  }
};
const deleteQuiz = async (req, res) => {
    try {
      const { id } = req.params;
  
      // Sprawdzenie, czy quiz istnieje
      const quiz = await Quiz.findByPk(id);
      if (!quiz) {
        return res.status(404).json({ message: 'Nie znaleziono quizu!' });
      }
  
      // Usuwanie quizu
      await quiz.destroy();
      return res.status(200).json({ message: 'Quiz usunięty pomyślnie!' });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: 'Błąd serwera!', error: error.message });
    }
  };
  

  const getAllQuizzes = async (req, res) => {
    try {
      // Pobranie quizów z powiązanym zestawem
      const quizzes = await Quiz.findAll({
        attributes: ['id', 'name', 'questionTime'], // Tylko potrzebne kolumny
        include: {
          model: Set,
          attributes: ['id', 'name'], // Pobieramy tylko ID i nazwę zestawu
        },
      });
  
      return res.status(200).json({ quizzes });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: 'Błąd serwera!', error: error.message });
    }
  };
  
  module.exports = {
    addQuiz,
    deleteQuiz,
    getAllQuizzes, // Eksport nowej funkcji
  };
