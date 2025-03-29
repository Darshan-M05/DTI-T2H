import React, { useState } from 'react';
import {
  Container,
  TextField,
  Select,
  MenuItem,
  Button,
  Grid,
  Paper,
  styled,
  CircularProgress,
  Snackbar,
  Alert,
  FormControl,
  InputLabel,
  Box,
} from '@mui/material';
import SwapHorizIcon from '@mui/icons-material/SwapHoriz';

// Replace makeStyles with styled components
const StyledContainer = styled(Container)(({ theme }) => ({
  marginTop: theme.spacing(4),
  marginBottom: theme.spacing(4),
}));

const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
}));

const StyledTextField = styled(TextField)(({ theme }) => ({
  width: '100%',
  marginBottom: theme.spacing(2),
}));

const StyledSelect = styled(Select)(({ theme }) => ({
  width: '100%',
  marginBottom: theme.spacing(2),
}));

const StyledButton = styled(Button)(({ theme }) => ({
  margin: theme.spacing(2),
}));

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
  { code: 'tr', name: 'Turkish' }
];

// Update handwriting styles
const handwritingStyles = [
  { name: 'Regular Text', value: 'none' },
  { name: 'Casual Handwriting', value: 'caveat' },
  { name: 'Elegant Script', value: 'dancing-script' },
  { name: 'Fun Handwriting', value: 'indie-flower' },
  { name: 'Natural Handwriting', value: 'homemade-apple' },
  { name: 'Neat Handwriting', value: 'patrick-hand' },
  { name: 'Quick Notes', value: 'shadows-into-light' },
  { name: 'Casual Notes', value: 'covered-by-your-grace' },
  { name: 'Chalk Style', value: 'rock-salt' }
];

function Translator() {
  const [sourceText, setSourceText] = useState('');
  const [translatedText, setTranslatedText] = useState('');
  const [sourceLang, setSourceLang] = useState('en');
  const [targetLang, setTargetLang] = useState('es');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedStyle, setSelectedStyle] = useState('none');
  const [fontFamily, setFontFamily] = useState('inherit');

  const handleTranslate = async () => {
    try {
      setLoading(true);
      setError('');

      const response = await fetch('http://localhost:5000/api/translate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: sourceText,
          sourceLang,
          targetLang,
          handwritingStyle: selectedStyle
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Translation failed');
      }

      setTranslatedText(data.translatedText);
      setFontFamily(data.fontFamily);
    } catch (err) {
      console.error('Frontend error:', err);
      setError(err.message || 'Translation failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSwapLanguages = () => {
    const tempLang = sourceLang;
    setSourceLang(targetLang);
    setTargetLang(tempLang);
    setSourceText(translatedText);
    setTranslatedText(sourceText);
  };

  // Function to determine the script of the text
  const getTextScript = (text) => {
    const scripts = {
      ja: /[\u3040-\u30ff\u3400-\u4dbf\u4e00-\u9fff]/,
      zh: /[\u4e00-\u9fff\u3400-\u4dbf]/,
      ko: /[\uac00-\ud7af\u1100-\u11ff]/,
      ru: /[\u0400-\u04FF]/,
    };

    for (const [script, regex] of Object.entries(scripts)) {
      if (regex.test(text)) return script;
    }
    return 'en';
  };

  // Function to get appropriate font size based on script
  const getFontSize = (text, style) => {
    if (style === 'none') return 'inherit';
    const script = getTextScript(text);
    switch (script) {
      case 'ja':
      case 'zh':
      case 'ko':
        return '1.5rem';
      case 'ru':
        return '1.3rem';
      default:
        return '1.25rem';
    }
  };

  return (
    <StyledContainer maxWidth="md">
      <StyledPaper>
        <Grid container spacing={3}>
          <Grid item xs={12} md={5}>
            <StyledSelect
              value={sourceLang}
              onChange={(e) => setSourceLang(e.target.value)}
            >
              {languages.map((lang) => (
                <MenuItem key={lang.code} value={lang.code}>
                  {lang.name}
                </MenuItem>
              ))}
            </StyledSelect>
            <StyledTextField
              multiline
              rows={4}
              variant="outlined"
              placeholder="Enter text to translate"
              value={sourceText}
              onChange={(e) => setSourceText(e.target.value)}
            />
          </Grid>

          <Grid item xs={12} md={2} container justifyContent="center" alignItems="center">
            <StyledButton
              variant="contained"
              color="primary"
              onClick={handleSwapLanguages}
              disabled={loading}
            >
              <SwapHorizIcon />
            </StyledButton>
          </Grid>

          <Grid item xs={12} md={5}>
            <StyledSelect
              value={targetLang}
              onChange={(e) => setTargetLang(e.target.value)}
            >
              {languages.map((lang) => (
                <MenuItem key={lang.code} value={lang.code}>
                  {lang.name}
                </MenuItem>
              ))}
            </StyledSelect>
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Handwriting Style</InputLabel>
              <Select
                value={selectedStyle}
                onChange={(e) => setSelectedStyle(e.target.value)}
                label="Handwriting Style"
              >
                {handwritingStyles.map((style) => (
                  <MenuItem key={style.value} value={style.value}>
                    {style.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <StyledTextField
              multiline
              rows={4}
              variant="outlined"
              placeholder="Translation"
              value={translatedText}
              onChange={(e) => setTranslatedText(e.target.value)}
              sx={{ 
                fontFamily: fontFamily,
                fontSize: getFontSize(translatedText, selectedStyle),
                lineHeight: '1.8',
                '& .MuiOutlinedInput-input': {
                  fontFamily: fontFamily,
                  fontSize: getFontSize(translatedText, selectedStyle),
                  writingMode: getTextScript(translatedText) === 'ja' || getTextScript(translatedText) === 'zh' ? 'vertical-rl' : 'horizontal-tb',
                },
                '& .MuiOutlinedInput-root': {
                  '& fieldset': {
                    borderColor: 'rgba(0, 0, 0, 0.23)',
                  },
                  '&:hover fieldset': {
                    borderColor: 'rgba(0, 0, 0, 0.87)',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: '#1976d2',
                  },
                },
              }}
              lang={getTextScript(translatedText)}
              className="handwriting-text"
            />
          </Grid>

          <Grid item xs={12} container justifyContent="center">
            <Button
              variant="contained"
              color="primary"
              onClick={handleTranslate}
              disabled={!sourceText || loading}
            >
              {loading ? <CircularProgress size={24} color="inherit" /> : 'Translate'}
            </Button>
          </Grid>
        </Grid>
      </StyledPaper>

      <Snackbar 
        open={!!error} 
        autoHideDuration={6000} 
        onClose={() => setError('')}
      >
        <Alert onClose={() => setError('')} severity="error">
          {error}
        </Alert>
      </Snackbar>
    </StyledContainer>
  );
}

export default Translator; 