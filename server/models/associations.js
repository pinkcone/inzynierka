const User = require('./User');
const Set = require('./Set');
const Question = require('./Question');
const Answer = require('./Answer');


User.hasMany(Set, { foreignKey: 'ownerId', onDelete: 'CASCADE' });
Set.hasMany(Question, { foreignKey: 'setId', onDelete: 'CASCADE' });
Question.hasMany(Answer, { foreignKey: 'questionId', onDelete: 'CASCADE' });

module.exports = {
  User,
  Set,
  Question,
  Answer
};
