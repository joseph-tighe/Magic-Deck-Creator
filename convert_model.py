import tensorflow as tf
import json
import os
import numpy as np

model = tf.keras.models.load_model("model_creature.keras")
out_dir = "public/models/creature"
os.makedirs(out_dir, exist_ok=True)

# Get and fix model topology for TF.js compatibility
model_topology = json.loads(model.to_json())

def fix_layer_config(layer):
    cfg = layer["config"]
    if layer["class_name"] == "InputLayer":
        if "batch_shape" in cfg:
            cfg["batchInputShape"] = cfg.pop("batch_shape")
        if cfg.get("batchInputShape"):
            cfg["batchInputShape"][0] = 1
    return layer

model_topology["config"]["layers"] = [
    fix_layer_config(l) for l in model_topology["config"]["layers"]
]

# Collect weights using TF.js naming convention: layer_name/weight_name
weight_specs = []
weight_arrays = []
for layer in model.layers:
    layer_name = layer.name
    for w in layer.weights:
        arr = w.numpy()
        var_name = w.name.replace(layer_name + "/", "").replace(":0", "")
        name = f"{layer_name}/{var_name}"
        weight_specs.append({
            "name": name,
            "shape": list(arr.shape),
            "dtype": "float32",
        })
        weight_arrays.append(arr.tobytes())

weights_bytes = b"".join(weight_arrays)
with open(os.path.join(out_dir, "weights.bin"), "wb") as f:
    f.write(weights_bytes)

# Build model.json
model_data = {
    "modelTopology": model_topology,
    "weightsManifest": [{
        "paths": ["weights.bin"],
        "weights": weight_specs,
    }],
    "format": "layers-model",
    "generatedBy": "keras",
    "convertedBy": "manual",
}

with open(os.path.join(out_dir, "model.json"), "w") as f:
    json.dump(model_data, f, indent=2)

print(f"Model converted to {out_dir}")
print(f"Weight tensors: {len(weight_specs)}, bytes: {len(weights_bytes)}")
for ws in weight_specs[:6]:
    print(f"  {ws['name']}: {ws['shape']}")
if len(weight_specs) > 6:
    print(f"  ... and {len(weight_specs) - 6} more")
