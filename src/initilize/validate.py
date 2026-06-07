from keras.models import load_model
import json
import numpy as np
from sklearn.metrics import mean_absolute_error
from sklearn.metrics import mean_squared_error
import random
import matplotlib.pyplot as plt
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
"""
PLAN:
1. take all the decks and shuffle them after removing a random amount of cards
2. AI will guess the stats of the missing card or at least one of the cards
3. export the weights and use them to predict the stats of the missing card
4. validate
"""

# load the model
model = load_model("model.keras")

# split into train and test
with open("deck.json") as f:
    decks = json.load(f)
X_test, Y_test = build_dataset(decks)


# predict model is type sequential
print(model.summary())
Y_pred = model.predict(X_test)

# evaluate
mae = mean_absolute_error(Y_test, Y_pred)
mse = mean_squared_error(Y_test, Y_pred)
print("MAE: %.3f" % mae)
print("MSE: %.3f" % mse)

#plot scatter
print(Y_test.shape)
plt.scatter(Y_test, Y_pred)
plt.plot([Y_test.min(), Y_test.max()], [Y_test.min(), Y_test.max()], 'k--')
plt.show()