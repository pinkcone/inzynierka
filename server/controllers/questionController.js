const Question = require('../models/Question');
const Set = require('../models/Set');
const Answer = require('../models/Answer');
const { Sequelize } = require('sequelize');
const path = require('path');
const multer = require('multer');
const fs = require('fs');

function deleteImageByUrl(req, res) {
  const { imageUrl } = req.body;

  if (!imageUrl) {
    return res.status(400).json({ message: 'Brak URL obrazu.' });
  }

  const fileName = path.basename(imageUrl);
  const filePath = path.join(__dirname, '..', 'uploads', fileName);

  fs.stat(filePath, (err) => {
    if (err) {
      return res.status(404).json({ message: 'Plik nie istnieje lub został już usunięty.' });
    }

    fs.unlink(filePath, (unlinkErr) => {
      if (unlinkErr) {
        console.error('Błąd podczas usuwania pliku:', unlinkErr);
        return res.status(500).json({ message: 'Błąd podczas usuwania pliku.' });
      }

      return res.status(200).json({ message: 'Plik został usunięty pomyślnie.' });
    });
  });
}

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({ 
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        if (!file.mimetype.startsWith('image/')) {
            const errMessage = 'Niedozwolony format pliku, oczekiwany obraz.';
            console.error(`[UPLOAD ERROR] ${errMessage} Typ pliku: ${file.mimetype}`);
            return cb(new Error(errMessage), false);
        }
        cb(null, true);
    }
});

const uploadImage = (req, res) => {
    try {
        if (!req.file) {
            const msg = 'Brak pliku w żądaniu.';
            console.error('[UPLOAD ERROR]', msg);
            return res.status(400).json({ message: msg });
        }

        const fileUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
        console.log(`[UPLOAD SUCCESS] Plik zapisany: ${req.file.path}`);
        res.status(200).json({ fileUrl });
    } catch (error) {
        console.error('[UPLOAD ERROR]', error.message);
        res.status(500).json({ message: 'Wystąpił błąd podczas przesyłania obrazu.', error: error.message });
    }
};

const addQuestion = async (req, res) => {
    try {
        const { content, type, setId } = req.body;
        const userId = req.user.id;

        const set = await Set.findOne({
            where: {
                id: setId,
                [Sequelize.Op.or]: [
                    { ownerId: userId },
                    Sequelize.literal(`JSON_CONTAINS_PATH(collaboratorsList, 'one', '$."${userId}"')`),
                ],
            },
        });

        if (!set) {
            return res.status(404).json({ message: 'Zestaw nie został odnaleziony lub brak uprawnień!' });
        }

        const newQuestion = await Question.create({
            content,
            type,
            setId,
        });

        res.status(201).json(newQuestion);
    } catch (error) {
        res.status(500).json({ message: 'Błąd podczas dodawania pytania.', error: error.message });
    }
};


const editQuestion = async (req, res) => {
    try {
        const { content, type } = req.body;
        const { id } = req.params;
        const userId = req.user.id;

        const question = await Question.findOne({
            where: { id },
            include: {
                model: Set,
                required: true,
                where: {
                    [Sequelize.Op.or]: [
                        { ownerId: userId },
                        Sequelize.literal(`JSON_CONTAINS_PATH(collaboratorsList, 'one', '$."${userId}"')`),
                    ],
                },
            },
        });

        if (!question) {
            return res.status(404).json({ message: 'Pytanie nie zostało znalezione lub brak uprawnień.' });
        }

        question.content = content || question.content;
        question.type = type || question.type;
        await question.save();

        res.status(200).json(question);
    } catch (error) {
        res.status(500).json({ message: 'Błąd podczas edycji pytania.', error: error.message });
    }
};

const deleteQuestion = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;

        const question = await Question.findOne({
            where: { id },
            include: {
                model: Set,
                required: true,
                where: {
                    [Sequelize.Op.or]: [
                        { ownerId: userId },
                        Sequelize.literal(`JSON_CONTAINS_PATH(collaboratorsList, 'one', '$."${userId}"')`),
                    ],
                },
            },
        });

        if (!question) {
            return res.status(404).json({ message: 'Pytanie nie zostało znalezione lub brak uprawnień.' });
        }

        await Answer.destroy({ where: { questionId: question.id } });
        await question.destroy();

        res.status(200).json({ message: 'Pytanie oraz powiązane odpowiedzi zostały usunięte.' });
    } catch (error) {
        res.status(500).json({ message: 'Błąd podczas usuwania pytania.', error: error.message });
    }
};


const getQuestionsBySet = async (req, res) => {
    try {
        const { setId } = req.params;
        const userId = req.user ? req.user.id : null;
        const userRole = req.user ? req.user.role : null;

        const whereCondition = userRole === 'admin'
            ? { id: setId } 
            : {
                id: setId,
                [Sequelize.Op.or]: [
                    { ownerId: userId }, 
                    Sequelize.literal(`JSON_CONTAINS_PATH(collaboratorsList, 'one', '$."${userId}"')`), 
                    { isPublic: true },
                ],
            };

        const set = await Set.findOne({
            where: whereCondition,
        });

        if (!set) {
            return res.status(403).json({ message: 'Brak dostępu do pytań tego zestawu.' });
        }

        const questions = await Question.findAll({
            where: { setId },
        });

        if (!questions.length) {
            return res.status(404).json({ message: 'Brak pytań dla tego zestawu.' });
        }

        res.status(200).json(questions);
    } catch (error) {
        res.status(500).json({ message: 'Błąd podczas pobierania pytań.', error: error.message });
    }
};

const getQuestionById = async (req, res) => {
    try {
        const { id } = req.params;

        const question = await Question.findOne({ where: { id } });

        if (!question) {
            return res.status(404).json({ message: 'Pytanie nie zostało znalezione.' });
        }

        res.status(200).json(question);
    } catch (error) {
        res.status(500).json({ message: 'Błąd podczas pobierania pytania.', error: error.message });
    }
};

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
async function checkQuestionEligibility(id, type) {
    const question = await Question.findByPk(id);
    if (!question) {
        throw new Error('Pytanie nie zostało znalezione');
    }

    const counts = await Answer.findAll({
        attributes: [
            [Sequelize.fn('COUNT', Sequelize.col('id')), 'totalAnswers'],
            [Sequelize.fn('SUM', Sequelize.literal('CASE WHEN isTrue = true THEN 1 ELSE 0 END')), 'correctAnswers']
        ],
        where: {
            questionId: id
        }
    });

    if (counts && counts[0]) {
        const { totalAnswers, correctAnswers } = counts[0].dataValues;
        return totalAnswers > 1 && correctAnswers > 0;
    }
    return false;
}

module.exports = {
    addQuestion,
    editQuestion,
    deleteQuestion,
    getQuestionsBySet,
    getQuestionById,
    updateQuestionType,
    checkQuestionEligibility,
    upload, 
    uploadImage,
    deleteImageByUrl,
};
