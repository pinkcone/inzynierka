const { Sequelize } = require('../config/sequelize');
const { Op } = require('sequelize'); // Upewnij się, że importujesz Op, jeśli go używasz

const Set = require('../models/Set');
const User = require('../models/User');
const Report = require('../models/Report'); 


const createReport = async (req, res) => {
    const { setId, description } = req.body;
    const userId = req.user.id;

    console.log('Otrzymano żądanie utworzenia zgłoszenia:', req.body);
    console.log('ID użytkownika:', userId);

    try {
        // Sprawdzanie, czy zestaw istnieje
        const set = await Set.findByPk(setId);
        if (!set) {
            console.error('Zestaw nie istnieje:', setId);
            return res.status(404).json({ message: 'Zestaw nie istnieje.' });
        }

        // Sprawdzamy, czy użytkownik już zgłosił ten zestaw
        const existingReport = await Report.findOne({ 
            where: {
                userId,
                setId
            }
        });

        if (existingReport) {
            return res.status(400).json({ message: 'Ten zestaw został już zgłoszony przez Ciebie.' });
        }

        // Tworzymy nowe zgłoszenie
        const report = await Report.create({
            userId,
            setId,
            description,
            status: 'oczekujące',
        });

        console.log('Zgłoszenie utworzone:', report);
        return res.status(201).json({
            message: 'Zgłoszenie zostało pomyślnie utworzone.',
            report
        });
    } catch (error) {
        console.error('Błąd podczas tworzenia zgłoszenia:', error);
        return res.status(500).json({ message: 'Błąd podczas tworzenia zgłoszenia.', error: error.message });
    }
};

const checkIfReported = async (req, res) => {
    const { setId } = req.params;  // Pobierz setId z parametrów
    const userId = req.user.id;    // Pobierz userId z tokena lub sesji (w zależności od implementacji)

    try {
        // Sprawdzamy, czy użytkownik już zgłosił ten zestaw
        const existingReport = await Report.findOne({ 
            where: {
                userId,
                setId
            }
        });

        if (existingReport) {
            return res.status(200).json({ reported: true });  // Użytkownik już zgłosił ten zestaw
        }

        return res.status(200).json({ reported: false }); // Użytkownik nie zgłosił jeszcze tego zestawu
    } catch (error) {
        console.error('Błąd podczas sprawdzania zgłoszenia:', error);
        return res.status(500).json({ message: 'Błąd podczas sprawdzania zgłoszenia.', error: error.message });
    }
};

const getAllReports = async (req, res) => {
    try {
        const { keyword = '', page = 1, pageSize = 10 } = req.query;

        // Ustawienie wartości page i pageSize, aby były liczbami
        const parsedPage = isNaN(page) ? 1 : parseInt(page);
        const parsedPageSize = isNaN(pageSize) ? 10 : parseInt(pageSize);

        const offset = (parsedPage - 1) * parsedPageSize;

        // Warunki wyszukiwania raportów (opcja wyszukiwania po słowach kluczowych)
        const whereClause = {
            [Op.or]: [
                { description: { [Op.like]: `%${keyword}%` } }, // Wyszukiwanie w opisie
            ],
        };

        // Zapytanie do bazy danych z paginacją i wyszukiwaniem
        const { count, rows } = await Report.findAndCountAll({
            where: whereClause,
            include: [
                {
                    model: User,
                    as: 'user', // Alias dla właściciela raportu
                    attributes: ['id', 'username'], // Pobierz ID i nazwę użytkownika
                },
                {
                    model: User,
                    as: 'checkedBy', // Alias dla użytkownika, który sprawdził raport
                    attributes: ['id', 'username'], // Pobierz ID i nazwę użytkownika
                },
                {
                    model: Set,
                    as: 'set', // Alias dla zestawu
                    attributes: ['id', 'name'], // Pobierz ID i nazwę zestawu
                },
            ],
            limit: parsedPageSize,
            offset,
            logging: console.log,
        });

        const totalPages = count > 0 ? Math.ceil(count / parsedPageSize) : 1;

        // Formatujemy odpowiedź, aby zawierała nazwę zestawu
        res.json({
            reports: rows.map((report) => ({
                id: report.id,
                description: report.description,
                setId: report.setId,
                setName: report.set ? report.set.name : 'Brak nazwy zestawu',
                userId: report.userId,
                userName: report.user ? report.user.username : 'Brak użytkownika',
                checkedById: report.checkedById,
                checkedByName: report.checkedBy ? report.checkedBy.username : 'Brak użytkownika',
                createdAt: report.createdAt,
                status: report.status,
            })),
            currentPage: parsedPage,
            totalPages,
        });
    } catch (error) {
        console.error("Błąd podczas pobierania raportów:", error);
        res.status(500).json({ message: 'Błąd serwera', error: error.message });
    }
};


const updateReportStatus = async (req, res) => {
    const { reportId } = req.params;
    const { status } = req.body;
    const userId = req.user?.id;

    if (!userId) {
        return res.status(401).json({ message: 'Nie można uzyskać ID użytkownika' });
    }

    try {
        const report = await Report.findByPk(reportId);
        if (!report) {
            return res.status(404).json({ message: 'Zgłoszenie nie istnieje.' });
        }

        if (status === 'rozpatrzony') {
            report.checked = true;
            report.checkedById = userId;
        }

        report.status = status;
        await report.save();

        return res.status(200).json({
            message: 'Status zgłoszenia został zaktualizowany.',
            report,
        });
    } catch (error) {
        console.error('Błąd podczas aktualizacji statusu zgłoszenia:', error);
        return res.status(500).json({
            message: 'Błąd podczas aktualizacji statusu zgłoszenia.',
            error: error.message,
        });
    }
};



module.exports = {
    createReport,
    checkIfReported,
    getAllReports,
    updateReportStatus
};
