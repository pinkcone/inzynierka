const Flashcards = require('../models/Flashcards');
const Question = require('../models/Question');
const Answer = require('../models/Answer');
const { Op } = require('sequelize');
const sequelize = require('../config/sequelize');
const Set = require('../models/Set');

// Tworzenie fiszek na podstawie zestawu pytań i użytkownika
const createFlashcardsForSet = async (req, res) => {
  const { setId } = req.params;
  const userId = req.user.id;

  try {
    console.log('Tworzenie fiszek dla userId:', userId, 'i setId:', setId);

    // Pobieramy wszystkie pytania dla danego zestawu (setId)
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
    // Tworzymy fiszki lub sprawdzamy, czy już istnieją
    const flashcards = await Promise.all(
      filteredQuestions.map(async (question) => {
        // Sprawdzamy, czy fiszka już istnieje dla danego użytkownika, pytania i zestawu
        let flashcard = await Flashcards.findOne({
          where: {
            questionId: question.id,
            userId: userId,
            setId: setId,
          },
        });

        // Jeśli nie istnieje, tworzymy nową fiszkę
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

    // Zwracamy stworzone fiszki
    res.status(201).json(flashcards);
  } catch (error) {
    console.error('Błąd podczas tworzenia fiszek:', error);
    res.status(500).json({ message: 'Błąd serwera', error: error.message });
  }
};

// Pobieranie fiszek z konkretnego zestawu dla danego użytkownika
const getFlashcardsBySet = async (req, res) => {
  try {
    const { setId } = req.params;
    const userId = req.user.id;

    console.log('Pobieranie fiszek dla userId:', userId, 'i setId:', setId);

    // Pobieramy fiszki na podstawie setId i userId
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
  const { currentLevel, streak, lastReviewed, lastEvaluation } = req.body;  // Przyjmujemy obliczone wartości z frontendu

  try {
    // Pobranie danych fiszki na podstawie flashcardId
    const flashcard = await Flashcards.findOne({ where: { id: flashcardId } });

    if (!flashcard) {
      return res.status(404).json({ message: 'Fiszka nie została znaleziona.' });
    }

    // Aktualizujemy fiszkę na podstawie otrzymanych wartości z frontendu
    flashcard.currentLevel = currentLevel;
    flashcard.streak = streak;
    flashcard.lastReviewed = new Date(lastReviewed);  // Ustawiamy datę przeglądu
    flashcard.lastEvaluation = lastEvaluation;        // Ustawiamy nową ocenę

    // Zapisujemy zaktualizowaną fiszkę
    await flashcard.save();

    res.status(200).json(flashcard); // Zwracamy zaktualizowaną fiszkę
  } catch (error) {
    console.error('Błąd podczas aktualizacji fiszki:', error);
    res.status(500).json({ message: 'Błąd podczas aktualizacji fiszki.', error: error.message });
  }
};

const getUserFlashcardSets = async (req, res) => {
  try {
    const userId = req.user.id;

    console.log('Fetching flashcard sets for userId:', userId);

    // Query to find all sets that have flashcards for the user
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

    // Map the results to the desired format
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

    console.log('Resetting flashcards for userId:', userId, 'and setId:', setId);

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
    console.error('Błąd podczas resetowania fiszek:', error);
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
