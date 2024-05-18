const express = require('express');
const multer = require('multer');
const axios = require('axios');
const fs = require('fs'); // Add this line to import the fs module
const app = express();
const port = 3000;

const upload = multer({ dest: 'uploads/' });

app.use(express.static("static"));

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/static/index.html');
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
