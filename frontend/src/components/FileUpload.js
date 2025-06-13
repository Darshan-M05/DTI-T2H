import React, { useState } from 'react';
import mammoth from 'mammoth';

const FileUpload = ({ onTextExtracted }) => {
  const [fileName, setFileName] = useState('');
  const [error, setError] = useState('');

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const extension = file.name.split('.').pop().toLowerCase();
    if (extension !== 'docx') {
      setError('Only DOCX files are supported.');
      return;
    }

    setFileName(file.name);
    setError('');
    extractTextFromDocx(file);
  };

  const extractTextFromDocx = async (file) => {
    try {
      const reader = new FileReader();
      reader.onload = async function (event) {
        const arrayBuffer = event.target.result;
        const { value: text } = await mammoth.extractRawText({ arrayBuffer });
        onTextExtracted(text); // ✅ Pass text to parent
      };
      reader.readAsArrayBuffer(file);
    } catch (err) {
      console.error(err);
      setError('Failed to extract text from DOCX file.');
    }
  };

  return (
    <div>
      <h3>Upload a DOCX file</h3>
      <input type="file" accept=".docx" onChange={handleFileUpload} />
      <p><strong>Uploaded File:</strong> {fileName}</p>
      {error && <p style={{ color: 'red' }}>{error}</p>}
    </div>
  );
};

export default FileUpload;
