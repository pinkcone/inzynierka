const Set = require('../models/Set');
const User = require('../models/User');
const Question = require('../models/Question');
const Answer = require('../models/Answer');
const Report = require('../models/Report');
const  sequelize  = require('../config/sequelize'); // lub odpowiednia ścieżka
const { Sequelize } = require('sequelize');
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

    // Pobieramy zestaw, sprawdzając, czy użytkownik jest właścicielem lub współtwórcą
    const set = await Set.findOne({
      where: {
        id,
        [Op.or]: [
          { ownerId: userId }, // Właściciel
          Sequelize.literal(`JSON_CONTAINS_PATH(collaboratorsList, 'one', '$."${userId}"')`),
        ],
      },
    });

    if (!set) {
      return res.status(403).json({ message: 'Brak uprawnień do edycji tego zestawu lub zestaw nie istnieje.' });
    }

    // Aktualizujemy tylko przesłane pola
    set.name = name || set.name;
    set.isPublic = typeof isPublic === 'boolean' ? isPublic : set.isPublic;
    set.keyWords = keyWords || set.keyWords;

    // Zapisujemy zmiany
    await set.save();
    res.status(200).json(set);
  } catch (error) {
    console.error('Błąd podczas edycji zestawu:', error);
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
    const userId = req.user.id;
    const sets = await Set.findAll({
      where: {
        [Op.or]: [
          { ownerId: userId },
          Sequelize.literal(`JSON_CONTAINS_PATH(collaboratorsList, 'one', '$."${userId}"')`),
        ],
      },
    });
    if (!sets.length) {
      console.log('Brak zestawów dla użytkownika', userId);
      console.log('Wynik zapytania:', sets);
    }
    res.status(200).json(sets);
  } catch (error) {
    console.error('Błąd podczas pobierania zestawów:', error);
    res.status(500).json({ message: 'Wystąpił błąd podczas pobierania zestawów.', error: error.message });
  }
};




const getSetById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user ? req.user.id : null;
    const userRole = req.user ? req.user.role : null;

    const set = await Set.findOne({
      where: {
        id,
        [Op.or]: [
          { isPublic: true }, // Zestaw publiczny
          { ownerId: userId }, // Właściciel
          Sequelize.literal(`JSON_CONTAINS_PATH(collaboratorsList, 'one', '$."${userId}"')`), // Współtwórca
        ],
      },
    });

    if (!set) {
      return res.status(403).json({ message: 'Brak dostępu do tego zestawu.' });
    }

    res.status(200).json(set);
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

const addCollaborator = async (req, res) => {
  const { setId } = req.params;
  const { email } = req.body;

  try {
    console.log("Szukam zestawu");
    const set = await Set.findByPk(setId);
    if (!set) return res.status(404).json({ message: 'Zestaw nie został odnaleziony' });

    console.log("Szukam użytkownika");
    const user = await User.findOne({ where: { email } });
    if (!user) return res.status(404).json({ message: 'Użytkownik o takim emailu nie istnieje' });

    console.log("Sprawdzam czy użytkownik jest już współtwórcą");

    // Sprawdź i popraw `collaboratorsList`, jeśli jest błędne
    if (!set.collaboratorsList || typeof set.collaboratorsList !== 'object') {
      try {
        // Spróbuj sparsować, jeśli jest stringiem
        set.collaboratorsList = JSON.parse(set.collaboratorsList);
      } catch {
        // Jeśli parsowanie się nie uda, ustaw jako pusty obiekt
        set.collaboratorsList = {};
      }
    }

    console.log('collaboratorsList przed dodaniem:', set.collaboratorsList);

    if (set.collaboratorsList[user.id]) {
      return res.status(400).json({ message: 'Użytkownik już jest współtwórcą tego zestawu!' });
    }

    console.log("Dodaję współtwórcę");
    set.collaboratorsList = {
      ...set.collaboratorsList, // Zachowujemy istniejące klucze
      [user.id]: { addedAt: new Date() }, // Dodajemy nowego użytkownika
    };

    console.log('collaboratorsList przed zapisem:', set.collaboratorsList);

    console.log("Zapisuję zmiany");
    set.changed('collaboratorsList', true); // Wymuszamy zapis zmian
    await set.save();

    console.log("Współtwórca dodany");
    res.status(200).json({
      message: 'Współtwórca dodany pomyślnie',
      collaboratorsList: set.collaboratorsList,
    });
  } catch (error) {
    console.error('Błąd podczas dodawania współtwórcy:', error);
    res.status(500).json({ message: 'Błąd podczas dodawania współtwórcy.', error: error.message });
  }
};


const getCollaborators = async (req, res) => {
  const { setId } = req.params;

  try {
    console.log("Szukam zestawu");
    const set = await Set.findByPk(setId);

    if (!set) {
      return res.status(404).json({ message: 'Zestaw nie został odnaleziony' });
    }

    let collaboratorsList = set.collaboratorsList;
    if (!collaboratorsList || typeof collaboratorsList !== 'object') {
      try {
        collaboratorsList = JSON.parse(collaboratorsList);
      } catch {
        collaboratorsList = {};
      }
    }

    console.log('Lista współtwórców:', collaboratorsList);

    const collaboratorIds = Object.keys(collaboratorsList);
    if (collaboratorIds.length === 0) {
      return res.status(200).json({ message: 'Brak współtwórców', collaborators: [] });
    }

    console.log("Pobieram dane współtwórców");

    const collaborators = await User.findAll({
      where: { id: collaboratorIds },
      attributes: ['id', 'email', 'username'], 
    });

    if (collaborators.length === 0) {
      return res.status(404).json({ message: 'Nie znaleziono współtwórców dla podanych ID.' });
    }

    const detailedCollaborators = collaborators.map((collaborator) => ({
      ...collaborator.toJSON(),
      addedAt: collaboratorsList[collaborator.id]?.addedAt || null,
    }));

    res.status(200).json({
      message: 'Lista współtwórców została pobrana pomyślnie',
      collaborators: detailedCollaborators,
    });
  } catch (error) {
    console.error('Błąd podczas pobierania współtwórców:', error);
    res.status(500).json({ message: 'Błąd podczas pobierania współtwórców.', error: error.message });
  }
};

const removeCollaborator = async (req, res) => {
  const { setId, userId } = req.params; 

  try {
    const set = await Set.findByPk(setId);
    if (!set) {
      return res.status(404).json({ message: 'Zestaw nie został znaleziony.' });
    }

    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ message: 'Użytkownik nie został znaleziony.' });
    }

    if (!set.collaboratorsList || !set.collaboratorsList[userId]) {
      return res.status(400).json({ message: 'Użytkownik nie jest współtwórcą tego zestawu.' });
    }

    delete set.collaboratorsList[userId]; 

    await set.save();

    res.status(200).json({ message: 'Współtwórca został pomyślnie usunięty.' });
  } catch (error) {
    console.error('Błąd podczas usuwania współtwórcy:', error);
    res.status(500).json({ message: 'Błąd podczas usuwania współtwórcy.', error: error.message });
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
  forceDeleteSet, 
  addCollaborator,
  getCollaborators,
  removeCollaborator
};