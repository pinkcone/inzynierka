const Set = require('../models/Set');
const User = require('../models/User'); 
const Question = require('../models/Question');
const Answer = require('../models/Answer'); 

const { Op } = require('sequelize');

const addSet = async (req, res) => {
  try {
      const { name, isPublic, keyWords } = req.body;
      const userId = req.user.id;

      // Sprawdź, czy zestaw o danej nazwie już istnieje
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
      const userId = req.user ? req.user.id : null;  // Sprawdź, czy użytkownik jest zalogowany
  
      // Szukaj zestawu po ID, bez względu na właściciela
      const set = await Set.findByPk(id);
  
      if (!set) {
        return res.status(404).json({ message: 'Zestaw nie został znaleziony.' });
      }
  
      // Sprawdź, czy zestaw jest prywatny i użytkownik nie jest właścicielem
      if (!set.isPublic && set.ownerId !== userId) {
        return res.status(403).json({ message: 'Brak dostępu do tego zestawu.' });
      }
  
      res.status(200).json(set);
    } catch (error) {
      res.status(500).json({ message: 'Wystąpił błąd podczas pobierania zestawu.', error: error.message });
    }
  };
  

const getPublicSets = async (req, res) => {
  try {
    const { keyword } = req.query;  // Odczyt słowa kluczowego z parametrów zapytania, jeśli jest obecne

    // Filtruj zestawy publiczne, opcjonalnie szukając po słowach kluczowych
    const whereClause = {
      isPublic: true,
    };

    if (keyword) {
      whereClause.keyWords = { [Op.like]: `%${keyword}%` };  // Szukaj zestawów zawierających słowo kluczowe
    }

    const publicSets = await Set.findAll({
      where: whereClause
    });

    if (publicSets.length === 0) {
      return res.status(404).json({ message: 'Nie znaleziono żadnych publicznych zestawów.' });
    }

    res.status(200).json(publicSets);
  } catch (error) {
    res.status(500).json({ message: 'Wystąpił błąd podczas pobierania publicznych zestawów.', error: error.message });
  }
};

  module.exports = {
    addSet,
    editSet,
    deleteSet,
    changeSetOwner,
    getAllUserSets,
    getSetById,
    getPublicSets
  };