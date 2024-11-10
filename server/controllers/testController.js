const Test = require('../models/Test')
const CompletedTest = require('../models/CompletedTest')


const createTestManual = async (req, res) => {
    const { duration, questionIds } = req.body;

    if (!Array.isArray(questionIds) || questionIds.length === 0) {
        return res.status(400).json({ error: 'Nie wybrano żadnego pytania!' });
    }

    try {
        const newTest = await createTestWithCode(duration);
        await assignQuestionsToTest(newTest.code, questionIds);

        res.status(201).json(newTest);

    } catch (error) {
        res.status(500).json({ message: 'Błąd podczas dodawania testu.', error: error.message });
    }
};

const createTestRandom = async (req, res) => {
    const { duration, questionCount } = req.body;
    const setId = req.set.id;

    if (typeof questionCount !== 'number' || questionCount <= 0) {
        return res.status(400).json({ error: 'Niepoprawna liczba pytań!' });
    }

    try {
        const questions = await Question.findAll({
            where: { setId },
        });

        if (questions.length < questionCount) {
            return res.status(400).json({ error: 'Nie ma wystarczającej liczby pytań w zestawie!' });
        }

        const selectedQuestions = [];
        while (selectedQuestions.length < questionCount) {
            const randomIndex = Math.floor(Math.random() * questions.length);
            const question = questions[randomIndex];

            if (!selectedQuestions.includes(question)) {
                selectedQuestions.push(question);
            }
        }

        const questionIds = selectedQuestions.map(question => question.id);
        const newTest = await createTestWithCode(duration);
        await assignQuestionsToTest(newTest.code, questionIds);

        res.status(201).json(newTest);

    } catch (error) {
        res.status(500).json({ message: 'Błąd podczas dodawania testu.', error: error.message });
    }
};

async function generateCodeValue() {
    const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
    let code = '';
    for (let i = 0; i < 8; i++) {
        const randomIndex = Math.floor(Math.random() * letters.length);
        code += letters[randomIndex];
    }
    return code;
}

async function generateCode() {
    let code;
    let existingCode;

    do {
        code = await generateCodeValue();
        existingCode = await Test.findOne({ where: { code } });
    } while (existingCode);

    return code;
}


async function createTestWithCode(duration) {
    const code = await generateCode();
    return await Test.create({
        code,
        duration,
    });
}


async function assignQuestionsToTest(testCode, questionIds) {
    const testQuestions = questionIds.map(questionId => ({
        code: testCode,
        questionId,
    }));
    await TestQuestion.bulkCreate(testQuestions);
}

module.exports = { createTestManual, createTestRandom, }