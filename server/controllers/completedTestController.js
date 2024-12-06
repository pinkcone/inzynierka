const CompletedTest = require('../models/CompletedTest');
const Test = require('../models/Test');
const Question = require('../models/Question');
const Answer = require('../models/Answer');

const createCompletedTest = async (req, res) => {
    const { code, selectedAnswer = {} } = req.body;
    const userId = req.user.id;
    try {
        const test = await Test.findOne({ where: { code } });
        if (!test) {
            return res.status(404).json({ message: 'Test nie został znaleziony.' });
        }

        const questions = await Question.findAll({
            include: [
                {
                    model: Test,
                    where: { code: test.code },
                    attributes: []
                },
                {
                    model: Answer,
                    where: { isTrue: true },
                    attributes: ['id', 'questionId']
                }
            ]
        });

        let totalScore = 0;
        const questionScores = {};

        console.log("Zaczynam przetwarzanie pytań");
        console.log("Selected Answer keys:", Object.keys(selectedAnswer));
        console.log("Question IDs:", questions.map(q => q.id));

        for (const question of questions) {
            const questionId = question.id;
            const correctAnswers = question.Answers.map(answer => answer.id);
            console.log("Przetwarzanie odpowiedzi");


            const userAnswers = Array.isArray(selectedAnswer[questionId]) ? selectedAnswer[questionId] : [];
            let scoreForQuestion = 0;

            console.log("Sprawdzanie odpowiedzi");
            if (correctAnswers.length === 1) {
                if (userAnswers.includes(correctAnswers[0])) {
                    scoreForQuestion = 1;
                }
            } else {
                const correctUserAnswers = userAnswers.filter(answerId => correctAnswers.includes(answerId)).length;
                const incorrectUserAnswers = userAnswers.length - correctUserAnswers;
                console.log("Incorrect user answers: ", incorrectUserAnswers);
                scoreForQuestion = (correctUserAnswers - incorrectUserAnswers) / correctAnswers.length;
                if (scoreForQuestion < 0) scoreForQuestion = 0;
            }

            totalScore += scoreForQuestion;
            questionScores[questionId] = scoreForQuestion;
            console.log("Sprawdzono pytanie");
        }

        console.log("Total score: ", totalScore);

        const completedTest = await CompletedTest.create({
            testCode: test.code,
            userId,
            selectedAnswer,
            score: totalScore,
            questionScores,
            name: test.name
        });

        res.status(201).json({ message: 'Test został zakończony i zapisany.', completedTest });
    } catch (error) {
        console.error('Błąd podczas zapisywania zakończonego testu:', error.message);
        res.status(500).json({ message: 'Błąd podczas zapisywania zakończonego testu.', error: error.message });
    }
};

const getCompletedTest = async (req, res) => {
    const { id } = req.params;

    try {
        const completedTest = await CompletedTest.findByPk(id, {
            include: [
                {
                    model: Test,
                    attributes: ['code', 'name', 'duration']
                }
            ]
        });

        if (!completedTest) {
            return res.status(404).json({ message: 'Zakończony test nie został znaleziony.' });
        }

        const questions = await Question.findAll({
            include: [
                {
                    model: Test,
                    where: { code: completedTest.testCode },
                    attributes: []
                },
                {
                    model: Answer,
                    attributes: ['id', 'questionId', 'content', 'isTrue']
                }
            ]
        });

        const formattedQuestions = questions.map((question) => ({
            id: question.id,
            content: question.content,
            answers: question.Answers.map((answer) => ({
                id: answer.id,
                content: answer.content,
                isTrue: answer.isTrue
            }))
        }));

        const correctAnswers = {};
        questions.forEach((question) => {
            correctAnswers[question.id] = question.Answers.filter((a) => a.isTrue).map((a) => a.id);
        });

        res.status(200).json({
            completedTest,
            questions: formattedQuestions,
            correctAnswers
        });
    } catch (error) {
        console.error('Błąd podczas pobierania zakończonego testu:', error.message);
        res.status(500).json({ message: 'Błąd podczas pobierania zakończonego testu.', error: error.message });
    }
};


const getAllCompletedTestsForTest = async (req, res) => {
    const { testCode } = req.params;
    const userId = req.user.id;

    try {
        const test = await Test.findOne({ where: { code: testCode } });
        if (!test) {
            return res.status(404).json({ message: 'Test nie został znaleziony.' });
        }

        const completedTests = await CompletedTest.findAll({
            where: { testCode, userId: userId },
            attributes: ['id', 'score', 'createdAt'],
            order: [['createdAt', 'DESC']]
        });

        res.status(200).json(completedTests);
    } catch (error) {
        console.error('Błąd podczas pobierania zakończonych testów:', error.message);
        res.status(500).json({ message: 'Błąd podczas pobierania zakończonych testów.', error: error.message });
    }
}

module.exports = { createCompletedTest, getCompletedTest, getAllCompletedTestsForTest }