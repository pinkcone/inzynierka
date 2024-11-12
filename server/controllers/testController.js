const { Sequelize } = require('sequelize');
const Test = require('../models/Test');
const {Question} = require("../models/associations");
const Answer = require('../models/Answer');

const createTestManual = async (req, res) => {
    const { duration, questionIds, name } = req.body;

    if (!Array.isArray(questionIds) || questionIds.length === 0) {
        return res.status(400).json({ error: 'Nie wybrano żadnego pytania!' });
    }

    try {
        console.log("Zaczynamy tworzenie testu");
        const newTest = await createTestWithCode(duration, name);
        console.log("Dodaję pytanka")
        await assignQuestionsToTest(newTest, questionIds);
        console.log("Pytanka dodane");
        res.status(201).json(newTest);

    } catch (error) {
        res.status(500).json({ message: 'Błąd podczas dodawania testu.', error: error.message });
    }
};

const createTestRandom = async (req, res) => {
    const { duration, questionCount, setId, name } = req.body;

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
        const newTest = await createTestWithCode(duration, name);
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


async function createTestWithCode(duration, name) {
    const code = await generateCode();
    console.log("Wygenerowano kod: ", code);
    return await Test.create({
        code,
        duration,
        name
    });
}


async function assignQuestionsToTest(test, questionIds) {
    await test.addQuestions(questionIds);
}

const getTestInformation = async (req, res) => {
    const { code } = req.params;

    try {
        const test = await Test.findOne({
            attributes: [
                'name',
                'code',
                'duration',
                [Sequelize.fn('COUNT', Sequelize.col('Questions.id')), 'questionCount']
            ],
            where: { code },
            include: [
                {
                    model: Question,
                    attributes: [],
                    through: { attributes: [] }
                }
            ],
            group: ['Test.code']
        });

        if (!test) {
            return res.status(404).json({ error: 'Test nie został znaleziony.' });
        }

        res.status(200).json(test);
    } catch (error) {
        res.status(500).json({ message: 'Błąd podczas pobierania informacji o teście.', error: error.message });
    }
};

const getTestQuestion = async (req, res) => {
    const { code } = req.params;

    try {
        console.log("Kod testu: ", code);
        const test = await Test.findOne({
            where: { code },
            include: [
                {
                    model: Question,
                    through: { attributes: [] },
                    attributes: ['content', 'type'],
                    include: [
                        {
                            model: Answer,
                            attributes: ['content'],
                        }
                    ],
                }
            ]
        });
        console.log("Pytania testu: ", test.Questions);
        if (!test) {
            return res.status(404).json({ error: 'Test nie został znaleziony.' });
        }
        res.status(200).json({ questions: test.Questions });

    } catch (error) {
        res.status(500).json({ message: 'Błąd podczas pobierania pytań testu.', error: error.message });
    }
};


const getAllTests = async (req, res) => {
    const userId = req.user.id;
    try {
        console.log("UserID: ", userId);
        const tests = await Test.findAll({
            attributes: [
                'code',
                'name',
                [Sequelize.fn('COUNT', Sequelize.col('Questions.id')), 'questionCount']
            ],
            include: [
                {
                    model: Question,
                    attributes: [],
                    through: { attributes: [] }
                }
            ],
            group: ['Test.code']
        });
        // console.log("Testy: ", tests);
        res.status(200).json(tests);
    } catch (error) {
        res.status(500).json({ message: 'Błąd podczas pobierania testów.', error: error.message });
    }
};
module.exports = { createTestManual, createTestRandom, getTestInformation, getTestQuestion, getAllTests }