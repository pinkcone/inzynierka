const Quiz = require('../models/Quiz'); // Import modeli
const Set = require('../models/Set');
const User = require('../models/User'); 
const Question = require('../models/Question');

// Dodanie nowego quizu wraz z pytaniami
const addQuiz = async (req, res) => {
  try {
    const { name, questionTime, isPublic, setId, questionsIds } = req.body;
    const userId = req.user.id;
    console.log("name: ", name);
    console.log("q-time: ", questionTime);
    console.log("isPublic: ", isPublic);
    console.log("user: ", userId);
    console.log("set: ", setId);
    console.log("questionids: ", questionsIds);
    // Walidacja danych wejściowych
    if (!name || !questionTime || !userId || !setId || !Array.isArray(questionsIds)) {
      console.log("puste dane chuju");
      return res.status(400).json({
        message: 'Brak wymaganych danych lub nieprawidłowa struktura questionsIds!',
      });
    }

    // Sprawdzenie, czy użytkownik istnieje
    const user = await User.findByPk(userId);
    if (!user) {
      console.log("gdzie kurwa, nie istniejesz!");
      return res.status(404).json({ message: 'Nie znaleziono użytkownika!' });
    }

    // Sprawdzenie, czy zestaw istnieje
    const set = await Set.findByPk(setId);
    if (!set) {
      console.log("gdzie kurwa, zestaw nie istnieje!!!!!!!");
      return res.status(404).json({ message: 'Nie znaleziono zestawu!' });
    }

    // Sprawdzenie, czy pytania istnieją i należą do zestawu
    const questions = await Question.findAll({
      where: { id: questionsIds},
    });

    if (questions.length !== questionsIds.length) {
      console.log("w chuja lecisz z id pytan smieciu");
      return res.status(400).json({
        message: 'Niektóre pytania nie istnieją lub nie należą do wybranego zestawu!',
      });
    }
    console.log("tworze quiz lamusie");
    // Tworzenie quizu
    const quiz = await Quiz.create({
      name,
      questionTime,
      isPublic,
      userId,
      setId,
    });
    console.log("dodaje pytanka smieciu");
    // Przypisanie pytań do quizu (poprzez tabelę pośrednią QuizQuestions)
    await quiz.addQuestions(questions);

    // Zwrot danych quizu i przypisanych pytań
    return res.status(201).json({
      message: 'Quiz dodany pomyślnie wraz z pytaniami!',
      quiz,
      assignedQuestions: questions.map((q) => q.id),
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: 'Błąd serwera!',
      error: error.message,
    });
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

      console.log("Znalezione quizy:", quizzes);
      return res.status(200).json({ quizzes });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: 'Błąd serwera!', error: error.message });
    }
  };
  const startQuiz = async (req, res) => {
    try {
      const { quizId } = req.body;
      const userId = req.user.id;
      // Sprawdź, czy quiz istnieje i czy użytkownik ma do niego dostęp
      const quiz = await Quiz.findByPk(quizId);
      if (!quiz) {
        return res.status(404).json({ message: 'Quiz nie został znaleziony.' });
      }
      
      if(!quiz.userId == userId) return res.status(404).json({ message: 'Nie jestes wlascicielem tego quizu!!' });
      // Zwróć pozytywną odpowiedź
      res.status(200).json({ message: 'Quiz może zostać rozpoczęty.' });
    } catch (error) {
      console.error('Błąd podczas rozpoczynania quizu:', error);
      res.status(500).json({ message: 'Błąd serwera podczas rozpoczynania quizu.' });
    }
  };
  module.exports = {
    addQuiz,
    deleteQuiz,
    getAllQuizzes,
    startQuiz, // Eksport nowej funkcji
  };
