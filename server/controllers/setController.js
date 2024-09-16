const Set = require('../models/Set');

const addSet = async (req, res) => {
    try{
        const {name, isPublic, keyWords } = req.body;
        const userId = req.user.id;

        const newSet = await Set.create({
            name,
            isPublic,
            keyWords,
            ownerId: userId
          });

          res.status(201).json(newSet);
    } catch(error){
        res.status(500).json({message: 'Błąd podczas dodawania zestawu.', error: error.message});      
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
  
      await set.destroy();
      res.status(200).json({ message: 'Zestaw został usunięty.' });
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

  module.exports = {
    addSet,
    editSet,
    deleteSet,
    changeSetOwner
  };