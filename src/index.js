const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs').promises;
const path = require('path');

const app = express();
app.use(bodyParser.json());
app.use(express.json());

const pathSpeakers = path.resolve(
  __dirname, 
  '..',  
  'src', 
  'talker.json',
);

const HTTP_OK_STATUS = 200;
const PORT = '3000';

// não remova esse endpoint, e para o avaliador funcionar
app.get('/', (_request, response) => {
  response.status(HTTP_OK_STATUS).send();
});

app.get('/talker', async (request, response) => {
  const speakers = JSON.parse(await fs.readFile(pathSpeakers, 'utf8'));
  console.log(speakers);
  response.status(200).json(speakers);
});

app.listen(PORT, () => {
  console.log('Online');
});
