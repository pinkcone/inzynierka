const Flashcards = require('../models/Flashcards');
const Question = require('../models/Question');
const Answer = require('../models/Answer');
const { Op } = require('sequelize');
const sequelize = require('../config/sequelize');
const Set = require('../models/Set');

const createFlashcardsForSet = async (req, res) => {
  const { setId } = req.params;
  const userId = req.user.id;

  try {
    console.log('Tworzenie fiszek dla userId:', userId, 'i setId:', setId);

    const questions = await Question.findAll({ where: { setId } });

    if (!questions.length) {
      return res.status(404).json({ message: 'Brak pytań w zestawie.' });
    }
    const filteredQuestions = [];
    for (const question of questions) {
      const trueAnswersCount = await Answer.count({
        where: {
          questionId: question.id,
          isTrue: true,
        },
      });

      if (trueAnswersCount > 0) {
        filteredQuestions.push(question);
      } else {
        console.log(
          `Pomijamy pytanie ${question.id}, brak poprawnych odpowiedzi.`
        );
      }
    }

    if (!filteredQuestions.length) {
      return res.status(404).json({
        error: 'Brak pytań w zestawie z poprawnymi odpowiedziami.',
      });
    }

    const flashcards = await Promise.all(
        filteredQuestions.map(async (question) => {
          let flashcard = await Flashcards.findOne({
          where: {
            questionId: question.id,
            userId: userId,
            setId: setId,
          },
        });

        if (!flashcard) {
          flashcard = await Flashcards.create({
            questionId: question.id,
            userId: userId,
            setId: setId,
          });
        }

        return flashcard;
      })
    );

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

    console.log('Pobieranie fiszek dla userId:', userId, 'i setId:', setId);

    const flashcards = await Flashcards.findAll({
      where: {
        setId,
        userId,
      },
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
const updateFlashcardByUserRate = async (req, res) => {
  const { flashcardId } = req.params;
  const { currentLevel, streak, lastReviewed, lastEvaluation } = req.body;

  try {
    const flashcard = await Flashcards.findOne({ where: { id: flashcardId } });

    if (!flashcard) {
      return res.status(404).json({ message: 'Fiszka nie została znaleziona.' });
    }

    flashcard.currentLevel = currentLevel;
    flashcard.streak = streak;
    flashcard.lastReviewed = new Date(lastReviewed);
    flashcard.lastEvaluation = lastEvaluation;

    await flashcard.save();

    res.status(200).json(flashcard);
  } catch (error) {
    console.error('Błąd podczas aktualizacji fiszki:', error);
    res.status(500).json({ message: 'Błąd podczas aktualizacji fiszki.', error: error.message });
  }
};

const getUserFlashcardSets = async (req, res) => {
  try {
    const userId = req.user.id;

    console.log('Fetching flashcard sets for userId:', userId);

    const sets = await Flashcards.findAll({
      where: { userId },
      attributes: [
        'setId',
        [sequelize.fn('COUNT', sequelize.col('Flashcards.id')), 'flashcardsNumber']
      ],
      include: [
        {
          model: Set,
          attributes: ['name']
        }
      ],
      group: ['Flashcards.setId', 'Set.id']
    });

    if (!sets.length) {
      return res.status(404).json({ message: 'No flashcards found for this user.' });
    }

    const result = sets.map(flashcard => ({
      setId: flashcard.setId,
      setName: flashcard.Set.name,
      flashcardsNumber: flashcard.get('flashcardsNumber')
    }));

    res.status(200).json(result);
  } catch (error) {
    console.error('Error fetching flashcard sets:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
const deleteFlashcardsBySet = async (req, res) => {
  try {
    const { setId } = req.params;
    const userId = req.user.id;

    console.log('Deleting flashcards for userId:', userId, 'and setId:', setId);

    const deletedCount = await Flashcards.destroy({
      where: {
        setId,
        userId,
      },
    });
    if (deletedCount === 0) {
      return res.status(404).json({ message: 'Brak fiszek do usunięcia dla tego użytkownika i zestawu.' });
    }

    res.status(200).json({ message: 'Fiszki zostały pomyślnie usunięte.', deletedCount });
  } catch (error) {
    console.error('Błąd podczas usuwania fiszek:', error);
    res.status(500).json({ message: 'Błąd serwera podczas usuwania fiszek.', error: error.message });
  }
};

const resetFlashcardsBySet = async (req, res) => {
  try {
    const { setId } = req.params;
    const userId = req.user.id;

    const [updatedCount] = await Flashcards.update(
      {
        currentLevel: 4,
        lastEvaluation: 0,
        streak: 0,
        lastReviewed: null,
      },
      {
        where: {
          setId,
          userId,
        },
      }
    );

    if (updatedCount === 0) {
      return res.status(404).json({ message: 'Brak fiszek do zresetowania dla tego użytkownika i zestawu.' });
    }

    res.status(200).json({ message: 'Postęp fiszek został pomyślnie zresetowany.', updatedCount });
  } catch (error) {
    res.status(500).json({ message: 'Błąd serwera podczas resetowania fiszek.', error: error.message });
  }
};
module.exports = {
  createFlashcardsForSet,
  getFlashcardsBySet,
  updateFlashcardByUserRate,
  getUserFlashcardSets,
  deleteFlashcardsBySet,
  resetFlashcardsBySet,
};
