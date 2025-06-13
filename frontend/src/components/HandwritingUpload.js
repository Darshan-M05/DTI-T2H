import React, { useState, useRef } from 'react';
import '../App.css';
import { Container, TextField, Button, Typography, Paper, Grid } from '@mui/material';
import FileUpload from './FileUpload';
import HandwritingDownload from './HandwritingDownload';

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
    const start = performance.now();

    if (fontFile && text && canvasRef.current) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const font = new FontFace('CustomFont', e.target.result);
        font.load().then((loadedFont) => {
          document.fonts.add(loadedFont);

          const ctx = canvasRef.current.getContext('2d');
          ctx.font = '48px CustomFont';

          const maxWidth = canvasRef.current.width - 20;
          const lineHeight = 55;
          const words = text.split(' ');

          let line = '';
          let lines = [];

          for (let i = 0; i < words.length; i++) {
            let testLine = line + words[i] + ' ';
            let testWidth = ctx.measureText(testLine).width;
            if (testWidth > maxWidth && i > 0) {
              lines.push(line);
              line = words[i] + ' ';
            } else {
              line = testLine;
            }
          }
          lines.push(line);

          const requiredHeight = lines.length * lineHeight + 20;
          canvasRef.current.height = requiredHeight;

          ctx.font = '48px CustomFont';
          ctx.textBaseline = 'top';
          ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);

          let y = 10;
          for (let l of lines) {
            ctx.fillText(l, 10, y);
            y += lineHeight;
          }

          const end = performance.now();
          console.log(`Rendered handwriting in ${(end - start).toFixed(2)} ms`);
        });
      };
      reader.readAsArrayBuffer(fontFile);
    }
  };

  const downloadImage = () => {
    const start = performance.now();

    if (canvasRef.current) {
      const link = document.createElement('a');
      link.download = 'text-image.png';
      link.href = canvasRef.current.toDataURL();
      link.click();

      const end = performance.now();
      console.log(`Downloaded handwriting image in ${(end - start).toFixed(2)} ms`);
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
            <FileUpload onTextExtracted={setText} />

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
            <canvas
              ref={canvasRef}
              width="600"
              height="300"
              style={{ border: '1px solid black', width: '100%', marginTop: '10px' }}
            ></canvas>
            <div style={{ display: 'flex', justifyContent: 'center', marginTop: '10px' }}>
              <Button
                variant="contained"
                color="secondary"
                onClick={downloadImage}
                style={{ width: '160px' }}
              >
                Download Image
              </Button>
              <HandwritingDownload canvasRef={canvasRef} />
            </div>
          </Grid>
        </Grid>
      </Paper>
    </Container>
  );
}

export default HandwritingUpload;
