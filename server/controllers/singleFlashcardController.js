const SingleFlashcard = require('../models/SingleFlashcard');


const updateLearningState = async (req, res) => {
  try {
    const { flashcardId } = req.params;
    const { evaluation } = req.body; 

    const learningState = await SingleFlashcard.findOne({ where: { flashcardId } });

    if (!learningState) {
      return res.status(404).json({ message: 'Brak stanu nauki dla tej fiszki.' });
    }


    if (evaluation === 1) {
      learningState.streak += 1;
      learningState.currentLevel = Math.min(learningState.currentLevel + 1, 7); 
    } else if (evaluation === -1) {
      learningState.streak = 0; 
      learningState.currentLevel = Math.max(learningState.currentLevel - 1, 1); 
    } else if (evaluation === 0) {

      if (learningState.lastEvaluation === 1) {
        learningState.currentLevel = Math.max(learningState.currentLevel - 1, 1);
      } else if (learningState.lastEvaluation === -1) {
        learningState.currentLevel = Math.min(learningState.currentLevel + 1, 7);
      }
    }

    learningState.lastEvaluation = evaluation;
    learningState.lastReviewed = new Date();

    await learningState.save();

    res.status(200).json(learningState);
  } catch (error) {
    res.status(500).json({ message: 'Błąd podczas aktualizacji stanu nauki.', error: error.message });
  }
};

const getLearningState = async (req, res) => {
  try {
    const { flashcardId } = req.params;

    const learningState = await SingleFlashcard.findOne({ where: { flashcardId } });

    if (!learningState) {
      return res.status(404).json({ message: 'Brak stanu nauki dla tej fiszki.' });
    }

    res.status(200).json(learningState);
  } catch (error) {
    res.status(500).json({ message: 'Błąd podczas pobierania stanu nauki.', error: error.message });
  }
};

module.exports = {
  updateLearningState,
  getLearningState
};
