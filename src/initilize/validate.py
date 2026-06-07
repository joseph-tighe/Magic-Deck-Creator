from keras.models import load_model
import json
import numpy as np
from sklearn.metrics import mean_absolute_error
from sklearn.metrics import mean_squared_error
import random
import matplotlib.pyplot as plt

# Card type configuration
CARD_TYPES = {
    "Creature": {"output_dim": 3, "features": ["mana", "toughness", "power"]}
}

def encode_card(card, card_type):
    """
    Encode a card based on its type.
    For creatures: [mana, toughness, power]
    For other types: [mana, placeholder]
    """
    # manaCost: try to parse integer cost (fallback 0)
    try:
        mana = int(''.join(ch for ch in (card.get("manaCost") or "") if ch.isdigit()) or 0)
    except:
        mana = 0

    def parse_int(v):
        try:
            return int(v)
        except:
            return 0

    if card_type == "Creature":
        # Creatures have toughness and power
        toughness = parse_int(card.get("toughness"))
        power = parse_int(card.get("power"))
        return [mana, toughness, power]
    else:
        # Other types only have mana cost
        return [mana, 0]

def build_dataset(decks, card_type):
    """Build dataset for a specific card type, filtering cards appropriately."""
    X_list = []
    Y_list = []
    random.shuffle(decks)  # shuffle decks globally

    for deck in decks:
        cards = deck.get("cards", [])
        if not cards:
            continue
        
        # Filter cards by type
        filtered_cards = [c for c in cards if c.get("type") == card_type]
        if len(filtered_cards) < 2:
            continue
        
        random.shuffle(filtered_cards)
        # choose first card as target, rest as context
        target = filtered_cards[0]
        context = filtered_cards[1:]

        # encode target
        y_vec = encode_card(target, card_type)

        # build context vectors up to MAX_CARDS, pad with zeros if needed
        ctx_vectors = [encode_card(c, card_type) for c in context]
        features_per_card = len(ctx_vectors[0]) if ctx_vectors else 2
        
        if len(ctx_vectors) >= 99:
            ctx_vectors = ctx_vectors[:99]
        else:
            # pad with zeros
            pad_count = 99 - len(ctx_vectors)
            ctx_vectors.extend([[0]*features_per_card]*pad_count)

        # flatten to single vector
        x_vec = []
        for v in ctx_vectors:
            x_vec.extend(v)
        X_list.append(x_vec)
        Y_list.append(y_vec)

    if not X_list:
        return None, None
    
    X = np.array(X_list, dtype=np.float32)
    Y = np.array(Y_list, dtype=np.float32)
    return X, Y
"""
PLAN:
1. Load models for each card type
2. Validate against test decks
3. Display metrics for each card type
"""

# Load decks
with open("deck.json") as f:
    decks = json.load(f)

# Validate each card type
for card_type, config in CARD_TYPES.items():
    print(f"\n{'='*50}")
    print(f"Validating {card_type} model")
    print(f"{'='*50}")
    
    # Load the model
    model_name = f"model_{card_type.lower()}.keras"
    try:
        model = load_model(model_name)
    except FileNotFoundError:
        print(f"Model {model_name} not found, skipping...")
        continue
    
    # Build dataset for this card type
    X_test, Y_test = build_dataset(decks, card_type)
    
    if X_test is None or len(X_test) == 0:
        print(f"No test data for {card_type}, skipping...")
        continue
    
    print(f"Test samples: {len(X_test)}")
    print(model.summary())
    
    # Make predictions
    Y_pred = model.predict(X_test)
    
    # Evaluate
    mae = mean_absolute_error(Y_test, Y_pred)
    mse = mean_squared_error(Y_test, Y_pred)
    print(f"MAE: {mae:.3f}")
    print(f"MSE: {mse:.3f}")
    
    # Plot scatter plot
    plt.figure(figsize=(8, 6))
    for i in range(Y_test.shape[1]):
        plt.scatter(Y_test[:, i], Y_pred[:, i], alpha=0.5, label=f'Feature {i}')
    
    max_val = max(Y_test.max(), Y_pred.max())
    min_val = min(Y_test.min(), Y_pred.min())
    plt.plot([min_val, max_val], [min_val, max_val], 'k--', label='Perfect prediction')
    plt.xlabel('Actual')
    plt.ylabel('Predicted')
    plt.title(f'{card_type} Model Validation')
    plt.legend()
    plt.grid(True, alpha=0.3)
    plt.tight_layout()
    plt.show()
    print(f"Saved validation plot to validation_{card_type.lower()}.png")

print(f"\n{'='*50}")
print("Validation complete!")
print(f"{'='*50}")