const express = require('express');
const multer = require('multer');
const axios = require('axios');
const fs = require('fs'); // Add this line to import the fs module
const mime = require('mime-types');
const app = express();
const port = 3000;

const upload = multer({ dest: 'uploads/' });

const GROQ_API_KEY = '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';
const model = 'llama3-8b-8192';

app.use(express.static("static"));
app.use(express.json());

// Middleware to serve static files with correct MIME type

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/static/index.html');
});

// Serve the script.js file with the correct MIME type
app.get('/script.js', (req, res) => {

  const filePath = __dirname +  '/static/script.js';

  res.set('Content-Type', 'application/javascript');

  res.sendFile(filePath);

});

app.get('/YOUR_IMAGE.jpg', (req, res) => {
  const imagePath = __dirname +  '/static/YOUR_IMAGE.jpg';
  const imageStats = fs.statSync(imagePath);
  const fileSize = imageStats.size;
  const imageType = 'image/jpeg';  

  // Set the 'Content-Type' header with the correct MIME type
  res.setHeader('Content-Type', imageType);
  // Set the 'Content-Length' header with the file size
  res.setHeader('Content-Length', fileSize);
  // Pipe the image file to the response
  const imageStream = fs.createReadStream(imagePath);
  imageStream.pipe(res);
});

app.post('/completions', async (req, res) => {
  try {
    const query = req.body.query;
    if (!query) {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    const data = {
      messages: [{ role: 'user', content: query }],
      model,
    };

    const config = {
      headers: {
        Authorization: `Bearer ${GROQ_API_KEY}`,
        'Content-Type': 'application/json',
      },
    };

    const response = await axios.post('https://api.groq.com/openai/v1/chat/completions', data, config);
    res.json(response.data);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error completing prompt' });
  }
});

app.post('/upload', upload.single('image'), async (req, res) => {
  try {
    const image = fs.readFileSync(req.file.path, { encoding: 'base64' });

    const response = await axios({
      method: 'POST',
      url: 'https://detect.roboflow.com/aicook-lcv4d/3',
      params: {
        api_key: 'sUjqSPaNckOU5y5LdGjd'
      },
      data: image,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });

    res.send(response.data);
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
});

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
