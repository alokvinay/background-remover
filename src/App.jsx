import React, { useState, useRef } from 'react';
import { Container, Box, Button, Slider, Typography, IconButton, Paper } from '@mui/material';
import { Upload, Download, Clear } from '@mui/icons-material';

function App() {
  const [image, setImage] = useState(null);
  const [processedImage, setProcessedImage] = useState(null);
  const [tolerance, setTolerance] = useState(30);
  const canvasRef = useRef(null);
  const fileInputRef = useRef(null);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setImage(event.target.result);
        setProcessedImage(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeBackground = () => {
    if (!image) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.onload = () => {
      // Set canvas dimensions
      canvas.width = img.width;
      canvas.height = img.height;

      // Draw the image
      ctx.drawImage(img, 0, 0);

      // Get image data
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;

      // Sample the color at the top-left corner (assuming it's the background)
      const r = data[0];
      const g = data[1];
      const b = data[2];

      // Remove similar colors (basic color distance algorithm)
      for (let i = 0; i < data.length; i += 4) {
        const dr = Math.abs(data[i] - r);
        const dg = Math.abs(data[i + 1] - g);
        const db = Math.abs(data[i + 2] - b);
        
        const distance = Math.sqrt(dr * dr + dg * dg + db * db);
        
        if (distance < tolerance) {
          data[i + 3] = 0; // Set alpha to 0 (transparent)
        }
      }

      ctx.putImageData(imageData, 0, 0);
      setProcessedImage(canvas.toDataURL());
    };

    img.src = image;
  };

  const downloadImage = () => {
    if (!processedImage) return;
    
    const link = document.createElement('a');
    link.download = 'background-removed.png';
    link.href = processedImage;
    link.click();
  };

  const resetAll = () => {
    setImage(null);
    setProcessedImage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <Container maxWidth="md" sx={{ my: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom align="center">
        Standalone Background Remover
      </Typography>
      
      <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mb: 3 }}>
          <Button
            variant="contained"
            component="label"
            startIcon={<Upload />}
          >
            Upload Image
            <input
              ref={fileInputRef}
              type="file"
              hidden
              accept="image/*"
              onChange={handleImageUpload}
            />
          </Button>
          
          <Button
            variant="contained"
            color="primary"
            onClick={removeBackground}
            disabled={!image}
            startIcon={<Clear />}
          >
            Remove Background
          </Button>
          
          <Button
            variant="contained"
            color="success"
            onClick={downloadImage}
            disabled={!processedImage}
            startIcon={<Download />}
          >
            Download
          </Button>
          
          <Button
            variant="outlined"
            color="error"
            onClick={resetAll}
          >
            Reset
          </Button>
        </Box>
        
        <Box sx={{ mb: 3 }}>
          <Typography gutterBottom>
            Color Tolerance: {tolerance}
          </Typography>
          <Slider
            value={tolerance}
            onChange={(e, newValue) => setTolerance(newValue)}
            min={0}
            max={100}
            valueLabelDisplay="auto"
            disabled={!image}
          />
        </Box>
      </Paper>
      
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3, justifyContent: 'center' }}>
        {image && (
          <Paper elevation={3} sx={{ p: 1 }}>
            <Typography variant="h6" align="center">Original</Typography>
            <Box
              component="img"
              src={image}
              alt="Original"
              sx={{ maxWidth: '100%', maxHeight: '400px', display: 'block' }}
            />
          </Paper>
        )}
        
        {processedImage && (
          <Paper elevation={3} sx={{ p: 1 }}>
            <Typography variant="h6" align="center">Result</Typography>
            <Box
              component="img"
              src={processedImage}
              alt="Processed"
              sx={{ maxWidth: '100%', maxHeight: '400px', display: 'block' }}
            />
          </Paper>
        )}
      </Box>
      
      <canvas ref={canvasRef} style={{ display: 'none' }} />
    </Container>
  );
}

export default App;