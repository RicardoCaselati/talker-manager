const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs').promises;
const path = require('path');
const crypto = require('crypto');
const authenticated = require('./middleware/authentication');

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
  response.status(200).json(speakers);
});

app.get('/talker/:id', async (req, res) => {
  const speakers = JSON.parse(await fs.readFile(pathSpeakers, 'utf8'));
  const { params: { id } } = req;
  const index = speakers.findIndex((talker) => talker.id === Number(id));
  if (index < 0) {
    return res.status(404).json({ message: 'Pessoa palestrante não encontrada' });
  }
  res.status(200).json(speakers[index]);
});

app.post('/login', authenticated, async (req, res) => {
  function generateToken() {
    return crypto.randomBytes(8.5).toString('hex');
  }
  res.status(200).json({ token: generateToken() });
});

app.listen(PORT, () => {
  console.log('Online');
});
