const { Set, Question, Answer } = require('../models/associations');

const createSet = async (req, res) => {
  try {
    const { name, isPublic, keyWords } = req.body;
    const newSet = await Set.create({ name, isPublic, keyWords, ownerId: req.user.id });
    res.status(201).json(newSet);
  } catch (error) {
    res.status(500).json({ message: 'Wystąpił błąd podczas tworzenia zestawu' });
  }
};

const addQuestionToSet = async (req, res) => {
  try {
    const { content, type, setId } = req.body;
    const newQuestion = await Question.create({ content, type, setId });
    res.status(201).json(newQuestion);
  } catch (error) {
    res.status(500).json({ message: 'Wystąpił błąd podczas dodawania pytania' });
  }
};

const addAnswerToQuestion = async (req, res) => {
  try {
    const { content, isTrue, questionId } = req.body;
    const newAnswer = await Answer.create({ content, isTrue, questionId });
    res.status(201).json(newAnswer);
  } catch (error) {
    res.status(500).json({ message: 'Wystąpił błąd podczas dodawania odpowiedzi' });
  }
};

module.exports = { createSet, addQuestionToSet, addAnswerToQuestion };
