import React, { useState } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, XCircle, RefreshCw, Sparkles } from 'lucide-react';

export default function App() {
  const [file, setFile] = useState(null);
  const [level, setLevel] = useState('moyen');
  const [loading, setLoading] = useState(false);
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [isFinished, setIsFinished] = useState(false);
  const [error, setError] = useState('');

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setError('');
    }
  };

  const handleGenerate = async (e) => {
    e.preventDefault();
    if (!file) {
      setError('Veuillez sélectionner un fichier (PDF ou TXT).');
      return;
    }

    setLoading(true);
    setError('');

    const formData = new FormData();
    formData.append('file', file);
    formData.append('level', level);

    try {
      // Utilisation d'une URL dynamique pour la production / le local
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const response = await axios.post(`${API_URL}/api/generate-quiz`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (response.data.questions && response.data.questions.length > 0) {
        setQuestions(response.data.questions);
        setCurrentIndex(0);
        setScore(0);
        setIsFinished(false);
      } else {
        setError('Impossible de générer des questions à partir de ce fichier.');
      }
    } catch (err) {
      console.error(err);
      setError('Une erreur est survenue lors de la génération du quiz.');
    } finally {
      setLoading(false);
    }
  };

  const handleAnswer = (side) => {
    if (selectedAnswer !== null) return;

    const currentQ = questions[currentIndex];
    const isCorrect = currentQ.correct === side;

    setSelectedAnswer(side);
    if (isCorrect) {
      setScore((prev) => prev + 1);
    }

    setTimeout(() => {
      if (currentIndex + 1 < questions.length) {
        setCurrentIndex((prev) => prev + 1);
        setSelectedAnswer(null);
      } else {
        setIsFinished(true);
      }
    }, 1200);
  };

  const resetQuiz = () => {
    setQuestions([]);
    setFile(null);
    setScore(0);
    setCurrentIndex(0);
    setIsFinished(false);
    setSelectedAnswer(null);
  };

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <h1><Sparkles size={28} /> Quiz Generator AI</h1>
        <p>Transforme tes documents PDF ou TXT en cartes de révision</p>
      </header>

      {/* Formulaire de dépôt */}
      {questions.length === 0 && (
        <form onSubmit={handleGenerate} style={styles.card}>
          <div style={styles.inputGroup}>
            <label style={styles.label}>1. Choisis un fichier (PDF / TXT) :</label>
            <input 
              type="file" 
              accept=".pdf,.txt" 
              onChange={handleFileChange} 
              style={styles.fileInput}
            />
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>2. Niveau de difficulté :</label>
            <select value={level} onChange={(e) => setLevel(e.target.value)} style={styles.select}>
              <option value="facile">Facile</option>
              <option value="moyen">Moyen</option>
              <option value="difficile">Difficile</option>
            </select>
          </div>

          {error && <p style={styles.error}>{error}</p>}

          <button type="submit" disabled={loading} style={styles.button}>
            {loading ? 'Génération du quiz en cours...' : 'Générer le Quiz'}
          </button>
        </form>
      )}

      {/* Jeu de Cartes */}
      {questions.length > 0 && !isFinished && (
        <div style={styles.quizWrapper}>
          <div style={styles.progress}>
            Question {currentIndex + 1} / {questions.length} — Score : {score}
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={currentIndex}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.3 }}
              style={styles.quizCard}
            >
              <h3 style={styles.questionText}>
                {questions[currentIndex].question}
              </h3>

              <div style={styles.optionsContainer}>
                <button
                  onClick={() => handleAnswer('left')}
                  disabled={selectedAnswer !== null}
                  style={{
                    ...styles.optionBtn,
                    backgroundColor:
                      selectedAnswer === 'left'
                        ? questions[currentIndex].correct === 'left'
                          ? '#22c55e'
                          : '#ef4444'
                        : '#3b82f6',
                  }}
                >
                  {questions[currentIndex].optionLeft}
                </button>

                <button
                  onClick={() => handleAnswer('right')}
                  disabled={selectedAnswer !== null}
                  style={{
                    ...styles.optionBtn,
                    backgroundColor:
                      selectedAnswer === 'right'
                        ? questions[currentIndex].correct === 'right'
                          ? '#22c55e'
                          : '#ef4444'
                        : '#3b82f6',
                  }}
                >
                  {questions[currentIndex].optionRight}
                </button>
              </div>

              {selectedAnswer && (
                <div style={styles.feedback}>
                  {selectedAnswer === questions[currentIndex].correct ? (
                    <span style={{ color: '#22c55e' }}><CheckCircle2 /> Bonne réponse !</span>
                  ) : (
                    <span style={{ color: '#ef4444' }}><XCircle /> Mauvaise réponse...</span>
                  )}
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      )}

      {/* Écran de fin */}
      {isFinished && (
        <div style={styles.card}>
          <h2>Quiz Terminé ! 🎉</h2>
          <p style={{ fontSize: '1.2rem', margin: '20px 0' }}>
            Ton score final est de : <strong>{score} / {questions.length}</strong>
          </p>
          <button onClick={resetQuiz} style={styles.button}>
            <RefreshCw size={18} /> Recommencer avec un autre fichier
          </button>
        </div>
      )}
    </div>
  );
}

const styles = {
  container: { fontFamily: 'sans-serif', maxWidth: '600px', margin: '0 auto', padding: '20px', color: '#1e293b' },
  header: { textAlign: 'center', marginBottom: '30px' },
  card: { background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '24px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' },
  inputGroup: { marginBottom: '16px' },
  label: { display: 'block', fontWeight: 'bold', marginBottom: '8px' },
  fileInput: { display: 'block', width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1' },
  select: { width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '1rem' },
  button: { width: '100%', padding: '12px', backgroundColor: '#2563eb', color: '#fff', border: 'none', borderRadius: '6px', fontSize: '1rem', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' },
  error: { color: '#ef4444', marginBottom: '12px' },
  quizWrapper: { display: 'flex', flexDirection: 'column', alignItems: 'center' },
  progress: { fontSize: '1rem', fontWeight: 'bold', marginBottom: '16px' },
  quizCard: { background: '#ffffff', border: '2px solid #e2e8f0', borderRadius: '16px', padding: '30px', width: '100%', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)', textAlign: 'center' },
  questionText: { fontSize: '1.25rem', marginBottom: '24px' },
  optionsContainer: { display: 'flex', gap: '16px', justifyContent: 'center' },
  optionBtn: { flex: 1, padding: '16px', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '1rem', fontWeight: 'bold', cursor: 'pointer', transition: 'background-color 0.2s' },
  feedback: { marginTop: '20px', fontSize: '1.1rem', fontWeight: 'bold' }
};