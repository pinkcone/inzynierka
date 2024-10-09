const Flashcards = require('../models/Flashcards');
const Question = require('../models/Question');

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

    // Tworzymy fiszki lub sprawdzamy, czy już istnieją
    const flashcards = await Promise.all(
      questions.map(async (question) => {
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
module.exports = {
  createFlashcardsForSet,
  getFlashcardsBySet,
  updateFlashcardByUserRate,
};
