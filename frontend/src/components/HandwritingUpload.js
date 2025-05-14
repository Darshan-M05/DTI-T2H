import React, { useState, useRef } from 'react';
import '../App.css';
import { Container, TextField, Button, Typography, Paper, Grid } from '@mui/material';

function HandwritingUpload() {
  const [fontFile, setFontFile] = useState(null);
  const [text, setText] = useState('');
  const canvasRef = useRef(null);

  const handleFileChange = (event) => {
    setFontFile(event.target.files[0]);
  };

  const handleTextChange = (event) => {
    setText(event.target.value);
  };

  const renderText = () => {
    if (fontFile && text && canvasRef.current) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const font = new FontFace('CustomFont', e.target.result);
        font.load().then(() => {
          document.fonts.add(font);
          const ctx = canvasRef.current.getContext('2d');
          ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
          ctx.font = '48px CustomFont';
          ctx.textBaseline = 'top';

          const maxWidth = canvasRef.current.width - 20;
          const lineHeight = 55;
          let x = 10;
          let y = 10;
          const words = text.split(' ');
          let line = '';

          for (let i = 0; i < words.length; i++) {
            let testLine = line + words[i] + ' ';
            let testWidth = ctx.measureText(testLine).width;
            if (testWidth > maxWidth && i > 0) {
              ctx.fillText(line, x, y);
              line = words[i] + ' ';
              y += lineHeight;
            } else {
              line = testLine;
            }
          }
          ctx.fillText(line, x, y);
        });
      };
      reader.readAsArrayBuffer(fontFile);
    }
  };

  const downloadImage = () => {
    if (canvasRef.current) {
      const link = document.createElement('a');
      link.download = 'text-image.png';
      link.href = canvasRef.current.toDataURL();
      link.click();
    }
  };

  const handleSpeech = () => {
    const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
    recognition.lang = 'en-US';
    recognition.start();
  
    recognition.onresult = (event) => {
      const spokenText = event.results[0][0].transcript.toLowerCase();
      if (spokenText === 'render') {
        renderText();
      } else if (spokenText === 'download') {
        downloadImage();
      } else {
        setText((prev) => prev + (prev ? ' ' : '') + spokenText);
      }
    };
  };

  return (
    <Container maxWidth="md" style={{ marginTop: '20px' }}>
      <Paper style={{ padding: '20px', textAlign: 'center' }}>
        <Typography variant="h4" align="left" gutterBottom>
          Customized Handwriting Renderer
        </Typography>
        <Grid container spacing={3} justifyContent="center">
          <Grid item xs={12} sm={6}>
            <input type="file" accept=".ttf" onChange={handleFileChange} style={{ marginBottom: '10px' }} />
            <TextField
              multiline
              rows={4}
              variant="outlined"
              fullWidth
              placeholder="Enter your text here"
              value={text}
              onChange={handleTextChange}
            />
            <Button
              variant="contained"
              color="primary"
              onClick={handleSpeech}
              style={{ width: '120px', marginTop: '10px' }}
            >
              🎤 Speak
            </Button>
            <Button
              variant="contained"
              color="primary"
              onClick={renderText}
              style={{ width: '120px', marginTop: '10px', marginLeft: '10px' }}
            >
              Render Text
            </Button>
          </Grid>
          <Grid item xs={12} sm={6}>
            <canvas ref={canvasRef} width="600" height="300" style={{ border: '1px solid black', width: '100%', marginTop: '10px' }}></canvas>
            <Button
              variant="contained"
              color="secondary"
              onClick={downloadImage}
              style={{ width: '120px', marginTop: '10px' }}
            >
              Download Image
            </Button>
          </Grid>
        </Grid>
      </Paper>
    </Container>
  );
}

export default HandwritingUpload;
