const { Sequelize } = require('../config/sequelize');
const { Op } = require('sequelize'); 
const Set = require('../models/Set');
const User = require('../models/User');
const Report = require('../models/Report'); 


const createReport = async (req, res) => {
    const { setId, description } = req.body;
    const userId = req.user.id;

    console.log('Otrzymano żądanie utworzenia zgłoszenia:', req.body);
    console.log('ID użytkownika:', userId);

    try {
        const set = await Set.findByPk(setId);
        if (!set) {
            console.error('Zestaw nie istnieje:', setId);
            return res.status(404).json({ message: 'Zestaw nie istnieje.' });
        }

        const existingReport = await Report.findOne({ 
            where: {
                userId,
                setId
            }
        });

        if (existingReport) {
            return res.status(400).json({ message: 'Ten zestaw został już zgłoszony przez Ciebie.' });
        }

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
    const { setId } = req.params; 
    const userId = req.user.id;   

    try {
        const existingReport = await Report.findOne({ 
            where: {
                userId,
                setId
            }
        });

        if (existingReport) {
            return res.status(200).json({ reported: true });  
        }

        return res.status(200).json({ reported: false }); 
    } catch (error) {
        console.error('Błąd podczas sprawdzania zgłoszenia:', error);
        return res.status(500).json({ message: 'Błąd podczas sprawdzania zgłoszenia.', error: error.message });
    }
};

const getAllReports = async (req, res) => {
    try {
      const { keyword = '', status = '', page = 1, pageSize = 10, sortOrder = 'asc' } = req.query;
  
      const parsedPage = isNaN(page) ? 1 : parseInt(page);
      const parsedPageSize = isNaN(pageSize) ? 10 : parseInt(pageSize);
      const offset = (parsedPage - 1) * parsedPageSize;
  
      const whereClause = {
        '$set.name$': { [Op.like]: `%${keyword}%` }, 
      };
  
      if (status) {
        whereClause.status = status;
      }
  
      const { count, rows } = await Report.findAndCountAll({
        where: whereClause,
        include: [
          {
            model: User,
            as: 'user', 
            attributes: ['id', 'username'], 
          },
          {
            model: User,
            as: 'checkedBy', 
            attributes: ['id', 'username'],
          },
          {
            model: Set,
            as: 'set', 
            attributes: ['id', 'name'], 
          },
        ],
        limit: parsedPageSize,
        offset,
        order: [
          ['createdAt', sortOrder], 
        ],
      });
  
      const totalPages = count > 0 ? Math.ceil(count / parsedPageSize) : 1;
  
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
