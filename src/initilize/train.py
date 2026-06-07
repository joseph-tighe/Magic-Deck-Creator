import keras
import numpy as np
from keras.models import Sequential
from keras.layers import Dense, BatchNormalization, Dropout
from keras.optimizers import Adam
import json
import random

"""
PLAN: 
AI to decide which cards to place in the deck
 train on previously made decks
 randomly take a random amount of cards from the deck
 have it guess the stats of the missing card
 CARDS stats:
 cost, type, health, and attack
"""

# Card type configuration
CARD_TYPES = {
    "Creature": {"output_dim": 3, "features": ["mana", "toughness", "power"]}
}

def build_model(input_dim, output_dim):
    """Build a neural network model for card prediction."""
    model = Sequential([
        Dense(512, activation='relu', input_shape=(input_dim,)),
        BatchNormalization(),
        Dropout(0.3),
        Dense(1024, activation='relu'),
        BatchNormalization(),
        Dropout(0.3),
        Dense(2049, activation='relu'),
        BatchNormalization(),
        Dropout(0.3),
        Dense(1024, activation='relu'),
        BatchNormalization(),
        Dropout(0.3),
        Dense(512, activation='relu'),
        BatchNormalization(),
        Dropout(0.3),
        Dense(256, activation='relu'),
        BatchNormalization(),
        Dropout(0.3),
        Dense(128, activation='relu'),
        BatchNormalization(),
        Dropout(0.2),
        Dense(64, activation='relu'),
        BatchNormalization(),
        Dropout(0.1),
        Dense(output_dim, activation='linear')
    ])

    model.compile(
        optimizer=Adam(learning_rate=1e-3),
        loss='mse',
        metrics=['mae']
    )
    return model

"""
Plan:
1. split decks into train and test
2. take all the decks and shuffle them after removing a random amount of cards
3. AI will guess the stats of the missing card or at least one of the cards
4. export the weights and use them to predict the stats of the missing card
5. validate
"""

# split into train and test
with open("deck.json", "r") as f:
    decks = json.load(f)
    train_decks = decks[:int(len(decks)*1)]
    test_decks = decks[int(len(decks)*0.8):]

# remove 1 card from each deck then shuffle
for deck in train_decks:
    cards = deck["cards"]
    random.shuffle(cards)
    deck["cards"] = cards

for deck in test_decks:
    cards = deck["cards"]
    random.shuffle(cards)
    deck["cards"] = cards

print("data shuffle complete")

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

with open("deck.json") as f:
    decks = json.load(f)

# Train a separate model for each card type
for card_type, config in CARD_TYPES.items():
    print(f"\n{'='*50}")
    print(f"Training model for {card_type} cards")
    print(f"{'='*50}")
    
    # Split decks for this card type
    train_decks = decks[:int(len(decks)*0.8)]
    test_decks = decks[int(len(decks)*0.8):]
    
    # Shuffle the decks
    for deck in train_decks:
        cards = deck["cards"]
        random.shuffle(cards)
        deck["cards"] = cards

    for deck in test_decks:
        cards = deck["cards"]
        random.shuffle(cards)
        deck["cards"] = cards
    
    # Build dataset for this card type
    X_train, Y_train = build_dataset(train_decks, card_type)
    X_test, Y_test = build_dataset(test_decks, card_type)
    
    # Skip if no training data for this type
    if X_train is None or len(X_train) == 0:
        print(f"No training data for {card_type}, skipping...")
        continue
    
    print(f"Training samples: {len(X_train)}, Test samples: {len(X_test)}")
    
    # Create and train model
    input_dim = X_train.shape[1]
    output_dim = config["output_dim"]
    
    model = build_model(input_dim, output_dim)
    print(f"Model architecture (output_dim={output_dim}):")
    print(model.summary())
    
    # Train the model
    model.fit(X_train, Y_train, epochs=10, batch_size=32, validation_data=(X_test, Y_test))
    
    # Save the model with type-specific name
    model_name = f"model_{card_type.lower()}.keras"
    model.save(model_name)
    print(f"Saved {model_name}")

print(f"\n{'='*50}")
print("All models trained successfully!")
print(f"{'='*50}")


