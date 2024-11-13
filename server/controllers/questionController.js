const Question = require('../models/Question');
const Set = require('../models/Set');
const Answer = require('../models/Answer');

const addQuestion = async (req, res) => {
    try {
        const {content, type, setId} = req.body;
        const userId = req.user.id;

        const set = await Set.findOne({where: {id: setId, ownerId: userId}});
        if (!set) {
            return res.status(404).json({message: 'Zestaw nie został odnaleziony!'});
        }

        const newQuestion = await Question.create({
            content,
            type,
            setId
        });
        res.status(201).json(newQuestion);
    } catch (error) {
        res.status(500).json({message: 'Błąd podczas dodawania pytania.', error: error.message});
    }
};

const editQuestion = async (req, res) => {
    try {
        const {content, type} = req.body;
        const {id} = req.params;
        const userId = req.user.id;

        const question = await Question.findOne({
            where: {id},
            include: {
                model: Set,
                where: {ownerId: userId}
            }
        });

        if (!question) {
            return res.status(404).json({message: 'Pytanie nie zostało znalezione lub brak uprawnień.'});
        }

        question.content = content || question.content;
        question.type = type || question.type;
        await question.save();

        res.status(200).json(question);
    } catch (error) {
        res.status(500).json({message: 'Błąd podczas edycji pytania.', error: error.message});
    }
};

// Usuwanie pytania
const deleteQuestion = async (req, res) => {
    try {
        const {id} = req.params;
        const userId = req.user.id;

        const question = await Question.findOne({
            where: {id},
            include: {
                model: Set,
                where: {ownerId: userId}
            }
        });

        if (!question) {
            return res.status(404).json({message: 'Pytanie nie zostało znalezione lub brak uprawnień.'});
        }

        await Answer.destroy({where: {questionId: question.id}});
        await question.destroy();

        res.status(200).json({message: 'Pytanie oraz powiązane odpowiedzi zostały usunięte.'});
    } catch (error) {
        res.status(500).json({message: 'Błąd podczas usuwania pytania.', error: error.message});
    }
};

const getQuestionsBySet = async (req, res) => {
    try {
        const {setId} = req.params;
        const userId = req.user ? req.user.id : null;
        const userRole = req.user ? req.user.role : null;

        const set = await Set.findByPk(setId);

        if (!set) {
            return res.status(404).json({message: 'Zestaw nie został znaleziony.'});
        }

        if (!set.isPublic && (set.ownerId !== userId && userRole !== 'admin')) {
            return res.status(403).json({message: 'Brak dostępu do pytań tego zestawu.'});
        }

        const questions = await Question.findAll({
            where: {setId}
        });

        if (!questions || questions.length === 0) {
            return res.status(404).json({message: 'Brak pytań dla tego zestawu.'});
        }

        res.status(200).json(questions);
    } catch (error) {
        res.status(500).json({message: 'Błąd podczas pobierania pytań.', error: error.message});
    }
};

// Pobieranie pytania na podstawie ID
const getQuestionById = async (req, res) => {
    try {
        const {id} = req.params;

        const question = await Question.findOne({where: {id}});

        if (!question) {
            return res.status(404).json({message: 'Pytanie nie zostało znalezione.'});
        }

        res.status(200).json(question);
    } catch (error) {
        res.status(500).json({message: 'Błąd podczas pobierania pytania.', error: error.message});
    }
};

// Aktualizacja typu pytania na podstawie liczby poprawnych odpowiedzi
async function updateQuestionType(id) {
    try {
        const question = await Question.findByPk(id);
        if (!question) {
            throw new Error('Pytanie nie zostało znalezione');
        }

        const correctAnswersCount = await Answer.count({
            where: {
                questionId: id,
                isTrue: true
            }
        });

        const newType = correctAnswersCount > 1 ? 'multiple' : 'single';

        if (question.type !== newType) {
            question.type = newType;
            await question.save();
            console.log(`Typ pytania zaktualizowany na: ${newType}`);
        } else {
            console.log('Typ pytania już jest ustawiony prawidłowo.');
        }
    } catch (error) {
        console.error('Błąd podczas aktualizacji typu pytania:', error.message);
        throw error;
    }
}

module.exports = {
    addQuestion,
    editQuestion,
    deleteQuestion,
    getQuestionsBySet,
    getQuestionById,
    updateQuestionType
};
