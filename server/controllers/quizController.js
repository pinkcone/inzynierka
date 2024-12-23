const Quiz = require('../models/Quiz');
const Set = require('../models/Set');
const User = require('../models/User'); 
const Question = require('../models/Question');

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
    if (!name || !questionTime || !userId || !setId || !Array.isArray(questionsIds)) {
      return res.status(400).json({
        message: 'Brak wymaganych danych lub nieprawidłowa struktura questionsIds!',
      });
    }

    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ message: 'Nie znaleziono użytkownika!' });
    }

    const set = await Set.findByPk(setId);
    if (!set) {
      return res.status(404).json({ message: 'Nie znaleziono zestawu!' });
    }

    const questions = await Question.findAll({
      where: { id: questionsIds},
    });

    if (questions.length !== questionsIds.length) {
      return res.status(400).json({
        message: 'Niektóre pytania nie istnieją lub nie należą do wybranego zestawu!',
      });
    }
    const quiz = await Quiz.create({
      name,
      questionTime,
      isPublic,
      userId,
      setId,
    });
    await quiz.addQuestions(questions);

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

      const quiz = await Quiz.findByPk(id);
      if (!quiz) {
        return res.status(404).json({ message: 'Nie znaleziono quizu!' });
      }

      await quiz.destroy();
      return res.status(200).json({ message: 'Quiz usunięty pomyślnie!' });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: 'Błąd serwera!', error: error.message });
    }
  };
  

  const getAllQuizzes = async (req, res) => {
   const userId = req.user.id; 
    try {
      const quizzes = await Quiz.findAll({
        attributes: ['id', 'name', 'questionTime'], 
        where: { userId }, 
        include: {
          model: Set,
          attributes: ['id', 'name'],
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
      const quiz = await Quiz.findByPk(quizId);
      if (!quiz) {
        return res.status(404).json({ message: 'Quiz nie został znaleziony.' });
      }
      
      if(!quiz.userId == userId) return res.status(404).json({ message: 'Nie jestes wlascicielem tego quizu!!' });
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
    startQuiz,
  };
