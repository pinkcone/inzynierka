const Answer = require('../models/Answer');
const Question = require('../models/Question');
const Set = require('../models/Set');
const { updateQuestionType } = require('./questionController');
const { Sequelize } = require('sequelize');

const addAnswer = async (req, res) => {
  try {
    const { questionId, content, isTrue } = req.body;
    const userId = req.user.id;

    const question = await Question.findByPk(questionId);
    if (!question) {
      return res.status(404).json({ message: 'Pytanie nie zostało znalezione.' });
    }

    const set = await Set.findOne({
      where: {
        id: question.setId,
        [Sequelize.Op.or]: [
          { ownerId: userId },
          Sequelize.literal(`JSON_CONTAINS_PATH(collaboratorsList, 'one', '$."${userId}"')`),
        ],
      },
    });
    if (!set) {
      return res.status(403).json({ message: 'Brak uprawnień do dodawania odpowiedzi.' });
    }

    const newAnswer = await Answer.create({
      content,
      isTrue,
      questionId
    });
    updateQuestionType(question.id);
    res.status(201).json(newAnswer);
  } catch (error) {
    res.status(500).json({ message: 'Błąd podczas dodawania odpowiedzi.', error: error.message });
  }
};


const editAnswer = async (req, res) => {
  try {
    const { id } = req.params;
    const { content, isTrue } = req.body;
    const userId = req.user.id;

    const answer = await Answer.findByPk(id);
    if (!answer) {
      return res.status(404).json({ message: 'Odpowiedź nie została znaleziona.' });
    }

    const question = await Question.findByPk(answer.questionId);
    const set = await Set.findOne({
      where: {
        id: question.setId,
        [Sequelize.Op.or]: [
          { ownerId: userId },
          Sequelize.literal(`JSON_CONTAINS_PATH(collaboratorsList, 'one', '$."${userId}"')`),
        ],
      },
    });
    if (!set) {
      return res.status(403).json({ message: 'Brak uprawnień do edycji odpowiedzi.' });
    }

    answer.content = content || answer.content;
    answer.isTrue = typeof isTrue === 'boolean' ? isTrue : answer.isTrue;

    await answer.save();
    updateQuestionType(question.id);
    res.status(200).json(answer);
  } catch (error) {
    res.status(500).json({ message: 'Błąd podczas edycji odpowiedzi.', error: error.message });
  }
};


const deleteAnswer = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const answer = await Answer.findByPk(id);
    if (!answer) {
      return res.status(404).json({ message: 'Odpowiedź nie została znaleziona.' });
    }

    const question = await Question.findByPk(answer.questionId);
    const set = await Set.findOne({
      where: {
        id: question.setId,
        [Sequelize.Op.or]: [
          { ownerId: userId },
          Sequelize.literal(`JSON_CONTAINS_PATH(collaboratorsList, 'one', '$."${userId}"')`),
        ],
      },
    });
    if (!set) {
      return res.status(403).json({ message: 'Brak uprawnień do usunięcia odpowiedzi.' });
    }

    await answer.destroy();
    updateQuestionType(question.id);
    res.status(200).json({ message: 'Odpowiedź została usunięta.' });
  } catch (error) {
    res.status(500).json({ message: 'Błąd podczas usuwania odpowiedzi.', error: error.message });
  }
};

const getAnswersByQuestionId = async (req, res) => {
  try {
    const { questionId } = req.params;

    const question = await Question.findByPk(questionId);
    if (!question) {
      return res.status(404).json({ message: 'Pytanie nie zostało znalezione.' });
    }

    const answers = await Answer.findAll({ where: { questionId } });
    res.status(200).json(answers);
  } catch (error) {
    res.status(500).json({ message: 'Błąd podczas pobierania odpowiedzi.', error: error.message });
  }
};


const getAnswerById = async (req, res) => {
  try {
    const { id } = req.params;
    const answer = await Answer.findByPk(id);

    if (!answer) {
      return res.status(404).json({ message: 'Odpowiedź nie została znaleziona.' });
    }

    res.status(200).json(answer);
  } catch (error) {
    res.status(500).json({ message: 'Błąd podczas pobierania odpowiedzi.', error: error.message });
  }
};

const getCorrectAnswersByQuestionId = async (req, res) => {
  try {
    const { questionId } = req.params;

    const answers = await Answer.findAll({
      where: {
        questionId,
        isTrue: true
      }
    });

    if (!answers.length) {
      return res.status(404).json({ message: 'Brak poprawnych odpowiedzi dla tego pytania.' });
    }

    res.status(200).json(answers);
  } catch (error) {
    res.status(500).json({ message: 'Błąd podczas pobierania poprawnych odpowiedzi.', error: error.message });
  }
};

module.exports = {
  addAnswer,
  editAnswer,
  deleteAnswer,
  getAnswersByQuestionId,
  getAnswerById,
  getCorrectAnswersByQuestionId
};
