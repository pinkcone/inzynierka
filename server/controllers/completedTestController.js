const CompletedTest = require('../models/CompletedTest');
const Test = require('../models/Test');


const createCompletedTest = async (req, res) => {
    const { code, selectedAnswer } = req.body;
    const userId = req.user.id;

    try {
        const test = await Test.findOne({ where: { code } });
        if (!test) {
            return res.status(404).json({ message: 'Test nie został znaleziony.' });
        }

        const questions = await Question.findAll({
            where: { setId: test.setId },
            include: [{
                model: Answer,
                where: { isTrue: true },
                attributes: ['id', 'questionId']
            }]
        });

        let totalScore = 0;
        const questionScores = {};

        for (const question of questions) {
            const questionId = question.id;
            const correctAnswers = question.Answers.map(answer => answer.id);
            const userAnswers = selectedAnswer[questionId] || [];
            let scoreForQuestion = 0;

            if (correctAnswers.length === 1) {
                if (userAnswers.includes(correctAnswers[0])) {
                    scoreForQuestion = 1;
                }
            } else {
                const correctUserAnswers = userAnswers.filter(answerId => correctAnswers.includes(answerId)).length;
                scoreForQuestion = correctUserAnswers / correctAnswers.length;
            }

            totalScore += scoreForQuestion;
            questionScores[questionId] = scoreForQuestion; // Zapisanie wyniku dla danego pytania
        }

        const completedTest = await CompletedTest.create({
            testId: test.code,
            userId,
            selectedAnswer,
            score: totalScore,
            questionScores, // Zapisanie wyników dla poszczególnych pytań
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
            where: { setId: completedTest.Test.setId },
            include: [
                {
                    model: Answer,
                    where: { isTrue: true },
                    attributes: ['id', 'questionId']
                }
            ]
        });

        // Strukturyzacja poprawnych odpowiedzi w formacie `idPytania: [idPoprawnychOdpowiedzi]`
        const correctAnswers = {};
        questions.forEach(question => {
            correctAnswers[question.id] = question.Answers.map(answer => answer.id);
        });

        res.status(200).json({
            completedTest,
            correctAnswers
        });
    } catch (error) {
        console.error('Błąd podczas pobierania zakończonego testu:', error.message);
        res.status(500).json({ message: 'Błąd podczas pobierania zakończonego testu.', error: error.message });
    }
};

const getAllCompletedTestsForTest = async (req, res) => {
    const { testId } = req.params;

    try {
        const test = await Test.findOne({ where: { code: testId } });
        if (!test) {
            return res.status(404).json({ message: 'Test nie został znaleziony.' });
        }

        const completedTests = await CompletedTest.findAll({
            where: { testId: testId },
            attributes: ['id', 'score', 'createdAt'],
            order: [['createdAt', 'DESC']]
        });

        res.status(200).json(completedTests);
    } catch (error) {
        console.error('Błąd podczas pobierania zakończonych testów:', error.message);
        res.status(500).json({ message: 'Błąd podczas pobierania zakończonych testów.', error: error.message });
    }
}

module.exports = {createCompletedTest, getCompletedTest, getAllCompletedTestsForTest}