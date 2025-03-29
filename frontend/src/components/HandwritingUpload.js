// src/App.js
import React, { useState, useRef } from 'react';
import '../App.css';

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
          ctx.fillText(text, 10, 50);
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

  return (
    <div className="container">
      <h1>Font Renderer</h1>
      <input type="file" accept=".ttf" onChange={handleFileChange} />
      <textarea type="text" value={text} onChange={handleTextChange} placeholder="Enter your text here" />
      <button onClick={renderText}>Render Text</button>
      <canvas ref={canvasRef} width="1400" height="100"></canvas>
      <button onClick={downloadImage}>Download Image</button>
    </div>
  );
}

export default HandwritingUpload;