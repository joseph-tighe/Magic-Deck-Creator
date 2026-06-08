const express = require("express");
const tf = require("@tensorflow/tfjs");
const fs = require("fs");
const path = require("path");
const app = express();
const port = 3000;
const log = require("./src/middleware/log");

app.use(log);
app.use(express.static(__dirname + "/public"));
app.use(express.json());

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/public/html/index.html");
});

const MODEL_DIR = path.join(__dirname, "public/models/creature");
let model = null;

async function loadModel() {
  const modelJson = JSON.parse(
    fs.readFileSync(path.join(MODEL_DIR, "model.json"), "utf-8")
  );
  const weightData = fs.readFileSync(
    path.join(MODEL_DIR, modelJson.weightsManifest[0].paths[0])
  );
  const weightSpecs = modelJson.weightsManifest[0].weights;
  model = await tf.loadLayersModel(
    tf.io.fromMemory(modelJson.modelTopology, weightSpecs, weightData)
  );
  console.log("Creature model loaded");
}

app.post("/api/predict/creature/", async (req, res) => {
  if (!model) {
    try {
      await loadModel();
    } catch (err) {
      return res.status(503).json({
        error: "Model not loaded.",
        steps: [
          "pip install tensorflowjs",
          "tensorflowjs_converter --input_format=keras model_creature.keras public/models/creature/",
        ],
        detail: err.message,
      });
    }
  }
  const tensor = tf.tensor(req.body);
  const prediction = model.predict(tensor);
  res.json(prediction.arraySync());
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
