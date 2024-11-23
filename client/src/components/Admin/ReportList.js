import React, { useEffect, useState } from 'react';
import styles from '../../styles/AdminDashboard.module.css';
import { FaSearch, FaCaretDown, FaCaretUp } from 'react-icons/fa';
import debounce from 'lodash.debounce';
import { Link } from 'react-router-dom'; 

const ReportList = () => {
  const [reports, setReports] = useState([]);
  const [editedStatuses, setEditedStatuses] = useState({});
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState(''); 
  const [sortOrder, setSortOrder] = useState('asc'); 
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchReports = async (page = 1) => {
    const token = localStorage.getItem('token');
    try {
      setLoading(true);
      const response = await fetch(`/api/report/reports?keyword=${encodeURIComponent(searchTerm)}&status=${statusFilter}&sortOrder=${sortOrder}&page=${page}&pageSize=10`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorMessage = await response.text();
        console.error('Błąd odpowiedzi:', errorMessage);
        throw new Error('Błąd serwera');
      }

      const data = await response.json();
      setReports(data.reports);
      setCurrentPage(parseInt(data.currentPage));
      setTotalPages(parseInt(data.totalPages));
      setError('');
    } catch (error) {
      console.error('Błąd podczas pobierania zgłoszeń:', error);
      setError('Nie udało się pobrać zgłoszeń.');
    } finally {
      setLoading(false);
    }
  };

  const debouncedFetchReports = debounce((page) => {
    fetchReports(page);
  }, 500);

  useEffect(() => {
    debouncedFetchReports(currentPage);
    return () => {
      debouncedFetchReports.cancel();
    };
  }, [searchTerm, currentPage, statusFilter, sortOrder]);

  const handleStatusSelect = (reportId, newStatus) => {
    setEditedStatuses(prev => ({
        ...prev,
        [reportId]: newStatus,
    }));
  };

  const handleSaveStatusChange = async (reportId) => {
    const token = localStorage.getItem('token');
    const newStatus = editedStatuses[reportId];
    
    try {
      const response = await fetch(`/api/report/admin/update-status/${reportId}`, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus }), 
      });
    

        if (!response.ok) {
            const errorMsg = await response.text();
            console.error('Błąd serwera:', errorMsg);
            throw new Error('Nie udało się zaktualizować statusu zgłoszenia');
        }

        const updatedReport = await response.json();
        setReports(reports.map(report => 
            report.id === reportId ? { 
                ...report, 
                status: newStatus,
                checked: newStatus === 'rozpatrzony' ? true : report.checked,
                checkedByName: newStatus === 'rozpatrzony' ? updatedReport.report.checkedByName : report.checkedByName
            } : report
        ));
        
        setEditedStatuses(prev => {
            const updated = { ...prev };
            delete updated[reportId];
            return updated;
        });

        fetchReports(currentPage);

        setMessage('Status zgłoszenia został zaktualizowany');
        setMessageType('success');
    } catch (error) {
        console.error('Błąd zmiany statusu zgłoszenia:', error);
        setMessage('Wystąpił błąd podczas zmiany statusu zgłoszenia');
        setMessageType('error');
    } finally {
        setTimeout(() => setMessage(''), 5000);
    }
  };


  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1); 
    fetchReports(1); 
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  const toggleSortOrder = () => {
    setSortOrder(prevOrder => (prevOrder === 'asc' ? 'desc' : 'asc'));
  };

  const handleStatusFilterChange = (e) => {
    setStatusFilter(e.target.value);
    setCurrentPage(1); 
  };

  return (
    <div className={styles.listContainer}>
      <h3>Lista zgłoszeń</h3>

      {message && (
        <div className={messageType === 'success' ? styles.successMessage : styles.errorMessage}>
          {message}
        </div>
      )}

      <div className={styles.searchContainer}>
        <input
          type="text"
          placeholder="Szukaj po nazwie zestawu"
          className={styles.searchInput}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <button className={styles.searchButton} onClick={handleSearch}>
          <FaSearch />
        </button>
      </div>

      {loading && <div>Ładowanie...</div>}
      {error && <div>Błąd: {error}</div>}

      <table className={styles.table}>
        <thead>
          <tr>
            <th>ID zgłoszenia</th>
            <th>ID zestawu</th>
            <th>Nazwa zestawu</th> 
            <th>Zgłaszający użytkownik</th>
            <th>Opis</th>
            <th>
              <span
                style={{ cursor: 'pointer' }}
                onClick={toggleSortOrder}
              >
                Data zgłoszenia
                {sortOrder === 'asc' ? <FaCaretUp /> : <FaCaretDown />}
              </span>
            </th>
            <th>
              <div style={{ position: 'relative', display: 'inline-block' }}>
                <span> 
                  Status 
                  <FaCaretDown />
                </span>
                <div className={styles.dropdown}>
                  <select
                    value={statusFilter}
                    onChange={handleStatusFilterChange}
                    className={styles.select}
                  >
                    <option value="">Wszystkie</option>
                    <option value="oczekujące">Oczekujące</option>
                    <option value="w trakcie">W trakcie</option>
                    <option value="rozpatrzony">Rozpatrzony</option>
                  </select>
                </div>
              </div>
            </th>
            <th>Sprawdzający</th>
            <th>Akcje</th>
          </tr>
        </thead>
        <tbody>
          {reports.map(report => (
            <tr key={report.id}> 
        <td>{report.id}</td>
        <td>
          {report.setId ? (
          <Link to={`/page-set/${report.setId}`} className={styles.setLink}>
            {report.setId}
          </Link>
          ) : (
        <span className={styles.deletedSet}>usunięty</span>
        )}
        </td> 
              <td>{report.setName}</td>
              <td>{report.userName}</td>
              <td>{report.description}</td>
              <td>{new Date(report.createdAt).toLocaleString()}</td>
              <td>
                <select
                  value={editedStatuses[report.id] || report.status}
                  onChange={(e) => handleStatusSelect(report.id, e.target.value)}
                >
                  <option value="oczekujące">Oczekujące</option>
                  <option value="w trakcie">W trakcie</option>
                  <option value="rozpatrzony">Rozpatrzony</option>
                </select>
              </td>
              <td>{report.checkedByName || 'Brak'}</td>
              <td>
                <button
                  onClick={() => handleSaveStatusChange(report.id)}
                  className={styles.saveButton}
                  disabled={!editedStatuses[report.id] || editedStatuses[report.id] === report.status}
                >
                  Zapisz zmiany
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className={styles.pagination}>
        <button 
          className={styles.pageButton}
          onClick={() => handlePageChange(currentPage - 1)} 
          disabled={currentPage === 1}
        >
          Poprzednia
        </button>
        <span>{currentPage} z {totalPages}</span>
        <button 
          className={styles.pageButton}
          onClick={() => handlePageChange(currentPage + 1)} 
          disabled={currentPage === totalPages}
        >
          Następna
        </button>
      </div>
    </div>
  );
};

export default ReportList;
