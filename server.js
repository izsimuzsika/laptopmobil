const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const path = require('path');
const fs = require('fs');

const app = express();
app.use(bodyParser.json());
app.use(cookieParser());
app.use(express.static('public'));

const ADMIN_USER = 'Admin';
const ADMIN_PASS = 'Admin_okossarok2025!';
const SESSION_SECRET = 'véletlenstring_biztonságos';

function checkAuth(req, res, next) {
  if (req.cookies && req.cookies.session === SESSION_SECRET) {
    return next();
  }
  return res.status(401).send('Unauthorized');
}

app.post('/api/admin-login', (req, res) => {
  const { username, password } = req.body;
  if (username === ADMIN_USER && password === ADMIN_PASS) {
    res.cookie('session', SESSION_SECRET, { httpOnly: true, sameSite: 'Strict' });
    res.json({ success: true });
  } else {
    res.status(401).json({ success: false, message: 'Hibás adatok!' });
  }
});

app.get('/admin.html', checkAuth, (req, res) => {
  res.sendFile(path.join(__dirname, 'public/admin.html'));
});

app.use('/api/', (req, res, next) => {
  if (req.path === '/admin-login') return next();
  return checkAuth(req, res, next);
});

app.get('/api/list-files', (req, res) => {
  res.json(['index.html', 'szolgaltatasok.html']);
});
app.get('/api/load-file', (req, res) => {
  const name = req.query.name;
  fs.readFile(name, 'utf8', (err, data) => {
    if (err) return res.status(404).send('Nincs ilyen fájl');
    res.send(data);
  });
});
app.post('/api/save-file', (req, res) => {
  const { name, html } = req.body;
  fs.writeFile(name, html, err => {
    if (err) return res.status(500).send('Mentés hiba');
    res.send('OK');
  });
});

app.listen(3000, () => console.log('Szerver fut: http://localhost:3000'));
