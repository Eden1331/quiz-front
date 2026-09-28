import React, { useState } from 'react';
import axios from 'axios';

function App() {
  const [file, setFile] = useState(null);
  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(false);

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleUpload = async () => {
    if (!file) return alert("Choisis un fichier d'abord !");
    setLoading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await axios.post(`${API_URL}/api/generate-quiz`, formData);
      setQuiz(res.data);
    } catch (err) {
      console.error(err);
      alert("Erreur lors de la génération du quiz.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '2rem', fontFamily: 'sans-serif', textAlign: 'center' }}>
      <h1>Générateur de Quiz IA</h1>
      <input type="file" onChange={handleFileChange} accept=".pdf,.txt" />
      <button onClick={handleUpload} disabled={loading} style={{ marginLeft: '10px' }}>
        {loading ? 'Génération...' : 'Générer le Quiz'}
      </button>

      {quiz && (
        <div style={{ marginTop: '2rem', textAlign: 'left' }}>
          <h2>Ton Quiz :</h2>
          <pre style={{ background: '#f4f4f4', padding: '1rem', borderRadius: '8px' }}>
            {JSON.stringify(quiz, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}

export default App;