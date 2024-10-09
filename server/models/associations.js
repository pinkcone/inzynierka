const User = require('./User');
const Set = require('./Set');
const Question = require('./Question');
const Answer = require('./Answer');
const Flashcards = require('./Flashcards');

// relations
User.hasMany(Set, { foreignKey: 'ownerId', onDelete: 'CASCADE' });
Set.hasMany(Question, { foreignKey: 'setId', onDelete: 'CASCADE' });
Question.hasMany(Answer, { foreignKey: 'questionId', onDelete: 'CASCADE' });

// relations for Flashcards
User.hasMany(Flashcards, { foreignKey: 'userId', onDelete: 'CASCADE' });
Set.hasMany(Flashcards, { foreignKey: 'setId', onDelete: 'CASCADE' });
Question.hasMany(Flashcards, { foreignKey: 'questionId', onDelete: 'CASCADE' });



module.exports = {
  User,
  Set,
  Question,
  Answer,
  Flashcards
};
