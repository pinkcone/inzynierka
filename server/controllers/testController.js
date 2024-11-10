const Test = require('../models/Test')
const {Question} = require("../models/associations");


const createTestManual = async (req, res) => {
    const { duration, questionIds } = req.body;

    if (!Array.isArray(questionIds) || questionIds.length === 0) {
        return res.status(400).json({ error: 'Nie wybrano żadnego pytania!' });
    }

    try {
        console.log("Zaczynamy tworzenie testu");
        const newTest = await createTestWithCode(duration);
        console.log("Dodaję pytanka")
        await assignQuestionsToTest(newTest, questionIds);
        console.log("Pytanka dodane");
        res.status(201).json(newTest);

    } catch (error) {
        res.status(500).json({ message: 'Błąd podczas dodawania testu.', error: error.message });
    }
};

const createTestRandom = async (req, res) => {
    const { duration, questionCount, setId } = req.body;

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
        await assignQuestionsToTest(newTest, questionIds);

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
        console.log("Szukam kodu w bazie danych");
        existingCode = await Test.findOne({ where: { code } });
    } while (existingCode);

    return code;
}


async function createTestWithCode(duration) {
    const code = await generateCode();
    console.log("Wygenerowano kod: ", code);
    return await Test.create({
        code,
        duration,
    });
}


async function assignQuestionsToTest(test, questionIds) {
    await test.addQuestions(questionIds);
}

module.exports = { createTestManual, createTestRandom, }