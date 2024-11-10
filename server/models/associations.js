const User = require('./User');
const Set = require('./Set');
const Question = require('./Question');
const Answer = require('./Answer');
const Flashcards = require('./Flashcards');
const Test = require('./Test');
const CompletedTest = require('./CompletedTest');

// Ustalanie relacji
User.hasMany(Set, { foreignKey: 'ownerId', onDelete: 'CASCADE' });
Set.belongsTo(User, { foreignKey: 'ownerId' });

Set.hasMany(Question, { foreignKey: 'setId', onDelete: 'CASCADE' });
Question.belongsTo(Set, { foreignKey: 'setId' });

Question.hasMany(Answer, { foreignKey: 'questionId', onDelete: 'CASCADE' });

// Relacje dla Flashcards
User.hasMany(Flashcards, { foreignKey: 'userId', onDelete: 'CASCADE' });
Set.hasMany(Flashcards, { foreignKey: 'setId', onDelete: 'CASCADE' });
Question.hasMany(Flashcards, { foreignKey: 'questionId', onDelete: 'CASCADE' });

// Relacje dla Test i CompletedTest
Test.hasMany(CompletedTest, { foreignKey: 'testId' });
Test.belongsToMany(Question, {through: 'TestQuestions', foreignKey: 'code'});
CompletedTest.belongsTo(Test, { foreignKey: 'testId', onDelete: 'CASCADE' });
CompletedTest.belongsTo(User, { foreignKey: 'userId', onDelete: 'CASCADE' });
Question.belongsToMany(Test, { through: 'TestQuestions', foreignKey: 'questionId' });

module.exports = {
  User,
  Set,
  Question,
  Answer,
  Flashcards,
  Test,
  CompletedTest
};
