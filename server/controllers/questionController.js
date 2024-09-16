const Question = require('../models/Question');
const Set = require('../models/Set');

const addQuestion = async (req, res) => {
    try{
        const { content, type } = req.body;
        const { setId } = req.params;
        const usedId = req.user.id;

        const set = await Set.findOne({ where: { id: setId, ownerId: userId}});
        if(!set) {
            return res.status(404).json({message: "Zestaw nie został odnaleziony!"});
        }
            const newQuestion = await Question.create({
                content,
                type,
                setId
            });
            res.status(201).json(newQuestion);
        
    }catch(error){
        res.status(500).json({ message: 'Błąd podczas dodawania pytania.', error: error.message });
    }
};

const editQuestion = async (req, res) => {
    try {
      const { content, type } = req.body;
      const { id } = req.params; 
      const userId = req.user.id;
  
      const question = await Question.findOne({
        where: { id },
        include: {
          model: Set,
          where: { ownerId: userId }
        }
      });
  
      if (!question) {
        return res.status(404).json({ message: 'Pytanie nie zostało znalezione lub brak uprawnień.' });
      }
  
      question.content = content || question.content;
      question.type = type || question.type;
      await question.save();
  
      res.status(200).json(question);
    } catch (error) {
      res.status(500).json({ message: 'Błąd podczas edycji pytania.', error: error.message });
    }
  };
  
  const deleteQuestion = async (req, res) => {
    try {
      const { id } = req.params;
      const userId = req.user.id;
  
      const question = await Question.findOne({
        where: { id },
        include: {
          model: Set,
          where: { ownerId: userId }
        }
      });
  
      if (!question) {
        return res.status(404).json({ message: 'Pytanie nie zostało znalezione lub brak uprawnień.' });
      }
  
      await question.destroy();
      res.status(200).json({ message: 'Pytanie zostało usunięte.' });
    } catch (error) {
      res.status(500).json({ message: 'Błąd podczas usuwania pytania.', error: error.message });
    }
  };
  
  const getQuestionsBySet = async (req, res) => {
    try {
      const { setId } = req.params;
  
      const questions = await Question.findAll({
        where: { setId }
      });
  
      if (!questions) {
        return res.status(404).json({ message: 'Brak pytań dla tego zestawu.' });
      }
  
      res.status(200).json(questions);
    } catch (error) {
      res.status(500).json({ message: 'Błąd podczas pobierania pytań.', error: error.message });
    }
  };
  
  module.exports = {
    addQuestion,
    editQuestion,
    deleteQuestion,
    getQuestionsBySet
  };