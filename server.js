
const express = require('express');
const multer = require('multer');
const path = require('path');
const vision = require('@google-cloud/vision');

const app = express();
const client = new vision.ImageAnnotatorClient();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, callback) => {
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.mimetype)) {
      return callback(new Error('Only JPEG, PNG, or WebP images are allowed.'));
    }
    callback(null, true);
  }
});

// Display the HTML upload form
app.use(express.static(path.join(__dirname, 'public')));

// Protect text displayed in HTML
function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, char => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  })[char]);
}

// Receive image and send it to Google Cloud Vision
app.post('/analyze', upload.single('pic'), async (req, res) => {
  if (!req.file) {
    return res.status(400).send('Please select an image.');
  }

  try {
    // Send uploaded image bytes to Google Cloud Vision
    const [result] = await client.labelDetection({
      image: { content: req.file.buffer }
    });

    if (result.error) {
      throw new Error(result.error.message);
    }

    const labels = result.labelAnnotations || [];

    // Create the list of detected labels
    const labelItems = labels.map(label => {
      const confidence = ((label.score || 0) * 100).toFixed(1);

      return `
        <li>
          <strong>${escapeHtml(label.description || 'Unknown')}</strong>
          — ${confidence}% confidence
        </li>
      `;
    }).join('');

    // Send the HTML response to the browser
    res.send(`
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Image Analysis Results</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            max-width: 700px;
            margin: 50px auto;
            padding: 20px;
            background: #f5f7fb;
          }
          .results {
            background: white;
            padding: 25px;
            border-radius: 12px;
            box-shadow: 0 2px 10px #ddd;
          }
          li {
            padding: 10px;
            margin-bottom: 5px;
          }
          a { color: #1765c1; }
        </style>
      </head>
      <body>
        <div class="results">
          <h1>Google Cloud Vision Results</h1>
          <p>Image: ${escapeHtml(req.file.originalname)}</p>
          <h2>Detected Labels</h2>
          ${labels.length
            ? `<ul>${labelItems}</ul>`
            : '<p>No labels were detected.</p>'}
          <a href="/">Analyze another image</a>
        </div>
      </body>
      </html>
    `);

  } catch (error) {
    console.error('Vision API error:', error);
    res.status(500).send(
      '<h1>Image analysis failed</h1>' +
      '<p>Check the server Terminal for details.</p>' +
      '<a href="/">Try again</a>'
    );
  }
});

// Handle upload errors
app.use((err, req, res, next) => {
  console.error('Upload error:', err.message);
  res.status(400).send(
    `<h1>Upload failed</h1><p>${escapeHtml(err.message)}</p>` +
    '<a href="/">Try again</a>'
  );
});

const PORT = process.env.PORT || 8080;

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
