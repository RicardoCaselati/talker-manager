const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs').promises;
const path = require('path');
const crypto = require('crypto');
const authenticated = require('./middleware/authentication');
const inputTalkRate = require('./middleware/inputTalkRate');
const validatePersonalData = require('./middleware/validatePersonalData');
const validateWatched = require('./middleware/validateWatchedAt');
const tokenAuth = require('./middleware/tokenAuth');

const pathSpeakers = path.resolve(
  __dirname,
  '..',
  'src',
  'talker.json',
);

const app = express();
app.use(bodyParser.json());

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

app.get('/talker/search', tokenAuth, async (req, res) => {
  const speakers = JSON.parse(await fs.readFile(pathSpeakers, 'utf8'));
  const { q } = req.query;
  if (!q || q === '') {
    return res.status(200).json(speakers);
  }
  const searchResult = speakers.filter((speaker) => speaker.name.includes(q));

  res.status(200).json(searchResult);
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

  const newToken = generateToken();
  process.env.TOKEN = newToken;

  res.status(200).json({ token: newToken });
});

app.post(
  '/talker',
  tokenAuth,
  validatePersonalData,
  validateWatched,
  inputTalkRate,

  async (req, res) => {
    let speakers = JSON.parse(await fs.readFile(pathSpeakers, 'utf8'));
    const id = speakers.length + 1;
    const { name, age, talk } = req.body;
    const inputedSpeaker = { name, age, id, talk };
    speakers = [...speakers, inputedSpeaker];
    await fs.writeFile(pathSpeakers, JSON.stringify(speakers), 'utf8');
    res.status(201).json(inputedSpeaker);
  },
);

app.put(
  '/talker/:id',
  tokenAuth,
  validatePersonalData,
  validateWatched,
  inputTalkRate,

  async (req, res) => {
    const { params: { id } } = req;
    const speakers = JSON.parse(await fs.readFile(pathSpeakers, 'utf8'));
    const index = speakers.findIndex((talker) => talker.id === Number(id));
    const { name, age, talk } = req.body;
    speakers[index].name = name;
    speakers[index].age = age;
    speakers[index].talk = talk;

    await fs.writeFile(pathSpeakers, JSON.stringify(speakers), 'utf8');
    res.status(200).json(speakers[index]);
  },
);

app.delete('/talker/:id', tokenAuth, async (req, res) => {
  let speakers = JSON.parse(await fs.readFile(pathSpeakers, 'utf8'));
  const { params: { id } } = req;
  const newSpeakers = () => speakers.filter((speaker) => speaker.id !== Number(id));
  speakers = [...newSpeakers()];
  console.log(newSpeakers());
  await fs.writeFile(pathSpeakers, JSON.stringify(speakers), 'utf8');
  res.status(204).json('');
});

app.listen(PORT, () => {
  console.log('Online');
});
