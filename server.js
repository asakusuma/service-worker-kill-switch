const express = require('express');
const rs = require('randomstring');
const fs = require('fs');
const app = express();

const html = fs.readFileSync('./index.html');
const sw = fs.readFileSync('./sw.js', 'utf8');
const noop = fs.readFileSync('./noop.js');

function generateVersion() {
  return rs.generate(5);
}

let version = generateVersion();
let killed = false;

function updateVersion() {
  version = generateVersion();
}

app.get('/', function (req, res) {
  res.set('Content-Type', 'text/html');
  res.send(html);
});

app.get('/update', function (req, res) {
  res.set('Content-Type', 'text/html');
  res.send('<html>Updated</html>');
  updateVersion();
});

app.get('/kill', function (req, res) {
  res.set('Content-Type', 'text/html');
  res.send('<html>Killed</html>');
  killed = true;
});

app.get('/unkill', function (req, res) {
  res.set('Content-Type', 'text/html');
  res.send('<html>Unkilled</html>');
  killed = false;
});

app.get('/pulse', function (req, res) {
  if (killed) {
    res.sendStatus(400);
  } else {
    res.sendStatus(200);
  }
});

app.get('/sw.js', function (req, res) {
  res.set('Content-Type', 'text/javascript');
  if (!killed) {
    res.send(sw.replace('%VERSION%', version));
  } else {
    res.send(noop);
  }
});

app.get('/asset.js', function (req, res) {
  res.set('Content-Type', 'text/javascript');
  res.send(`console.log('${version}')`);
});

app.listen(3000);