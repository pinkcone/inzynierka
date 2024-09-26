const Flashcards = require('../models/Flashcards');
const Question = require('../models/Question');


const createFlashcardsForSet = async (req, res) => {
  const { setId } = req.params;
  const userId = req.user.id;

  try {
    console.log('setId:', setId);

    const questions = await Question.findAll({ where: { setId } });

    if (!questions.length) {
      return res.status(404).json({ message: 'Brak pytań w zestawie.' });
    }

    const flashcards = await Promise.all(questions.map(async (question) => {
      return await Flashcards.create({
        questionId: question.id,
        userId: userId,
        setId: setId
      });
    }));

    res.status(201).json(flashcards);
  } catch (error) {
    console.error('Błąd podczas tworzenia fiszek:', error);
    res.status(500).json({ message: 'Błąd serwera', error: error.message });
  }
};


const getFlashcardsBySet = async (req, res) => {
  try {
    const { setId } = req.params;
    const userId = req.user.id;

    console.log("Pobieranie fiszek dla userId:", userId, "i setId:", setId);

    const flashcards = await Flashcards.findAll({
      where: {
        setId,
        userId
      }
    });

    if (!flashcards.length) {
      return res.status(404).json({ message: 'Brak fiszek w tym zestawie dla tego użytkownika.' });
    }

    res.status(200).json(flashcards);
  } catch (error) {
    console.error('Błąd podczas pobierania fiszek:', error);
    res.status(500).json({ message: 'Błąd podczas pobierania fiszek.', error: error.message });
  }
};

module.exports = {
  getFlashcardsBySet,
  createFlashcardsForSet
};
