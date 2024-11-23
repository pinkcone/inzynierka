const Set = require('../models/Set');
const User = require('../models/User'); 
const Question = require('../models/Question');
const Answer = require('../models/Answer'); 
const Report = require('../models/Report'); 


const { Op } = require('sequelize');

const addSet = async (req, res) => {
  try {
      const { name, isPublic, keyWords } = req.body;
      const userId = req.user.id;

      const existingSet = await Set.findOne({ where: { name, ownerId: userId } });
      if (existingSet) {
          return res.status(400).json({ message: 'Zestaw o tej nazwie już istnieje. Proszę podać inną nazwę.' });
      }

      const newSet = await Set.create({
          name,
          isPublic,
          keyWords,
          ownerId: userId
      });
      res.status(201).json(newSet);

      
  } catch (error) {
      res.status(500).json({ message: 'Błąd podczas dodawania zestawu.', error: error.message });
  }
};


const editSet = async (req, res) => {
    try {
      const { id } = req.params;
      const { name, isPublic, keyWords } = req.body;
      const userId = req.user.id;
  
      const set = await Set.findOne({ where: { id, ownerId: userId } });
      if (!set) {
        return res.status(404).json({ message: 'Zestaw nie został znaleziony lub brak uprawnień.' });
      }
  
      set.name = name || set.name;
      set.isPublic = typeof isPublic === 'boolean' ? isPublic : set.isPublic;
      set.keyWords = keyWords || set.keyWords;
  
      await set.save();
      res.status(200).json(set);
    } catch (error) {
      res.status(500).json({ message: 'Błąd podczas edycji zestawu.', error: error.message });
    }
  };

  const deleteSet = async (req, res) => {
    try {
        const { id } = req.params;  
        const userId = req.user.id; 

        const set = await Set.findOne({ where: { id, ownerId: userId } });
        if (!set) {
            return res.status(404).json({ message: 'Zestaw nie został znaleziony lub brak uprawnień.' });
        }

        const questions = await Question.findAll({ where: { setId: set.id } });

        for (const question of questions) {
            await Answer.destroy({ where: { questionId: question.id } });
        }

        await Question.destroy({ where: { setId: set.id } });
        await Report.update({ setId: null }, { where: { setId: set.id } });
        await set.destroy();

        res.status(200).json({ message: 'Zestaw i wszystkie powiązane pytania oraz odpowiedzi zostały usunięte.' });
    } catch (error) {
        res.status(500).json({ message: 'Błąd podczas usuwania zestawu.', error: error.message });
    }
};

  
  const changeSetOwner = async (req, res) => {
    try {
      const { setId, newOwnerId } = req.body;
      const userId = req.user.id;
  
      const set = await Set.findOne({ where: { id: setId, ownerId: userId } });
      if (!set) {
        return res.status(404).json({ message: 'Zestaw nie został znaleziony lub brak uprawnień.' });
      }
  
      const newOwner = await User.findByPk(newOwnerId);
      if (!newOwner) {
        return res.status(404).json({ message: 'Nowy właściciel nie został znaleziony.' });
      }
  
      set.ownerId = newOwnerId;
      await set.save();
      res.status(200).json({ message: 'Właściciel zestawu został zmieniony.', set });
    } catch (error) {
      res.status(500).json({ message: 'Błąd podczas zmiany właściciela zestawu.', error: error.message });
    }
  };

  
  const getAllUserSets = async (req, res) => {
    try {
      const sets = await Set.findAll({ where: { ownerId: req.user.id } });
  
      if (!sets.length) {
        return res.status(200).json([]); 
      }
  
      res.status(200).json(sets);
    } catch (error) {
      res.status(500).json({ message: 'Wystąpił błąd podczas pobierania zestawów.', error: error.message });
    }
  };
  

  const getSetById = async (req, res) => {
    try {
      const { id } = req.params;
      const userId = req.user ? req.user.id : null;  
      const userRole = req.user ? req.user.role : null; 
    
      const set = await Set.findByPk(id);
    
      if (!set) {
        return res.status(404).json({ message: 'Zestaw nie został znaleziony.' });
      }
    
      if (set.isPublic) {
        return res.status(200).json(set);
      }
  
      if (set.ownerId === userId || userRole === 'admin') {
        return res.status(200).json(set);
      }
  
      return res.status(403).json({ message: 'Brak dostępu do tego zestawu.' });
      
    } catch (error) {
      res.status(500).json({ message: 'Wystąpił błąd podczas pobierania zestawu.', error: error.message });
    }
  };
  
  

  const getPublicSets = async (req, res) => {
    try {
      const { keyword, page = 1, pageSize = 10 } = req.query; 
  
      const whereClause = {
        isPublic: true,
      };
  
      if (keyword) {
        whereClause.keyWords = { [Op.like]: `%${keyword}%` }; 
      }
  
      const offset = (page - 1) * pageSize;
  
      const { count, rows } = await Set.findAndCountAll({
        where: whereClause,
        limit: parseInt(pageSize),
        offset: offset,
      });
  
      if (rows.length === 0) {
        return res.status(404).json({ message: 'Nie znaleziono żadnych publicznych zestawów.' });
      }
  
      const totalPages = Math.ceil(count / pageSize);
  
      res.status(200).json({
        sets: rows,
        currentPage: page,
        totalPages,
      });
    } catch (error) {
      res.status(500).json({ message: 'Wystąpił błąd podczas pobierania publicznych zestawów.', error: error.message });
    }
  };

  const getAllSetsWithOwner = async (req, res) => {
    try {
      const { keyword = '', page = 1, pageSize = 10 } = req.query;
  
      const whereClause = keyword
        ? {
            [Op.or]: [
              { name: { [Op.like]: `%${keyword}%` } },
              { keyWords: { [Op.like]: `%${keyword}%` } },
            ],
          }
        : {};
  
      const offset = (page - 1) * pageSize;
  
      const { count, rows } = await Set.findAndCountAll({
        where: whereClause,
        include: [
          {
            model: User,
            attributes: ['id', 'username'],
          },
        ],
        limit: parseInt(pageSize),
        offset,
      });
  
      const sets = rows.map((set) => ({
        id: set.id,
        name: set.name,
        isPublic: set.isPublic,
        keyWords: set.keyWords,
        ownerId: set.ownerId,
        owner: set.User ? set.User.username : 'Nieznany',
      }));
  
      const totalPages = Math.ceil(count / pageSize);
  
      res.status(200).json({
        sets,
        currentPage: parseInt(page),
        totalPages,
      });
    } catch (error) {
      console.error('Błąd podczas pobierania zestawów:', error.message);
      res.status(500).json({ message: 'Wystąpił błąd podczas pobierania zestawów.', error: error.message });
    }
  };
  
  
  const forceDeleteSet = async (req, res) => {
    try {
        const { id } = req.params;
        
        const set = await Set.findOne({ where: { id } });
        if (!set) {
            console.warn(`Zestaw o ID ${id} nie został znaleziony.`);
            return res.status(404).json({ message: 'Zestaw nie został znaleziony.' });
        }

        const questions = await Question.findAll({ where: { setId: set.id } });

        for (const question of questions) {
            await Answer.destroy({ where: { questionId: question.id } });
        }

        await Question.destroy({ where: { setId: set.id } });
        await Report.update({ setId: null }, { where: { setId: set.id } });
        await set.destroy();

        res.status(200).json({ message: 'Zestaw i wszystkie powiązane pytania oraz odpowiedzi zostały usunięte.' });
    } catch (error) {
        console.error(`Błąd podczas usuwania zestawu: ${error.message}`, error);
        res.status(500).json({ message: 'Błąd podczas usuwania zestawu.', error: error.message });
    }
};

  

  module.exports = {
    addSet,
    editSet,
    deleteSet,
    changeSetOwner,
    getAllUserSets,
    getSetById,
    getPublicSets,
    getAllSetsWithOwner,
    forceDeleteSet
  };