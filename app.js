const express = require("express");
const app = express();
const port = 3000;
const log = require("./src/middleware/log");

app.use(log);

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/public/html/index.html");
});

app.get("/api/cards", (req, res) => {
  res.sendFile(__dirname + "/public/json/cards.json");
});

app.get("/api/cardImage/:id", (req, res) => {
  const { id } = req.params;
  res.sendFile(__dirname + `/public/assets/cards/${id}.jpg`);
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
