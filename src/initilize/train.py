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

input_dim = 4*99  # parts of the card * (number of cards - 1)

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

    Dense(4, activation='linear')
])

model.compile(
    optimizer=Adam(learning_rate=1e-3),
    loss='mse',
    metrics=['mae']
)

print(model.summary())

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

# train the model
def encode_card(card):
    """
    Replace with your encoding rules.
    Must return a numeric vector length FEATURES_PER_CARD.
    Example stub converts missing -> 0 and simple int casts.
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
    toughness = parse_int(card.get("toughness"))
    power = parse_int(card.get("power"))
    # type: very simple mapping; replace with proper categorical encoding
    type_map = {"Creature": 1, "Instant": 2, "Sorcery": 3, "Enchantment": 4, "Artifact": 5}
    typ = type_map.get(card.get("type"), 0)
    return [mana, toughness, power, typ]

def build_dataset(decks):
    X_list = []
    Y_list = []
    random.shuffle(decks)  # shuffle decks globally

    for deck in decks:
        cards = deck.get("cards", [])
        if not cards:
            continue
        random.shuffle(cards)
        # choose first card as target, rest as context
        target = cards[0]
        context = cards[1:]

        # encode target
        y_vec = encode_card(target)

        # build context vectors up to MAX_CARDS, pad with zeros if needed
        ctx_vectors = [encode_card(c) for c in context]
        if len(ctx_vectors) >= 99:
            ctx_vectors = ctx_vectors[:99]
        else:
            # pad with zeros
            pad_count = 99 - len(ctx_vectors)
            ctx_vectors.extend([[0]*4]*pad_count)

        # flatten to single vector
        x_vec = []
        for v in ctx_vectors:
            x_vec.extend(v)
        X_list.append(x_vec)
        Y_list.append(y_vec)

    X = np.array(X_list, dtype=np.float32)
    Y = np.array(Y_list, dtype=np.float32)
    return X, Y

with open("deck.json") as f:
    decks = json.load(f)
train_decks = decks[:int(len(decks)*0.8)]
test_decks = decks[int(len(decks)*0.8):]
X_train, Y_train = build_dataset(train_decks)
X_test, Y_test = build_dataset(test_decks)

model.fit(X_train, Y_train, epochs=10, batch_size=32, validation_data=(X_test, Y_test))

model.save("model.keras")


