class Card:
    def __init__(self, name, redCost, whiteCost, blueCost, greenCost, anyCost, type, attack, health, cost):
        self.name = name
        self.redCost = redCost
        self.whiteCost = whiteCost
        self.blueCost = blueCost
        self.greenCost = greenCost
        self.anyCost = anyCost
        self.type = type
        self.attack = attack
        self.health = health
        self.cost = cost

Types = {
    "Creature": 0,
    "Planeswalker": 1,
    "Instant": 2,
    "Sorcery": 3,
    "Artifact": 4,
    "Enchantment": 5,
    "Land": 6
}