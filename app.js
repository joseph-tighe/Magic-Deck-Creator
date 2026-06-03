const express = require('express');
const app = express();
const port = 3000;
const log = require('./src/middleware/log');

app.use(log);

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});