const User = require('./User');
const Set = require('./Set');
const Question = require('./Question');
const Answer = require('./Answer');
const Flashcards = require('./Flashcards');
const Test = require('./Test');
const CompletedTest = require('./CompletedTest');
const Report = require('./Report');
const Quiz = require('./Quiz');
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
Question.belongsToMany(Test, { through: 'TestQuestions', foreignKey: 'questionId' });
CompletedTest.belongsTo(Test, { foreignKey: 'testId', onDelete: 'CASCADE' });
CompletedTest.belongsTo(User, { foreignKey: 'userId', onDelete: 'CASCADE' });
Test.belongsTo(User, {foreignKey: "userId", onDelete:"CASCADE"});
Test.belongsTo(Set, {foreignKey: "setId", onDelete: "CASCADE"})
// Relacje raportu
Report.belongsTo(User, { foreignKey: 'userId', as: 'user' });  
Report.belongsTo(Set, { foreignKey: 'setId', as: 'set' });  
Report.belongsTo(User, { foreignKey: 'checkedById', as: 'checkedBy' });

//Relacje testu
Quiz.belongsTo(User, {foreignKey: 'userId',onDelete: 'CASCADE' });
Quiz.belongsTo(Set, {foreignKey: "setId", onDelete: "CASCADE"});
Quiz.belongsToMany(Question, {through: 'QuizQuestions', foreignKey: 'id'});
Question.belongsToMany(Quiz, { through: 'QuizQuestions', foreignKey: 'questionId' });
module.exports = {
  User,
  Set,
  Question,
  Answer,
  Flashcards,
  Test,
  CompletedTest,
  Report,
  Quiz,
};
