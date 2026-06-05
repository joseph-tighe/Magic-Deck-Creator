import keras
import numpy as np
from keras.models import Sequential
from keras.layers import Dense

class Card:
    def __init__(self, name, manaCost, type, health, attack):
        self.name = name
        self.manaCost = manaCost
        self.type = type
        self.health = health
        self.attack = attack

Types = {
    "Creature": 0,
    "Planeswalker": 1,
    "Instant": 2,
    "Sorcery": 3,
    "Artifact": 4,
    "Enchantment": 5,
    "Land": 6
}

class Deck:
    def __init__(self, cards):
        self.cards = cards
    def getCards(self):
        return self.cards
    def getCost(self):
        cost = 0
        for card in self.cards:
            cost += card.manaCost
        return cost
    def removeCard(self, card):
        self.cards.remove(card)
    def addCard(self, card):
        self.cards.append(card)
    def removeCardsRandom(self, amount):
        for i in range(amount):
            self.removeCard(self.cards[np.random.randint(0, len(self.cards))])

"""
PLAN: 
AI to decide which cards to place in the deck
 train on previously made decks
 randomly take a random amount of cards from the deck
 have it guess the stats of the missing card
 CARDS stats:
 cost, type, health, and attack
"""

model = Sequential()
model.add(Dense(units=1, input_dim=5, activation='sigmoid'))
model.compile(loss='mean_squared_error', optimizer='adam')


