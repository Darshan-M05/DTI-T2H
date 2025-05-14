import React, { useState } from 'react';
import {
  Container,
  TextField,
  Select,
  MenuItem,
  Button,
  Grid,
  Paper,
  CircularProgress,
  Snackbar,
  Alert,
  Typography
} from '@mui/material';
import SwapHorizIcon from '@mui/icons-material/SwapHoriz';

const languages = [
  { code: 'en', name: 'English' },
  { code: 'es', name: 'Spanish' },
  { code: 'fr', name: 'French' },
  { code: 'de', name: 'German' },
  { code: 'it', name: 'Italian' },
  { code: 'pt', name: 'Portuguese' },
  { code: 'ru', name: 'Russian' },
  { code: 'zh', name: 'Chinese' },
  { code: 'ar', name: 'Arabic' },
  { code: 'hi', name: 'Hindi' },
  { code: 'ja', name: 'Japanese' },
  { code: 'ko', name: 'Korean' },
  { code: 'nl', name: 'Dutch' },
  { code: 'pl', name: 'Polish' },
  { code: 'tr', name: 'Turkish' },
  { code: 'sv', name: 'Swedish' },
  { code: 'fi', name: 'Finnish' },
  { code: 'no', name: 'Norwegian' },
  { code: 'da', name: 'Danish' }
];

function Translator() {
  const [sourceText, setSourceText] = useState('');
  const [translatedText, setTranslatedText] = useState('');
  const [sourceLang, setSourceLang] = useState('en');
  const [targetLang, setTargetLang] = useState('es');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleTranslate = async () => {
    if (!sourceText.trim()) return;
    setLoading(true);
    setError('');
    try {
      const response = await fetch('http://localhost:5000/api/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: sourceText, sourceLang, targetLang }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Translation failed');
      setTranslatedText(data.translatedText);
    } catch (err) {
      setError(err.message || 'Translation failed. Try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSpeech = () => {
    const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
    recognition.lang = sourceLang;
    recognition.start();

    recognition.onresult = (event) => {
      const spokenText = event.results[0][0].transcript;
      if (spokenText.toLowerCase() === 'translate') {
        handleTranslate();
      } else {
        setSourceText((prev) => prev + (prev ? ' ' : '') + spokenText);
      }
    };
  };

  return (
    <Container maxWidth="md" style={{ marginTop: '20px' }}>
      <Typography variant="h4" align="center" gutterBottom>
        Translator 
      </Typography>
      <Typography variant="subtitle1" align="center" gutterBottom>
        Speak or type text, then translate it instantly
      </Typography>
      <Paper style={{ padding: '20px' }}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={5}>
            <Select fullWidth value={sourceLang} onChange={(e) => setSourceLang(e.target.value)}>
              {languages.map((lang) => (
                <MenuItem key={lang.code} value={lang.code}>{lang.name}</MenuItem>
              ))}
            </Select>
            <TextField
              multiline
              rows={4}
              variant="outlined"
              fullWidth
              placeholder="Enter or speak text"
              value={sourceText}
              onChange={(e) => setSourceText(e.target.value)}
              style={{ marginTop: '10px' }}
            />
            <Button
              variant="contained"
              color="secondary"
              fullWidth
              onClick={handleSpeech}
              style={{ marginTop: '10px' }}
            >
              🎤 Speak
            </Button>
          </Grid>
          
          <Grid item xs={12} md={2} container justifyContent="center" alignItems="center">
            <Button
              variant="contained"
              color="primary"
              onClick={handleTranslate}
              disabled={loading}
              style={{ margin: '10px' }}
            >
              {loading ? <CircularProgress size={24} color="inherit" /> : 'Translate'}
            </Button>
          </Grid>
          
          <Grid item xs={12} md={5}>
            <Select fullWidth value={targetLang} onChange={(e) => setTargetLang(e.target.value)}>
              {languages.map((lang) => (
                <MenuItem key={lang.code} value={lang.code}>{lang.name}</MenuItem>
              ))}
            </Select>
            <TextField
              multiline
              rows={4}
              variant="outlined"
              fullWidth
              placeholder="Translation"
              value={translatedText}
              style={{ marginTop: '10px' }}
              disabled
            />
          </Grid>
        </Grid>
      </Paper>

      <Snackbar open={!!error} autoHideDuration={6000} onClose={() => setError('')}>
        <Alert onClose={() => setError('')} severity="error">{error}</Alert>
      </Snackbar>
    </Container>
  );
}

export default Translator;
