import React from 'react';
import { Button } from '@mui/material';
import jsPDF from 'jspdf';

const HandwritingDownload = ({ canvasRef }) => {
  const downloadAsPDF = () => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const canvasWidth = canvas.width;
    const canvasHeight = canvas.height;

    const pageWidth = 595.28; // A4 width in pt
    const pageHeight = 841.89; // A4 height in pt
    const margin = 40; // Top and bottom margin
    const usablePageHeight = pageHeight - 2 * margin;

    const scale = pageWidth / canvasWidth;
    const scaledCanvasHeight = canvasHeight * scale;

    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'pt',
      format: 'a4',
    });

    const imgData = canvas.toDataURL('image/png');
    const totalPages = Math.ceil(scaledCanvasHeight / usablePageHeight);

    for (let i = 0; i < totalPages; i++) {
      if (i > 0) pdf.addPage();

      const sourceY = i * (usablePageHeight / scale); // Y offset in canvas units
      const sliceHeight = usablePageHeight / scale;

      // Create a temp canvas to hold the cropped slice
      const tempCanvas = document.createElement('canvas');
      tempCanvas.width = canvasWidth;
      tempCanvas.height = sliceHeight;

      const tempCtx = tempCanvas.getContext('2d');
      tempCtx.drawImage(canvas, 0, sourceY, canvasWidth, sliceHeight, 0, 0, canvasWidth, sliceHeight);

      const slicedImage = tempCanvas.toDataURL('image/png');

      pdf.addImage(
        slicedImage,
        'PNG',
        0,
        margin,
        pageWidth,
        usablePageHeight
      );
    }

    pdf.save('handwritten-text.pdf');
  };

  return (
    <Button
      variant="contained"
      color="secondary"
      onClick={downloadAsPDF}
      style={{ width: '160px', marginTop: '10px', marginLeft: '10px' }}
    >
      Download as PDF
    </Button>
  );
};

export default HandwritingDownload;
