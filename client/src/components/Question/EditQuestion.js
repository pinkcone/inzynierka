import React, { useEffect, useState } from 'react';

const EditQuestion = ({ questionId, onClose, onEditComplete }) => {
  const [formData, setFormData] = useState({ content: '' });
  const [originalImageUrl, setOriginalImageUrl] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const fetchQuestion = async () => {
      try {
        const response = await fetch(`/api/questions/${questionId}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        if (response.ok) {
          const question = await response.json();
          
          // Wyodrębnianie URL obrazu z content
          let { content } = question;
          let imageUrl = '';
          const imageTagIndex = content.indexOf('[Image]:');
          if (imageTagIndex !== -1) {
            imageUrl = content.slice(imageTagIndex + '[Image]:'.length).trim();
            content = content.slice(0, imageTagIndex).trim();
          }
          setFormData({ content });
          setOriginalImageUrl(imageUrl);
        } else {
          const errorData = await response.json();
          setMessage(errorData.message || 'Nie udało się pobrać pytania.');
        }
      } catch (err) {
        setMessage('Błąd podczas pobierania pytania.');
      }
    };

    fetchQuestion();
  }, [questionId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0]);
  };

  const handleDeleteOldImage = async (oldImageUrl) => {
    if (!oldImageUrl) return true; // jeśli nie ma starego obrazu to nic nie robimy
    
    try {
      // Załóżmy, że backend obsługuje usuwanie poprzedniego obrazu np. po URL
      const response = await fetch('/api/questions/delete-image', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ imageUrl: oldImageUrl })
      });

      if (response.ok) {
        return true;
      } else {
        setMessage('Nie udało się usunąć poprzedniego obrazu.');
        return false;
      }
    } catch (error) {
      setMessage('Błąd sieci podczas usuwania poprzedniego obrazu.');
      return false;
    }
  };

  const handleUploadNewImage = async () => {
    if (!selectedFile) return { success: true, fileUrl: originalImageUrl }; // jeśli nie wybrano nowego pliku, używamy starego url

    const uploadData = new FormData();
    uploadData.append('file', selectedFile);

    try {
      const uploadResponse = await fetch('/api/questions/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: uploadData
      });

      if (!uploadResponse.ok) {
        let errorMsg = 'Błąd podczas przesyłania obrazu.';
        try {
          const errorData = await uploadResponse.json();
          if (errorData.message) {
            errorMsg = `Błąd podczas przesyłania obrazu: ${errorData.message}`;
          }
        } catch (parseError) {
          // Ignorujemy błąd parsowania
        }
        setMessage(errorMsg);
        return { success: false };
      }

      const uploadResult = await uploadResponse.json();
      return { success: true, fileUrl: uploadResult.fileUrl };
    } catch (error) {
      setMessage('Błąd sieci przy wysyłaniu obrazu.');
      return { success: false };
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');

    // Jeśli wybrano nowy plik, a jest stary obraz, usuwamy stary
    if (selectedFile && originalImageUrl) {
      const deleteSuccess = await handleDeleteOldImage(originalImageUrl);
      if (!deleteSuccess) {
        return; // jeśli nie udało się usunąć starego obrazka, przerywamy
      }
    }

    // Wgrywamy nowy obraz (jeśli jest)
    const { success, fileUrl } = await handleUploadNewImage();
    if (!success) {
      return; // błąd w uploadzie
    }

    // Budujemy finalną treść pytania
    let finalContent = formData.content.trim();
    if (fileUrl) {
      finalContent += `\n\n[Image]: ${fileUrl}`;
    }

    try {
      const response = await fetch(`/api/questions/edit/${questionId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ content: finalContent })
      });

      if (response.ok) {
        setMessage('Pytanie zostało zaktualizowane!');
        onEditComplete();
        onClose();
      } else {
        const errorData = await response.json();
        setMessage(errorData.message || 'Błąd podczas edycji pytania.');
      }
    } catch (error) {
      setMessage('Błąd sieci, spróbuj ponownie.');
    }
  };

  return (
    <div>
      <h2>Edytuj pytanie</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Treść pytania:</label>
          <textarea
            name="content"
            value={formData.content}
            onChange={handleChange}
            rows="4"
            cols="50"
            required
          />
        </div>
        
        {originalImageUrl && (
          <div>
            <p>Obecne zdjęcie:</p>
            <img src={originalImageUrl} alt="Obraz do pytania" style={{ maxWidth: '200px', height: 'auto' }} />
          </div>
        )}

        <div>
          <label>
            {originalImageUrl ? 'Podmień zdjęcie:' : 'Dodaj zdjęcie:'}
          </label>
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
          />
        </div>

        {message && <p>{message}</p>}

        <button type="submit">Zapisz zmiany</button>
        <button type="button" onClick={onClose}>Anuluj</button>
      </form>
    </div>
  );
};

export default EditQuestion;
