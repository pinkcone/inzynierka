import React, { useState } from 'react';

const AddQuestion = ({ setId, onQuestionAdded }) => {
  const [formData, setFormData] = useState({ content: '' });
  const [selectedFile, setSelectedFile] = useState(null);
  const [message, setMessage] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');

    let imageUrl = '';

    if (selectedFile) {
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
            } else if (errorData.error) {
              errorMsg = `Błąd podczas przesyłania obrazu: ${errorData.error}`;
            }
          } catch (parseError) {
          }
          setMessage(errorMsg);
          return;
        }

        const uploadResult = await uploadResponse.json();
        imageUrl = uploadResult.fileUrl;  
      } catch (error) {
        setMessage('Błąd sieci przy wysyłaniu obrazu, spróbuj ponownie.');
        return;
      }
    }

    const finalContent = imageUrl ? `${formData.content}\n\n[Image]: ${imageUrl}` : formData.content;

    try {
      const response = await fetch(`/api/questions/add`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ content: finalContent, setId })
      });

      if (response.ok) {
        const result = await response.json();
        setMessage('Pytanie zostało dodane!');
        setFormData({ content: '' });
        setSelectedFile(null);
        onQuestionAdded(result.id, finalContent);
      } else {
        setMessage('Wystąpił błąd podczas dodawania pytania.');
      }
    } catch (error) {
      setMessage('Błąd sieci, spróbuj ponownie.');
    }
  };

  return (
    <div className="container">
      <h2>Dodaj pytanie</h2>
      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label htmlFor="content">Treść pytania:</label>
          <input
            type="text"
            id="content"
            name="content"
            className="form-control"
            value={formData.content}
            onChange={handleChange}
            required={true}
          />
        </div>
        
        <div className="mb-3">
          <label htmlFor="fileInput">Zdjęcie (opcjonalne):</label>
          <input
            type="file"
            id="fileInput"
            className="form-control"
            accept="image/*"
            onChange={handleFileChange}
          />
        </div>

        <button type="submit" className="btn btn-primary">Dodaj Pytanie</button>
        {message && <p>{message}</p>}
      </form>
    </div>
  );
};

export default AddQuestion;
